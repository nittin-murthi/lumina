import Feedback from "../models/Feedback";
import { NextFunction, Request, Response } from "express";
import { Client } from "langsmith";

export const submitFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { runId, score, comment } = req.body;
    console.log('Submitting feedback via backend:', { runId, score, comment });

    // Grab the user from session-auth middleware (if you want to require a valid session)
    const user = res.locals.user;
    if (!user) {
      return res.status(401).json({ message: "Not logged in or invalid session" });
    }

    // 1) Store feedback in your local MongoDB
    await Feedback.create({
      user_id: user._id,
      session_id: user.session_id,
      runId,
      score,
      comment,
    });

    // 2) Forward feedback to LangSmith
    const client = new Client();
    await client.createFeedback(runId, "user-rating", {
      score,
      comment,
      value: score,
    });

    console.log("LangSmith feedback submitted successfully");
    return res.status(200).json({
      message: "Feedback submitted successfully",
    });
  } catch (error: any) {
    console.error("Error in feedback controller:", {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      message: "Internal server error in feedback controller",
      error: error.message,
    });
  }
};
