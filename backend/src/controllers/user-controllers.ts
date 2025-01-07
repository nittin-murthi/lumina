import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { hash, compare } from 'bcrypt';
import { createToken } from "../utils/token-manager.js";
import { COOKIE_NAME } from "../utils/constants.js";



export const userSignup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      //user signup
      const { name, email, password } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(401).send("User already registered");
      const hashedPassword = await hash(password, 10);
      const user = new User({ name, email, password: hashedPassword });
      await user.save();
  
      // create token and store cookie
      res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        domain: process.env.NODE_ENV === "production" ? ".onrender.com" : "localhost",
        signed: true,
        path: "/",
      });
  
      const token = createToken(user._id.toString(), user.email, "7d");
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      res.cookie(COOKIE_NAME, token, {
        path: "/",
        domain: process.env.NODE_ENV === "production" ? ".onrender.com" : "localhost",
        expires,
        httpOnly: true,
        signed: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
      });
  
      return res
        .status(201)
        .json({ message: "OK", name: user.name, email: user.email });
    } catch (error) {
      console.log(error);
      return res.status(200).json({ message: "ERROR", cause: error.message });
    }
  };  

export const userLogin = async (
    req:Request, 
    res:Response, 
    next:NextFunction
) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(401).send("Account Does Not Exist")
        }
        const isPasswordCorrect = await compare(password, user.password);

        if(!isPasswordCorrect) {
            return res.status(403).send("Password and/or Email is incorrect");
        }

        res.clearCookie(COOKIE_NAME, {
          httpOnly: true,
          domain: process.env.NODE_ENV === "production" ? ".onrender.com" : "localhost",
          signed: true,
          path: "/",
        });

        const token = createToken(user._id.toString(), user.email, "7d");

        const expires = new Date();

        expires.setDate(expires.getDate() + 7);

        res.cookie(COOKIE_NAME, token, {
          path: "/",
          domain: process.env.NODE_ENV === "production" ? ".onrender.com" : "localhost",
          expires,
          httpOnly: true,
          signed: true,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          secure: process.env.NODE_ENV === "production",
        });

        return res.status(200).json({ message: "Successful", name: user.name, email: user.email });
    } catch (error) {
        console.log(error);
        return res.status(200).json({ message: "ERROR", cause:  error.message});
    }
};

export const getAllUsers = async (
    req:Request, 
    res:Response, 
    next:NextFunction
) => {
    try {
        const users = await User.find();
        return res.status(200).json({ message: "Works", users });
    } catch (error) {
        console.log(error);
        return res.status(200).json({ message: "ERROR", cause:  error.message});
    }
};

export const verifyUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      //user token check
      const user = await User.findById(res.locals.jwtData.id);
      if (!user) {
        return res.status(401).send("User not registered OR Token malfunctioned");
      }
      if (user._id.toString() !== res.locals.jwtData.id) {
        return res.status(401).send("Permissions didn't match");
      }
      return res
        .status(200)
        .json({ message: "OK", name: user.name, email: user.email });
    } catch (error) {
      console.log(error);
      return res.status(200).json({ message: "ERROR", cause: error.message });
    }
  };

  export const userLogout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      //user token check
      const user = await User.findById(res.locals.jwtData.id);
      if (!user) {
        return res.status(401).send("User not registered OR Token malfunctioned");
      }
      if (user._id.toString() !== res.locals.jwtData.id) {
        return res.status(401).send("Permissions didn't match");
      }
  
      res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        domain: process.env.NODE_ENV === "production" ? ".onrender.com" : "localhost",
        signed: true,
        path: "/",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
      });
  
      return res
        .status(200)
        .json({ message: "OK", name: user.name, email: user.email });
    } catch (error) {
      console.log(error);
      return res.status(200).json({ message: "ERROR", cause: error.message });
    }
  };