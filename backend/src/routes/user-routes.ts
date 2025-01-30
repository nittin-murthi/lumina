import { Router } from "express";
import {
  userSignup,
  userLogin,
  verifyUserSession,
  userLogout,
  getAllUsers,
} from "../controllers/user-controllers";
import { verifySession } from "../middlewares/session-auth";

const userRoutes = Router();

// --- Public Routes ---
userRoutes.post("/signup", userSignup);
userRoutes.post("/login", userLogin);

// --- Protected Routes ---
userRoutes.get("/auth-status", verifySession, verifyUserSession);
userRoutes.get("/logout", verifySession, userLogout);

// For debugging or admin usage, also protected:
userRoutes.get("/all", verifySession, getAllUsers);

export default userRoutes;
