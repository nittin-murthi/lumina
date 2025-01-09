"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteChats = exports.sendChatsToUser = exports.generateChatCompletion = exports.upload = void 0;
const User_js_1 = __importDefault(require("../models/User.js"));
const openai_1 = require("openai");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const rag_service_1 = require("../services/rag-service");
const endpoint = "https://invite-instance-openai.openai.azure.com";
const apiKey = "a3babad21aee482798891f0e56f538f4";
const apiVersion = "2024-02-15-preview";
const deploymentName = "gpt4-o";
// Configure multer for image uploads
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path_1.default.extname(file.originalname));
    }
});
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});
// Helper function to get the Azure OpenAI client
function getAzureClient() {
    return new openai_1.AzureOpenAI({
        endpoint,
        apiKey,
        apiVersion,
        deployment: deploymentName,
    });
}
// Controller for generating chat completions
const generateChatCompletion = async (req, res, next) => {
    const { message } = req.body;
    const imageFile = req.file;
    try {
        const user = await User_js_1.default.findById(res.locals.jwtData.id);
        if (!user)
            return res
                .status(401)
                .json({ message: "User not registered OR Token malfunctioned" });
        let assistantResponse;
        let messageContent;
        if (imageFile) {
            // Handle image-based input using Azure OpenAI
            const imageBuffer = fs_1.default.readFileSync(imageFile.path);
            const base64Image = imageBuffer.toString('base64');
            const imageUrl = `data:${imageFile.mimetype};base64,${base64Image}`;
            messageContent = [
                {
                    type: "text",
                    text: message || "What do you see in this image?"
                },
                {
                    type: "image_url",
                    image_url: {
                        url: imageUrl,
                        detail: "high"
                    }
                }
            ];
            // Use Azure OpenAI for image analysis
            const systemMessage = {
                role: "system",
                content: "You are a helpful assistant that can see and analyze images. Provide detailed, accurate descriptions and insights about any images shared."
            };
            const chats = user.chats.map(({ role, content }) => ({
                role,
                content: Array.isArray(content) ? content : [{ type: "text", text: content }],
            }));
            const newMessage = {
                role: "user",
                content: messageContent
            };
            const allMessages = [systemMessage, ...chats, newMessage];
            const messages = {
                messages: allMessages,
                model: deploymentName,
                max_tokens: 4000,
                temperature: 0.7,
            };
            const client = getAzureClient();
            const chatResponse = await client.chat.completions.create(messages);
            assistantResponse = chatResponse.choices[0].message.content;
            // Clean up the uploaded file
            fs_1.default.unlinkSync(imageFile.path);
        }
        else {
            // Handle text-based input using RAG agent
            messageContent = message;
            const ragResponse = await (0, rag_service_1.getRagResponse)(message);
            if (ragResponse.error) {
                return res.status(500).json({ message: "RAG agent error", error: ragResponse.error });
            }
            assistantResponse = ragResponse.output;
        }
        // Save the conversation to user's chats
        user.chats.push({
            role: "user",
            content: messageContent
        });
        user.chats.push({
            role: "assistant",
            content: assistantResponse
        });
        await user.save();
        return res.status(200).json({ chats: user.chats });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};
exports.generateChatCompletion = generateChatCompletion;
// Controller for sending chats to the user
const sendChatsToUser = async (req, res, next) => {
    try {
        const user = await User_js_1.default.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).send("User not registered OR Token malfunctioned");
        }
        if (user._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).send("Permissions didn't match");
        }
        return res.status(200).json({ message: "OK", chats: user.chats });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong", cause: error.message });
    }
};
exports.sendChatsToUser = sendChatsToUser;
// Controller for deleting chats
const deleteChats = async (req, res, next) => {
    try {
        const user = await User_js_1.default.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).send("User not registered OR Token malfunctioned");
        }
        if (user._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).send("Permissions didn't match");
        }
        user.chats.splice(0, user.chats.length);
        await user.save();
        return res.status(200).json({ message: "OK" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong", cause: error.message });
    }
};
exports.deleteChats = deleteChats;
//# sourceMappingURL=chat-controllers.js.map