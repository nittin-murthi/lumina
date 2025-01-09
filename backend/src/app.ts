import express from "express";
import { config } from "dotenv";
import morgan from "morgan";
import appRouter from "./routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { checkPythonEnvironment } from "./services/rag-service";
import path from "path";

console.log("Starting server initialization...");
config();
const app = express();

// Production domain
const PROD_DOMAIN = "lumina-2.onrender.com";
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`Domain configured as: ${process.env.NODE_ENV === "production" ? `https://${PROD_DOMAIN}` : "http://localhost:5173"}`);

//middlewares
console.log("Setting up middleware...");
app.use(cors({ 
  origin: process.env.NODE_ENV === "production" ? `https://${PROD_DOMAIN}` : "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
console.log("CORS middleware configured with credentials and custom headers");

app.use(express.json());
console.log("JSON parsing middleware enabled");

app.use(cookieParser(process.env.COOKIE_SECRET));
console.log("Cookie parser middleware configured with secret");

app.use(morgan("dev"));
console.log("Morgan logging middleware enabled");

// API routes
console.log("Setting up API routes...");
app.use("/api/v1", appRouter);
console.log("API routes mounted at /api/v1");

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  console.log("Production mode detected, setting up static file serving...");
  const frontendBuildPath = path.resolve(process.cwd(), '../frontend/dist');
  console.log(`Frontend build path: ${frontendBuildPath}`);
  app.use(express.static(frontendBuildPath));
  console.log("Static file middleware configured");
  
  // Serve index.html for all routes except /api
  app.get('*', (req, res) => {
    console.log(`Received request for: ${req.url}`);
    if (!req.url.startsWith('/api')) {
      console.log(`Serving index.html for non-API route: ${req.url}`);
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    }
  });
  console.log("Catch-all route handler configured for SPA");
}

// Check Python environment on startup
console.log("Checking Python environment...");
checkPythonEnvironment().then((isReady) => {
  if (!isReady) {
    console.error("WARNING: Python environment is not properly configured. RAG agent functionality may not work.");
    console.error("Please check Python installation and required packages.");
  } else {
    console.log("SUCCESS: Python environment is properly configured for RAG agent.");
    console.log("All Python dependencies are available and correctly installed.");
  }
});

console.log("Server initialization complete.");
export default app;