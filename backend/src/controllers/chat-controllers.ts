import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { AzureOpenAI } from "openai";
import type {
  ChatCompletionCreateParamsNonStreaming,
} from "openai/resources/index";
import { Types } from "mongoose";

const endpoint = "https://invite-instance-openai.openai.azure.com";
const apiKey = "a3babad21aee482798891f0e56f538f4";
const apiVersion = "2024-02-15-preview";
const deploymentName = "gpt4-o";

// Helper function to get the Azure OpenAI client
function getAzureClient(): AzureOpenAI {
  return new AzureOpenAI({
    endpoint,
    apiKey,
    apiVersion,
    deployment: deploymentName,
  });
}

type ChatCompletionRequestMessage = {
    role: "system" | "user" | "assistant";
    content: string;
  };

// Controller for generating chat completions
export const generateChatCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { message } = req.body;
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user)
      return res
        .status(401)
        .json({ message: "User not registered OR Token malfunctioned" });

    // Retrieve user's chat history
    const chats = user.chats.map(({ role, content }) => ({
      role,
      content,
    })) as ChatCompletionRequestMessage[];
    chats.push({ content: message, role: "user" });
    user.chats.push({ content: message, role: "user" });

    // Create messages for Azure OpenAI
    const messages: ChatCompletionCreateParamsNonStreaming = {
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