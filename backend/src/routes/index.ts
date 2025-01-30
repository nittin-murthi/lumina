import { Router } from "express";
import userRoutes from "./user-routes";
import chatRoutes from "./chat-routes";
import feedbackRoutes from "./feedback-routes";

const appRouter = Router();

// Mount each route group under its own path
appRouter.use("/user", userRoutes);
appRouter.use("/chat", chatRoutes);
appRouter.use("/feedback", feedbackRoutes);

export default appRouter;
