import prisma from "../config/prisma";
import { hashPassword, comparePassword } from "../services/hashService";
import { generateToken } from "../services/jwtService";
import { Request, Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth";

// ─── Validation Schemas ──────────────────────────────────────────────────────

const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["USER", "ADMIN", "OWNER"]).default("USER"),
});

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

// ─── Cookie Config ───────────────────────────────────────────────────────────

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};


// Remove the password from the user object before sending it in a response.
// We never want to expose the hashed password to the client.
function sanitizeUser(user: Record<string, unknown>) {
    const { password, ...userWithoutPassword } = user; // pull out password, keep everything else
    return userWithoutPassword;
}


function handleError(res: Response, error: unknown): Response {
    if (error instanceof z.ZodError) {
        return res.status(400).json({
            success: false,
            error: "Validation failed",
            details: error.issues,
        });
    }
    console.error("[AuthController]", error);
    return res.status(500).json({
        success: false,
        message: "An unexpected error occurred. Please try again.",
    });
}

// ─── Controllers ─────────────────────────────────────────────────────────────

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = registerSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(409).json({ success: false, message: "An account with this email already exists." });
            return;
        }

        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, role },
        });

        res.status(201).json({
            success: true,
            message: "Account created successfully.",
            data: sanitizeUser(user),
        });
    } catch (error) {
        handleError(res, error);
    }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email } });
        const isPasswordValid = (user && user.password) ? await comparePassword(password, user.password) : false;

        // Constant-time-style response to prevent user enumeration
        if (!user || !isPasswordValid) {
            res.status(401).json({ success: false, message: "Invalid email or password." });
            return;
        }

        const token = generateToken({ id: user.id, role: user.role });
        res.cookie("token", token, COOKIE_OPTIONS);

        res.status(200).json({
            success: true,
            message: "Login successful.",
            token,                       // for mobile / non-browser clients
            data: sanitizeUser(user),
        });
    } catch (error) {
        handleError(res, error);
    }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: sanitizeUser(user),
        });
    } catch (error) {
        handleError(res, error);
    }
};