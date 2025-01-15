import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { AzureOpenAI } from "openai";
import type {
  ChatCompletionContentPart,
  ChatCompletionMessageParam,
  ChatCompletionCreateParamsNonStreaming,
} from "openai/resources/index";
import { Types } from "mongoose";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getRagResponse } from "../services/rag-service";

const endpoint = "https://invite-instance-openai.openai.azure.com";
const apiKey = "a3babad21aee482798891f0e56f538f4";
const apiVersion = "2024-02-15-preview";
const deploymentName = "gpt4-o";

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Helper function to get the Azure OpenAI client
function getAzureClient(): AzureOpenAI {
  return new AzureOpenAI({
    endpoint,
    apiKey,
    apiVersion,
    deployment: deploymentName,
  });
}

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Controller for generating chat completions
export const generateChatCompletion = async (
  req: MulterRequest,
  res: Response,
  next: NextFunction
) => {
  const { message } = req.body;
  const imageFile = req.file;
  
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user)
      return res
        .status(401)
        .json({ message: "User not registered OR Token malfunctioned" });

    let assistantResponse: string;
    let messageContent: string | ChatCompletionContentPart[];

    if (imageFile) {
      // Handle image-based input using Azure OpenAI
      const imageBuffer = fs.readFileSync(imageFile.path);
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
      const systemMessage: ChatCompletionMessageParam = {
        role: "system",
        content: "You are a helpful assistant that can see and analyze images. Provide detailed, accurate descriptions and insights about any images shared."
      };

      const chats = user.chats.map(({ role, content }) => ({
        role,
        content: Array.isArray(content) ? content : [{ type: "text", text: content }],
      })) as ChatCompletionMessageParam[];

      const newMessage: ChatCompletionMessageParam = {
        role: "user",
        content: messageContent
      };
      
      const allMessages = [systemMessage, ...chats, newMessage];

      const messages: ChatCompletionCreateParamsNonStreaming = {
        messages: allMessages,
        model: deploymentName,
        max_tokens: 4000,
        temperature: 0.7,
      };

      const client = getAzureClient();
      const chatResponse = await client.chat.completions.create(messages);
      assistantResponse = chatResponse.choices[0].message.content;
      
      // Clean up the uploaded file
      fs.unlinkSync(imageFile.path);
    } else {
      // Handle text-based input using RAG agent
      messageContent = message;
      const ragResponse = await getRagResponse(message);
      
      if (ragResponse.error) {
        return res.status(500).json({ message: "RAG agent error", error: ragResponse.error });
      }
      
      assistantResponse = ragResponse.output;

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

      return res.status(200).json({ 
        chats: user.chats,
        metadata: {
          last_run_id: ragResponse.run_id
        }
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Controller for sending chats to the user
export const sendChatsToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    return res.status(200).json({ message: "OK", chats: user.chats });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong", cause: error.message });
  }
};

// Controller for deleting chats
export const deleteChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    
    (user.chats as unknown as Types.DocumentArray<any>).splice(0, user.chats.length);
    
    await user.save();
    
    return res.status(200).json({ message: "OK" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong", cause: error.message });
  }
};