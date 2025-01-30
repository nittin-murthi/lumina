import { Router } from "express";
import { verifySession } from "../middlewares/session-auth";
import {
  generateChatCompletion,
  sendChatsToUser,
  deleteChats,
  upload,
} from "../controllers/chat-controllers";

const chatRoutes = Router();

// 1) Create a new chat message, optionally with an image
chatRoutes.post(
  "/new",
  verifySession,
  upload.single("image"),
  generateChatCompletion
);

// 2) Get all chats for the user’s current session
chatRoutes.get("/all-chats", verifySession, sendChatsToUser);

// 3) Delete all chats for the user’s current session
chatRoutes.delete("/delete", verifySession, deleteChats);

export default chatRoutes;
