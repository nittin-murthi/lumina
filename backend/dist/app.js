"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const morgan_1 = __importDefault(require("morgan"));
const index_1 = __importDefault(require("./routes/index"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
(0, dotenv_1.config)();
const app = (0, express_1.default)();
// Get the project root directory - going up one level from backend to reach project root
const projectRoot = path_1.default.resolve(process.cwd(), '..');
console.log('Current NODE_ENV:', process.env.NODE_ENV);
console.log('Current directory:', projectRoot);
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === "production"
        ? [process.env.FRONTEND_URL || ""]
        : ["http://localhost:5001", "http://localhost:5173"],
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET));
app.use((0, morgan_1.default)("dev"));
// API routes
app.use("/api/v1", index_1.default);
// Serve frontend in production
if (process.env.NODE_ENV === "production") {
    // Serve static files from frontend build directory
    const frontendBuildPath = path_1.default.join(projectRoot, 'frontend/dist');
    console.log('Frontend build path:', frontendBuildPath);
    console.log('Does path exist?', (0, fs_1.existsSync)(frontendBuildPath));
    app.use(express_1.default.static(frontendBuildPath));
    // Handle client-side routing by serving index.html for all non-API routes
    app.get('*', (req, res) => {
        const indexPath = path_1.default.join(frontendBuildPath, 'index.html');
        console.log('Trying to serve index.html from:', indexPath);
        console.log('Does index.html exist?', (0, fs_1.existsSync)(indexPath));
        res.sendFile(indexPath);
    });
}
exports.default = app;
//# sourceMappingURL=app.js.map