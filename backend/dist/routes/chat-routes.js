"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const session_auth_1 = require("../middlewares/session-auth");
const chat_controllers_1 = require("../controllers/chat-controllers");
const chatRoutes = (0, express_1.Router)();
// 1) Create a new chat message, optionally with an image
chatRoutes.post("/new", session_auth_1.verifySession, chat_controllers_1.upload.single("image"), chat_controllers_1.generateChatCompletion);
// 2) Get all chats for the user’s current session
chatRoutes.get("/all-chats", session_auth_1.verifySession, chat_controllers_1.sendChatsToUser);
// 3) Delete all chats for the user’s current session
chatRoutes.delete("/delete", session_auth_1.verifySession, chat_controllers_1.deleteChats);
exports.default = chatRoutes;
//# sourceMappingURL=chat-routes.js.map