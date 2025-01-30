"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.userLogout = exports.verifyUserSession = exports.userLogin = exports.userSignup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const User_1 = __importDefault(require("../models/User"));
// 1) Register / Signup
const userSignup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Check if user already exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already registered" });
        }
        // Hash the password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Create a new user
        const newUser = new User_1.default({
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
    }
    catch (error) {
        console.error("Error in signup process:", error);
        return res.status(500).json({ message: "Error", cause: error.message });
    }
};
exports.userSignup = userSignup;
// 2) Login
const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check if user exists
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Account does not exist" });
        }
        // Compare password
        const isPasswordCorrect = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(403).json({ message: "Incorrect password" });
        }
        // Generate a new session_id
        const sessionId = (0, uuid_1.v4)();
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
    }
    catch (error) {
        console.error("Error in login process:", error);
        return res.status(500).json({ message: "Error", cause: error.message });
    }
};
exports.userLogin = userLogin;
// 3) Verify user session
const verifyUserSession = async (req, res) => {
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
    }
    catch (error) {
        console.error("Error verifying user session:", error);
        return res.status(500).json({ message: "Error", cause: error.message });
    }
};
exports.verifyUserSession = verifyUserSession;
// 4) Logout
const userLogout = async (req, res) => {
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
    }
    catch (error) {
        console.error("Error in logout process:", error);
        return res.status(500).json({ message: "Error", cause: error.message });
    }
};
exports.userLogout = userLogout;
// 5) (Optional) Get all users - for debugging or admin usage
const getAllUsers = async (req, res) => {
    try {
        const users = await User_1.default.find({});
        return res.status(200).json({
            message: "Success",
            users: users.map((u) => ({
                userId: u._id,
                name: u.name,
                email: u.email,
                session_id: u.session_id,
            })),
        });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ message: "Error", cause: error.message });
    }
};
exports.getAllUsers = getAllUsers;
//# sourceMappingURL=user-controllers.js.map