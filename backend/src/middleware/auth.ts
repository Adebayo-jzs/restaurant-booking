import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../services/jwtService";

// The shape of the data we store inside the JWT token
interface JwtPayload {
    id: string;
    role: string;
}

export const normalizeRole = (role?: string | null): string => {
    const normalized = role?.trim().toUpperCase();

    if (normalized === "OWNER") return "OWNER";
    if (normalized === "ADMIN") return "ADMIN";
    return "CUSTOMER";
};

// Extend Express's Request type so route handlers can access req.user
export interface AuthRequest extends Request {
    user?: JwtPayload;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.accessToken;
    const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : cookieToken;

    if (!token) {
        res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
        return;
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === "string") {
        res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
        return;
    }

    // Attach the user info to the request for use in route handlers
    req.user = {
        id: (decoded as JwtPayload).id,
        role: normalizeRole((decoded as JwtPayload).role),
    };

    next();
};

export const optionalAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.accessToken;
    const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : cookieToken;

    if (!token) {
        return next(); // No token, proceed as guest
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === "string") {
        return next(); // Invalid token, proceed as guest
    }

    // Attach the user info if the token is valid
    req.user = {
        id: (decoded as JwtPayload).id,
        role: normalizeRole((decoded as JwtPayload).role),
    };

    next();
};

export const requireRole = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: "Forbidden: you do not have permission to access this resource",
            });
            return;
        }

        next();
    };
};

// Shorthand middlewares — cleaner to use in routes than requireRole("ADMIN") each time
export const adminOnly = requireRole("ADMIN");
export const ownerOnly = requireRole("OWNER");
export const adminOrOwner = requireRole("ADMIN", "OWNER");