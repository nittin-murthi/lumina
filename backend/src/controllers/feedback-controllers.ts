import { NextFunction, Request, Response } from "express";

export const submitFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { runId, score, comment } = req.body;
    console.log('Submitting feedback via backend:', { runId, score, comment });

    // Dynamically import langsmith
    const { Client } = await import('langsmith');
    const client = new Client();
    await client.createFeedback(runId, "user-rating", {
      score,
      comment,
    });

    return res.status(200).json({ message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return res.status(500).json({ message: "Failed to submit feedback", error });
  }
}; 