import { Request, Response, NextFunction } from "express";
import User from "../models/User";

// Example: we read sessionId from an HTTP header called "x-session-id".
// Alternatively, you could read it from a cookie or query string.
export async function verifySession(req: Request, res: Response, next: NextFunction) {
  try {
    // 1) Extract sessionId from custom header
    const sessionId = req.header("x-session-id");

    if (!sessionId) {
      return res.status(401).json({ message: "No sessionId provided" });
    }

    // 2) Look up user by session_id
    const user = await User.findOne({ session_id: sessionId });
    if (!user) {
      return res.status(401).json({ message: "Invalid session" });
    }

    // 3) Attach user to res.locals for downstream controllers
    res.locals.user = user;

    // 4) Continue to next middleware or route handler
    return next();
  } catch (error: any) {
    console.error("Error verifying session:", error);
    return res.status(500).json({ message: "Server error", cause: error.message });
  }
}
