import { NextFunction, Request, Response } from "express";
import axios from "axios";

export const submitFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { runId, score, comment } = req.body;
    console.log('Submitting feedback via backend:', { runId, score, comment });

    const apiKey = process.env.LANGCHAIN_API_KEY;
    const endpoint = process.env.LANGCHAIN_ENDPOINT || 'https://api.smith.langchain.com';

    await axios.post(
      `${endpoint}/feedback`,
      {
        run_id: runId,
        key: "user-rating",
        score: score,
        comment: comment,
        value: score,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    return res.status(200).json({ message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return res.status(500).json({ message: "Failed to submit feedback", error });
  }
}; 