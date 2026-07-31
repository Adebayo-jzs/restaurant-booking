
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET environment variable is not set");

interface TokenPayload {
    id: string;
    role: string;
}

// Short-lived access token (unchanged logic, shorter default)
export const generateAccessToken = (payload: TokenPayload, expiresIn: SignOptions['expiresIn'] = '15m') => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Refresh token: random opaque string, NOT a JWT — simpler to revoke, nothing to "decode"
export const generateRefreshToken = () => {
    return crypto.randomBytes(40).toString('hex');
};

export const hashRefreshToken = (token: string) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};