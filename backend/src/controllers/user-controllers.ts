import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { hash, compare } from 'bcrypt';
import { createToken } from "../utils/token-manager.js";
import { COOKIE_NAME } from "../utils/constants.js";

const PROD_DOMAIN = "lumina-2.onrender.com";

export const userSignup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("Starting user signup process...");
      const { name, email, password } = req.body;
      console.log(`Attempting to create new user: ${email}`);
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log(`Signup failed: Email ${email} is already registered`);
        return res.status(401).send("User already registered");
      }
      
      console.log("Hashing password...");
      const hashedPassword = await hash(password, 10);
      console.log("Password hashed successfully");
      
      const user = new User({ name, email, password: hashedPassword });
      await user.save();
      console.log(`New user created successfully: ${email}`);
  
      // create token and store cookie
      console.log("Clearing any existing cookies...");
      res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        domain: process.env.NODE_ENV === "production" ? PROD_DOMAIN : "localhost",
        signed: true,
        path: "/",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
      });
      console.log("Existing cookies cleared");
  
      console.log("Generating authentication token...");
      const token = createToken(user._id.toString(), user.email, "7d");
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      console.log(`Token generated, expires: ${expires}`);

      console.log("Setting authentication cookie...");
      res.cookie(COOKIE_NAME, token, {
        path: "/",
        domain: process.env.NODE_ENV === "production" ? PROD_DOMAIN : "localhost",
        expires,
        httpOnly: true,
        signed: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
      });
      console.log("Authentication cookie set successfully");
  
      console.log("Signup process completed successfully");
      return res
        .status(201)
        .json({ message: "OK", name: user.name, email: user.email });
    } catch (error) {
      console.error("Error in signup process:", error);
      console.error("Stack trace:", error.stack);
      return res.status(200).json({ message: "ERROR", cause: error.message });
    }
  };  

export const userLogin = async (
    req:Request, 
    res:Response, 
    next:NextFunction
) => {
    try {
        console.log("Starting login process...");
        const { email, password } = req.body;
        console.log(`Attempting login for user: ${email}`);

        const user = await User.findOne({ email });
        if(!user) {
            console.log(`Login failed: No account found for email ${email}`);
            return res.status(401).send("Account Does Not Exist");
        }
        console.log("User found in database");

        console.log("Verifying password...");
        const isPasswordCorrect = await compare(password, user.password);

        if(!isPasswordCorrect) {
            console.log(`Login failed: Incorrect password for user ${email}`);
            return res.status(403).send("Password and/or Email is incorrect");
        }
        console.log("Password verified successfully");

        console.log("Clearing existing cookies...");
        res.clearCookie(COOKIE_NAME, {
          httpOnly: true,
          domain: process.env.NODE_ENV === "production" ? PROD_DOMAIN : "localhost",
          signed: true,
          path: "/",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          secure: process.env.NODE_ENV === "production",
        });
        console.log("Existing cookies cleared");

        console.log("Generating new authentication token...");
        const token = createToken(user._id.toString(), user.email, "7d");
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        console.log(`Token generated, expires: ${expires}`);

        console.log("Setting authentication cookie...");
        res.cookie(COOKIE_NAME, token, {
          path: "/",
          domain: process.env.NODE_ENV === "production" ? PROD_DOMAIN : "localhost",
          expires,
          httpOnly: true,
          signed: true,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          secure: process.env.NODE_ENV === "production",
        });
        console.log("Authentication cookie set successfully");

        console.log(`Login successful for user: ${email}`);
        return res.status(200).json({ message: "Successful", name: user.name, email: user.email });
    } catch (error) {
        console.error("Error in login process:", error);
        console.error("Stack trace:", error.stack);
        return res.status(200).json({ message: "ERROR", cause: error.message});
    }
};

export const verifyUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("Starting user verification process...");
      console.log(`Verifying user ID: ${res.locals.jwtData.id}`);

      const user = await User.findById(res.locals.jwtData.id);
      if (!user) {
        console.log(`Verification failed: No user found with ID ${res.locals.jwtData.id}`);
        return res.status(401).send("User not registered OR Token malfunctioned");
      }
      console.log("User found in database");

      if (user._id.toString() !== res.locals.jwtData.id) {
        console.log("Verification failed: User ID mismatch");
        console.log(`Database ID: ${user._id.toString()}`);
        console.log(`Token ID: ${res.locals.jwtData.id}`);
        return res.status(401).send("Permissions didn't match");
      }
      console.log("User verification completed successfully");

      return res
        .status(200)
        .json({ message: "OK", name: user.name, email: user.email });
    } catch (error) {
      console.error("Error in user verification process:", error);
      console.error("Stack trace:", error.stack);
      return res.status(200).json({ message: "ERROR", cause: error.message });
    }
  };

  export const userLogout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("Starting logout process...");
      console.log(`Attempting to logout user ID: ${res.locals.jwtData.id}`);

      const user = await User.findById(res.locals.jwtData.id);
      if (!user) {
        console.log(`Logout failed: No user found with ID ${res.locals.jwtData.id}`);
        return res.status(401).send("User not registered OR Token malfunctioned");
      }
      console.log("User found in database");

      if (user._id.toString() !== res.locals.jwtData.id) {
        console.log("Logout failed: User ID mismatch");
        console.log(`Database ID: ${user._id.toString()}`);
        console.log(`Token ID: ${res.locals.jwtData.id}`);
        return res.status(401).send("Permissions didn't match");
      }
  
      console.log("Clearing authentication cookie...");
      res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        domain: process.env.NODE_ENV === "production" ? PROD_DOMAIN : "localhost",
        signed: true,
        path: "/",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
      });
      console.log("Authentication cookie cleared successfully");
  
      console.log(`Logout successful for user: ${user.email}`);
      return res
        .status(200)
        .json({ message: "OK", name: user.name, email: user.email });
    } catch (error) {
      console.error("Error in logout process:", error);
      console.error("Stack trace:", error.stack);
      return res.status(200).json({ message: "ERROR", cause: error.message });
    }
  };

export const getAllUsers = async (
    req:Request, 
    res:Response, 
    next:NextFunction
) => {
    try {
        console.log("Fetching all users...");
        const users = await User.find();
        console.log(`Successfully retrieved ${users.length} users`);
        return res.status(200).json({ message: "Works", users });
    } catch (error) {
        console.error("Error fetching users:", error);
        console.error("Stack trace:", error.stack);
        return res.status(200).json({ message: "ERROR", cause: error.message});
    }
};