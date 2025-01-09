import express from "express";
import { config } from "dotenv";
import morgan from "morgan";
import appRouter from "./routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { checkPythonEnvironment } from "./services/rag-service";
import path from "path";

config();
const app = express();

//middlewares
app.use(cors({ origin: process.env.NODE_ENV === "production" ? "https://lumina-1.onrender.com" : "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(morgan("dev"));

// API routes
app.use("/api/v1", appRouter);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const frontendBuildPath = path.resolve(process.cwd(), '../frontend/dist');
  app.use(express.static(frontendBuildPath));
  
  // Serve index.html for all routes except /api
  app.get('*', (req, res) => {
    if (!req.url.startsWith('/api')) {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    }
  });
}

// Check Python environment on startup
checkPythonEnvironment().then((isReady) => {
  if (!isReady) {
    console.error("Warning: Python environment is not properly configured. RAG agent functionality may not work.");
  } else {
    console.log("Python environment is properly configured for RAG agent.");
  }
});

export default app;