"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const morgan_1 = __importDefault(require("morgan"));
const index_js_1 = __importDefault(require("./routes/index.js"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const rag_service_1 = require("./services/rag-service");
const path_1 = __importDefault(require("path"));
console.log("Starting server initialization...");
(0, dotenv_1.config)();
const app = (0, express_1.default)();
// Production domain
const PROD_DOMAIN = "lumina-2.onrender.com";
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`Domain configured as: ${process.env.NODE_ENV === "production" ? `https://${PROD_DOMAIN}` : "http://localhost:5173"}`);
//middlewares
console.log("Setting up middleware...");
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === "production" ? `https://${PROD_DOMAIN}` : "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
console.log("CORS middleware configured with credentials and custom headers");
app.use(express_1.default.json());
console.log("JSON parsing middleware enabled");
app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET));
console.log("Cookie parser middleware configured with secret");
app.use((0, morgan_1.default)("dev"));
console.log("Morgan logging middleware enabled");
// API routes
console.log("Setting up API routes...");
app.use("/api/v1", index_js_1.default);
console.log("API routes mounted at /api/v1");
// Serve static files in production
if (process.env.NODE_ENV === "production") {
    console.log("Production mode detected, setting up static file serving...");
    const frontendBuildPath = path_1.default.resolve(process.cwd(), '../frontend/dist');
    console.log(`Frontend build path: ${frontendBuildPath}`);
    app.use(express_1.default.static(frontendBuildPath));
    console.log("Static file middleware configured");
    // Serve index.html for all routes except /api
    app.get('*', (req, res) => {
        console.log(`Received request for: ${req.url}`);
        if (!req.url.startsWith('/api')) {
            console.log(`Serving index.html for non-API route: ${req.url}`);
            res.sendFile(path_1.default.join(frontendBuildPath, 'index.html'));
        }
    });
    console.log("Catch-all route handler configured for SPA");
}
// Check Python environment on startup
console.log("Checking Python environment...");
(0, rag_service_1.checkPythonEnvironment)().then((isReady) => {
    if (!isReady) {
        console.error("WARNING: Python environment is not properly configured. RAG agent functionality may not work.");
        console.error("Please check Python installation and required packages.");
    }
    else {
        console.log("SUCCESS: Python environment is properly configured for RAG agent.");
        console.log("All Python dependencies are available and correctly installed.");
    }
});
console.log("Server initialization complete.");
exports.default = app;
//# sourceMappingURL=app.js.map