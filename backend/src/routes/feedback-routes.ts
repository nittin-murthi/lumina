import { Router } from "express";
import { verifySession } from "../middlewares/session-auth";
import { submitFeedback } from "../controllers/feedback-controllers";

const feedbackRoutes = Router();

// Submit user feedback
feedbackRoutes.post("/submit", verifySession, submitFeedback);

export default feedbackRoutes;
