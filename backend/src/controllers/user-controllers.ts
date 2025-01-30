import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import User from "../models/User";

// 1) Register / Signup
export const userSignup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      session_id: null, // Will be set at login time
    });

    await newUser.save();

    return res.status(201).json({
      message: "User registered successfully",
      userId: newUser._id,
      email: newUser.email,
      name: newUser.name,
    });
  } catch (error: any) {
    console.error("Error in signup process:", error);
    return res.status(500).json({ message: "Error", cause: error.message });
  }
};

// 2) Login
export const userLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Account does not exist" });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(403).json({ message: "Incorrect password" });
    }

    // Generate a new session_id
    const sessionId = uuid();
    user.session_id = sessionId;
    await user.save();

    // Return session_id to client
    return res.status(200).json({
      message: "Login successful",
      sessionId: sessionId,
      userId: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error: any) {
    console.error("Error in login process:", error);
    return res.status(500).json({ message: "Error", cause: error.message });
  }
};

// 3) Verify user session
export const verifyUserSession = async (req: Request, res: Response) => {
  try {
    // sessionAuth middleware sets res.locals.user if valid
    const user = res.locals.user;
    if (!user) {
      return res.status(401).json({ message: "Invalid session or user not found" });
    }

    return res.status(200).json({
      message: "Session is valid",
      userId: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error: any) {
    console.error("Error verifying user session:", error);
    return res.status(500).json({ message: "Error", cause: error.message });
  }
};

// 4) Logout
export const userLogout = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(401).json({ message: "User not found in session" });
    }

    // Clear session_id
    user.session_id = null;
    await user.save();

    return res.status(200).json({
      message: "Logout successful",
      userId: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error: any) {
    console.error("Error in logout process:", error);
    return res.status(500).json({ message: "Error", cause: error.message });
  }
};

// 5) (Optional) Get all users - for debugging or admin usage
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({});
    return res.status(200).json({
      message: "Success",
      users: users.map((u) => ({
        userId: u._id,
        name: u.name,
        email: u.email,
        session_id: u.session_id,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Error", cause: error.message });
  }
};
