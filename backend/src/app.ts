import express from "express";
import { config } from "dotenv";
import morgan from "morgan";
import appRouter from "./routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { checkPythonEnvironment } from "./services/rag-service";

config();
const app = express();

//middlewares
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(morgan("dev"));

app.use("/api/v1", appRouter);

// Check Python environment on startup
checkPythonEnvironment().then((isReady) => {
  if (!isReady) {
    console.error("Warning: Python environment is not properly configured. RAG agent functionality may not work.");
  } else {
    console.log("Python environment is properly configured for RAG agent.");
  }
});

export default app;