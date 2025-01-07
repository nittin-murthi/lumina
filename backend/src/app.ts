import express from "express";
import { config } from "dotenv";
import morgan from "morgan";
import appRouter from "./routes/index";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { existsSync } from 'fs';

config();
const app = express();

// Get the project root directory - going up one level from backend to reach project root
const projectRoot = path.resolve(process.cwd(), '..');

console.log('Current NODE_ENV:', process.env.NODE_ENV);
console.log('Current directory:', projectRoot);

// Define allowed origins
const allowedOrigins = [
  'http://localhost:5001',
  'http://localhost:5173',
  'https://lumina-1.onrender.com'
];

app.use(cors({ 
    origin: function(origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if(!origin) return callback(null, true);
        
        if(allowedOrigins.indexOf(origin) === -1){
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true 
}));

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(morgan("dev"));

// API routes
app.use("/api/v1", appRouter);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
    // Serve static files from frontend build directory
    const frontendBuildPath = path.join(projectRoot, 'frontend/dist');
    console.log('Frontend build path:', frontendBuildPath);
    console.log('Does path exist?', existsSync(frontendBuildPath));
    
    app.use(express.static(frontendBuildPath));

    // Handle client-side routing by serving index.html for all non-API routes
    app.get('*', (req, res) => {
        const indexPath = path.join(frontendBuildPath, 'index.html');
        console.log('Trying to serve index.html from:', indexPath);
        console.log('Does index.html exist?', existsSync(indexPath));
        res.sendFile(indexPath);
    });
}

export default app;