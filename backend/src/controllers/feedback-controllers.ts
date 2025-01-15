import { NextFunction, Request, Response } from "express";
import { Client } from "langsmith";

export const submitFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { runId, score, comment } = req.body;
    console.log('Submitting feedback via backend:', { runId, score, comment });

    const client = new Client();
    
    // Submit feedback using the LangSmith SDK
    await client.createFeedback(
      runId,
      "user-rating",
      {
        score: score,
        comment: comment,
        value: score,
      }
    );

    console.log('LangSmith feedback submitted successfully');
    return res.status(200).json({ 
      message: "Feedback submitted successfully"
    });
  } catch (error: any) {
    console.error("Error in feedback controller:", {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({ 
      message: "Internal server error in feedback controller",
      error: error.message
    });
  }
} 