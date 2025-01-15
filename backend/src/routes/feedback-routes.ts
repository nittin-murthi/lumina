import { Router } from "express";
import { verifyToken } from "../utils/token-manager.js";
import { submitFeedback } from "../controllers/feedback-controllers.js";

const feedbackRoutes = Router();
feedbackRoutes.post("/submit", verifyToken, submitFeedback);

export default feedbackRoutes; 