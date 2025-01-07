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
(0, dotenv_1.config)();
const app = (0, express_1.default)();
// Get the project root directory - going up one level from backend to reach project root
const projectRoot = path_1.default.resolve(process.cwd(), '..');
console.log('Current NODE_ENV:', process.env.NODE_ENV);
console.log('Current directory:', projectRoot);
// Define allowed origins
const allowedOrigins = [
    'http://localhost:5001',
    'http://localhost:5173',
    'https://lumina-1.onrender.com'
];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
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
    app.use(express_1.default.static(frontendBuildPath));
    // Handle all other routes by serving the index.html
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.join(frontendBuildPath, 'index.html'));
    });
}
exports.default = app;
//# sourceMappingURL=app.js.map