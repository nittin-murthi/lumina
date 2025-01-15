import { Router } from "express"
import userRoutes from "./user-routes.js";
import chatRoutes from "./chat-routes.js";
import feedbackRoutes from "./feedback-routes.js";

const appRouter = Router();

appRouter.use("/user", userRoutes);
appRouter.use("/chat", chatRoutes);
appRouter.use("/feedback", feedbackRoutes);

export default appRouter;