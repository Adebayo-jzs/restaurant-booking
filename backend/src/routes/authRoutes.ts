import { Router } from "express";
import { registerUser, loginUser, getMe } from "../controllers/authController";
import { authMiddleware } from "../middleware/auth";


const authRoutes = Router();

authRoutes.post("/register", registerUser);
authRoutes.post("/login", loginUser);
authRoutes.get("/me", authMiddleware, getMe);

export default authRoutes;