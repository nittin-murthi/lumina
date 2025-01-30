"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteChats = exports.sendChatsToUser = exports.generateChatCompletion = exports.upload = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const openai_1 = require("openai");
const rag_service_1 = require("../services/rag-service");
const ChatLog_1 = __importDefault(require("../models/ChatLog"));
// --- Azure OpenAI Config (store these in .env in production) ---
const endpoint = process.env.OPENAI_ENDPOINT;
const apiKey = process.env.OPENAI_API_KEY;
const apiVersion = process.env.OPENAI_API_VERSION;
const deploymentName = process.env.AZURE_DEPLOYMENT_NAME;
// 1) Configure Multer for image uploads
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = "uploads/";
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path_1.default.extname(file.originalname));
    },
});
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});
// 2) Helper function to get the Azure OpenAI client
function getAzureClient() {
    return new openai_1.AzureOpenAI({
        endpoint,
        apiKey,
        apiVersion,
        deployment: deploymentName,
    });
}
// 3) Helper: Get prior conversation from ChatLog
//    This fetches the user's past messages/responses and converts them to
//    ChatCompletionMessageParam format for Azure or your LLM.
async function getConversationContext(sessionId) {
    // Grab all logs by session_id, oldest first
    const allLogs = await ChatLog_1.default.find({ session_id: sessionId }).sort({ timestamp: 1 });
    // We assume each document has either a user OR assistant role, 
    // so we reconstruct them as role/content pairs. 
    // If your schema has separate fields "role" and "content", adapt accordingly.
    // 
    // If your schema has "message" (user) and "response" (assistant) in one doc,
    // you can split them into two role-based messages, skipping empty strings as needed.
    const conversation = [];
    for (const log of allLogs) {
        // if you store role in the log doc, you can do:
        // conversation.push({ role: log.role, content: log.content });
        // 
        // BUT if you're storing them in pairs (log.message = user, log.response = assistant)
        // then you can do:
        if (log.message) {
            conversation.push({
                role: "user",
                content: log.message,
            });
        }
        if (log.response) {
            conversation.push({
                role: "assistant",
                content: log.response,
            });
        }
    }
    return conversation;
}
// 4) Controller: Generate Chat Completion
const generateChatCompletion = async (req, res, next) => {
    try {
        // The session-auth middleware sets res.locals.user
        const user = res.locals.user;
        if (!user) {
            return res.status(401).json({ message: "No valid session" });
        }
        // Verify the user actually has a session
        const sessionId = user.session_id;
        if (!sessionId) {
            return res.status(401).json({ message: "User does not have an active session" });
        }
        const { message } = req.body;
        const imageFile = req.file;
        // 1) Build conversation context from existing ChatLogs
        const historicalMessages = await getConversationContext(sessionId);
        let assistantResponse = "";
        // If an image was uploaded, handle image-based input via Azure
        if (imageFile) {
            const imageBuffer = fs_1.default.readFileSync(imageFile.path);
            const base64Image = imageBuffer.toString("base64");
            const imageUrl = `data:${imageFile.mimetype};base64,${base64Image}`;
            // We'll create a final user message that includes the text + image content
            const messageContent = [
                {
                    type: "text",
                    text: message || "What do you see in this image?",
                },
                {
                    type: "image_url",
                    image_url: {
                        url: imageUrl,
                        detail: "high",
                    },
                },
            ];
            // Add the new user message to the historical
            historicalMessages.push({
                role: "user",
                content: messageContent,
            });
            // Build the system message. If you want to keep a single system message, you can prepend it always:
            const systemMessage = {
                role: "system",
                content: "You are a helpful assistant that can see and analyze images. Provide accurate insights about any images shared.",
            };
            const client = getAzureClient();
            const chatResponse = await client.chat.completions.create({
                messages: [systemMessage, ...historicalMessages],
                model: deploymentName,
                max_tokens: 4000,
                temperature: 0.7,
            });
            // Extract the assistant's response
            assistantResponse = chatResponse.choices[0]?.message?.content || "";
            // Clean up the file
            fs_1.default.unlinkSync(imageFile.path);
        }
        else {
            // 2) Text-based input with RAG
            // Insert the new user message into conversation
            historicalMessages.push({
                role: "user",
                content: message,
            });
            // Actually call your Python-based RAG for the user's new message
            const ragResponse = await (0, rag_service_1.getRagResponse)(message);
            if (ragResponse.error) {
                return res.status(500).json({ message: "RAG agent error", error: ragResponse.error });
            }
            assistantResponse = ragResponse.output;
        }
        // 3) Store the conversation result in ChatLog
        //    We create TWO docs: one for the user's message, one for assistant's response
        //    so we can reconstruct them later.
        //    If you want to store them in a single doc, that's also possible, but less flexible.
        if (message) {
            await ChatLog_1.default.create({
                user_id: user._id,
                session_id: sessionId,
                message, // user message
                response: "", // no immediate response
            });
        }
        if (assistantResponse) {
            await ChatLog_1.default.create({
                user_id: user._id,
                session_id: sessionId,
                message: "", // no user content here
                response: assistantResponse,
            });
        }
        // 4) Return the AI response
        return res.status(200).json({
            message: "Success",
            assistantResponse,
        });
    }
    catch (error) {
        console.error("Error generating chat completion:", error);
        return res.status(500).json({ message: "Something went wrong", cause: error.message });
    }
};
exports.generateChatCompletion = generateChatCompletion;
// 5) Controller: Send Chats to User
const sendChatsToUser = async (req, res, next) => {
    try {
        const user = res.locals.user;
        if (!user) {
            return res.status(401).json({ message: "No valid session" });
        }
        const sessionId = user.session_id;
        if (!sessionId) {
            return res.status(401).json({ message: "No session_id found on user" });
        }
        // Get all logs for this session
        const logs = await ChatLog_1.default.find({ session_id: sessionId }).sort({ timestamp: 1 });
        return res.status(200).json({
            message: "OK",
            logs,
        });
    }
    catch (error) {
        console.error("Error sending chats to user:", error);
        return res.status(500).json({ message: "Something went wrong", cause: error.message });
    }
};
exports.sendChatsToUser = sendChatsToUser;
// 6) Controller: Delete Chats
const deleteChats = async (req, res, next) => {
    try {
        const user = res.locals.user;
        if (!user) {
            return res.status(401).json({ message: "No valid session" });
        }
        const sessionId = user.session_id;
        if (!sessionId) {
            return res.status(401).json({ message: "No session_id found on user" });
        }
        // Delete all chat logs for this session
        await ChatLog_1.default.deleteMany({ session_id: sessionId });
        return res.status(200).json({ message: "All chat logs deleted" });
    }
    catch (error) {
        console.error("Error deleting chats:", error);
        return res.status(500).json({ message: "Something went wrong", cause: error.message });
    }
};
exports.deleteChats = deleteChats;
//# sourceMappingURL=chat-controllers.js.map