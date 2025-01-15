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

    const baseEndpoint = process.env.LANGCHAIN_ENDPOINT || 'https://api.smith.langchain.com';
    const endpoint = `${baseEndpoint}/api/v1`;

    console.log('Using LangSmith endpoint:', endpoint);
    console.log('Request payload:', {
      run_id: runId,
      key: "user-rating",
      score: score,
      comment: comment,
      value: score,
    });
    
    try {
      const response = await axios.post(
        `${endpoint}/runs/${runId}/feedback`,
        {
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

      console.log('LangSmith API response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
      return res.status(200).json({ message: "Feedback submitted successfully" });
    } catch (apiError: any) {
      console.error('LangSmith API error details:', {
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        data: apiError.response?.data,
        message: apiError.message,
        config: {
          url: apiError.config?.url,
          method: apiError.config?.method,
          headers: apiError.config?.headers,
          data: apiError.config?.data
        }
      });
      return res.status(500).json({ 
        message: "Failed to submit feedback to LangSmith",
        error: {
          status: apiError.response?.status,
          data: apiError.response?.data,
          message: apiError.message,
        }
      });
    }
  } catch (error: any) {
    console.error("Error in feedback controller:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      type: error.type,
      fullError: JSON.stringify(error, null, 2)
    });
    return res.status(500).json({ 
      message: "Internal server error in feedback controller",
      error: error.message
    });
  }
}; 