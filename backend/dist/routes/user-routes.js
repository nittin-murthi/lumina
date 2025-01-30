"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controllers_1 = require("../controllers/user-controllers");
const session_auth_1 = require("../middlewares/session-auth");
const userRoutes = (0, express_1.Router)();
// --- Public Routes ---
userRoutes.post("/signup", user_controllers_1.userSignup);
userRoutes.post("/login", user_controllers_1.userLogin);
// --- Protected Routes ---
userRoutes.get("/verify-session", session_auth_1.verifySession, user_controllers_1.verifyUserSession);
userRoutes.get("/logout", session_auth_1.verifySession, user_controllers_1.userLogout);
// For debugging or admin usage, also protected:
userRoutes.get("/all", session_auth_1.verifySession, user_controllers_1.getAllUsers);
exports.default = userRoutes;
//# sourceMappingURL=user-routes.js.map