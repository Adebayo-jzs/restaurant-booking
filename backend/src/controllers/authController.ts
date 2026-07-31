import { hashPassword, comparePassword } from "../services/hashService";
import { generateAccessToken, generateRefreshToken } from "../services/jwtService";
import {
    storeRefreshToken,
    findValidRefreshToken,
    revokeRefreshToken,
    revokeAllUserRefreshTokens,
} from "../services/refreshTokenService";
import { findUserByEmail, findUserById,createUser, updateUserPassword, updateUserVerification, updateUserOtp } from "../services/user.service";
import { Request, Response, type CookieOptions } from "express";
import { z } from "zod";
import { AuthRequest, normalizeRole } from "../middleware/auth";
import { sendVerificationEmail } from "../services/email.service";

// ─── Validation Schemas ──────────────────────────────────────────────────────

const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

const passwordResetSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

// ─── Cookie Config ───────────────────────────────────────────────────────────

const ACCESS_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 15 * 60 * 1000, // 15 min
};

const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/auth/refresh", // scope the cookie so it's only sent to the refresh endpoint
};


// Remove sensitive fields from the user object before sending it in a response.
function sanitizeUser(user: Record<string, unknown>) {
    const { password, verificationToken, verificationTokenExpires, isVerified, ...safeUser } = user;

    if (typeof safeUser.role === "string") {
        safeUser.role = normalizeRole(safeUser.role);
    }

    return safeUser;
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

        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            res.status(409).json({ success: false, message: "An account with this email already exists." });
            return;
        }

        const hashedPassword = await hashPassword(password);
        const normalizedRole = normalizeRole(role);
        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

        const user = await createUser({ name, email, password: hashedPassword, role: normalizedRole, verificationToken: otp, verificationTokenExpires: expiresAt });

        sendVerificationEmail(email, name, otp).catch(err => console.error("Email sending failed in background:", err));

        res.status(201).json({
            success: true,
            message: "Account created successfully. Please check your email for the verification code.",
            data: sanitizeUser(user),
        });
    } catch (error) {
        handleError(res, error);
    }
};
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp } = req.body;

        const user = await findUserByEmail(email);

        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        if (user.isVerified) {
            res.status(400).json({ success: false, message: "User is already verified" });
            return;
        }

        if (
            user.verificationToken !== otp || 
            !user.verificationTokenExpires || 
            user.verificationTokenExpires < new Date()
        ) {
            res.status(400).json({ success: false, message: "Invalid or expired verification code" });
            return;
        }

        await updateUserVerification(user.id);

        res.status(200).json({ success: true, message: "Email successfully verified!" });
    } catch (error) {
        handleError(res, error);
    }
};

export const resendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ success: false, message: "Email is required" });
            return;
        }

        const user = await findUserByEmail(email);

        if (!user) {
            // Return success to prevent email enumeration
            res.status(200).json({ success: true, message: "If your email is registered, a new verification code has been sent." });
            return;
        }

        if (user.isVerified) {
            res.status(400).json({ success: false, message: "Account is already verified." });
            return;
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        await updateUserOtp(user.id, otp, expiresAt);

        sendVerificationEmail(email, user.name, otp).catch(err => console.error("Email resend failed:", err));

        res.status(200).json({ success: true, message: "If your email is registered, a new verification code has been sent." });
    } catch (error) {
        handleError(res, error);
    }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await findUserByEmail(email);
        const isPasswordValid = (user && user.password) ? await comparePassword(password, user.password) : false;

        if (!user || !isPasswordValid) {
            res.status(401).json({ success: false, message: "Invalid email or password." });
            return;
        }

        const accessToken = generateAccessToken({ id: user.id, role: normalizeRole(user.role) });
        const refreshToken = generateRefreshToken();
        await storeRefreshToken(user.id, refreshToken);

        res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
        res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

        res.status(200).json({
            success: true,
            message: "Login successful.",
            accessToken,
            data: sanitizeUser(user),
        });
    } catch (error) {
        handleError(res, error);
    }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const user = await findUserById(req.user.id);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
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

export const passwordReset = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const { currentPassword, newPassword } = passwordResetSchema.parse(req.body);

        const existingUser = await findUserById(req.user.id);
        if (!existingUser || !existingUser.password) {
            res.status(403).json({ success: false, message: "You do not have a password" });
            return;
        }

        const isCurrentValid = await comparePassword(currentPassword, existingUser.password);
        if (!isCurrentValid) {
            res.status(401).json({ success: false, message: "Current password is incorrect" });
            return;
        }

        const newHashedPassword = await hashPassword(newPassword);
        await updateUserPassword(req.user.id, newHashedPassword);
        await revokeAllUserRefreshTokens(req.user.id);
        res.status(200).json({ success: true, message: "Password updated successfully." });
    } catch (error) {
        handleError(res, error);
    }
};


export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const rawToken = req.cookies?.refreshToken || req.body?.refreshToken;
        if (!rawToken) {
            res.status(401).json({ success: false, message: "No refresh token provided." });
            return;
        }

        const record = await findValidRefreshToken(rawToken);
        if (!record) {
            res.status(401).json({ success: false, message: "Invalid or expired refresh token." });
            return;
        }

        const user = await findUserById(record.userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found." });
            return;
        }

        // Rotation: revoke old, issue new
        await revokeRefreshToken(rawToken);
        const newRefreshToken = generateRefreshToken();
        await storeRefreshToken(user.id, newRefreshToken);

        const newAccessToken = generateAccessToken({ id: user.id, role: normalizeRole(user.role) });

        res.cookie("accessToken", newAccessToken, ACCESS_COOKIE_OPTIONS);
        res.cookie("refreshToken", newRefreshToken, REFRESH_COOKIE_OPTIONS);

        res.status(200).json({ success: true, accessToken: newAccessToken });
    } catch (error) {
        handleError(res, error);
    }
};

export const logoutUser = async (req: Request, res: Response): Promise<void> => {
    const rawToken = req.cookies?.refreshToken;

    if (!rawToken) {
        res.clearCookie("accessToken", ACCESS_COOKIE_OPTIONS);
        res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
        res.status(401).json({ success: false, message: "Session does not exist" });
        return;
    }

    await revokeRefreshToken(rawToken);
    res.clearCookie("accessToken", ACCESS_COOKIE_OPTIONS);
    res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
    res.status(200).json({ success: true, message: "Logged out successfully." });
};