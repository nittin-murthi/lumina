"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteChats = exports.sendChatsToUser = exports.generateChatCompletion = void 0;
const User_js_1 = __importDefault(require("../models/User.js"));
const openai_1 = require("openai");
const endpoint = "https://invite-instance-openai.openai.azure.com";
const apiKey = "a3babad21aee482798891f0e56f538f4";
const apiVersion = "2024-02-15-preview";
const deploymentName = "gpt4-o";
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
    try {
        const user = await User_js_1.default.findById(res.locals.jwtData.id);
        if (!user)
            return res
                .status(401)
                .json({ message: "User not registered OR Token malfunctioned" });
        // Retrieve user's chat history
        const chats = user.chats.map(({ role, content }) => ({
            role,
            content,
        }));
        chats.push({ content: message, role: "user" });
        user.chats.push({ content: message, role: "user" });
        // Create messages for Azure OpenAI
        const messages = {
            messages: chats,
            model: deploymentName,
            max_tokens: 1000,
            temperature: 0.7,
        };
        // Use Azure OpenAI client to get the response
        const client = getAzureClient();
        const chatResponse = await client.chat.completions.create(messages);
        // Save the response message to user's chats
        const assistantMessage = chatResponse.choices[0].message;
        user.chats.push(assistantMessage);
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