import { Router } from "express";
import rateLimit from "express-rate-limit";
import { registerUser, loginUser, getMe, passwordReset, refreshAccessToken, logoutUser, verifyEmail, resendVerificationEmail } from "../controllers/authController";
import { authMiddleware } from "../middleware/auth";
import { googleRedirect, googleCallback } from "../controllers/authController";

const authRoutes = Router();

const authLimiter = rateLimit({ 
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true, 
    legacyHeaders: false, 
    message: { success: false, message: "Too many requests, please try again later." }
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account and sends a 6-digit OTP verification email.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 description: User role. Use CUSTOMER for regular users or OWNER for restaurant owners.
 *                 example: CUSTOMER
 *     responses:
 *       201:
 *         description: Account created successfully. Please check your email for the verification code.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Account created successfully. Please check your email for the verification code.
 *                 data:
 *                   $ref: '#/components/schemas/User'
 */
authRoutes.post("/register", authLimiter, registerUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: calmsp0+owner1@gmail.com
 *               password:
 *                 type: string
 *                 example: passwword
 *     responses:
 *       200:
 *         description: Login successful
 */
authRoutes.post("/login", authLimiter, loginUser);

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Redirect to Google OAuth consent screen
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects to Google's login page
 */
authRoutes.get("/google", googleRedirect);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback (do not call directly)
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirects to frontend after successful authentication
 */
authRoutes.get("/google/callback", googleCallback);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
authRoutes.get("/me", authMiddleware, getMe);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset the current user's password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 */
authRoutes.post("/reset-password", authMiddleware, authLimiter, passwordReset);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token issued
 */
authRoutes.post("/refresh", refreshAccessToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout the current user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
authRoutes.post("/logout", logoutUser);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify a user's email with an OTP code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid OTP or already verified
 *       404:
 *         description: User not found
 */
authRoutes.post("/verify-email", authLimiter, verifyEmail);

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Resend verification OTP code to user's email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification email sent
 *       400:
 *         description: Email is required or user is already verified
 */
authRoutes.post("/resend-verification", authLimiter, resendVerificationEmail);

export default authRoutes;