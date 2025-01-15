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
    if (!apiKey) {
      console.error('LANGCHAIN_API_KEY is not set');
      return res.status(500).json({ message: "LangChain API key is not configured" });
    }

    // Validate API key format
    if (!apiKey.startsWith('lsv2_')) {
      console.error('Invalid API key format - should start with lsv2_');
      return res.status(500).json({ message: "Invalid LangSmith API key format" });
    }

    const baseEndpoint = process.env.LANGCHAIN_ENDPOINT || 'https://api.smith.langchain.com';
    console.log('Using API endpoint:', baseEndpoint);
    console.log('API Key prefix:', apiKey.substring(0, 8) + '...');

    // Test authentication first
    try {
      const authTest = await axios.get(
        `${baseEndpoint}/api/v1/projects`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      );
      console.log('Authentication test successful');
    } catch (authError: any) {
      console.error('Authentication failed:', {
        status: authError.response?.status,
        data: authError.response?.data
      });
      return res.status(401).json({
        message: "LangSmith authentication failed. Please check your API key.",
        error: authError.response?.data
      });
    }

    // If authentication successful, proceed with feedback submission
    try {
      const response = await axios.post(
        `${baseEndpoint}/api/v1/feedback`,
        {
          run_id: runId,
          key: "user-rating",
          score: score,
          comment: comment,
          value: score,
          feedback_source: "user"
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      );

      console.log('LangSmith API response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      return res.status(200).json({ 
        message: "Feedback submitted successfully",
        data: response.data
      });
    } catch (apiError: any) {
      console.error('LangSmith API error details:', {
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        data: apiError.response?.data,
        message: apiError.message
      });
      return res.status(apiError.response?.status || 500).json({ 
        message: "Failed to submit feedback to LangSmith",
        error: apiError.response?.data || apiError.message
      });
    }
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
}; 