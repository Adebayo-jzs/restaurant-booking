import prisma from "../config/prisma";
import { hashRefreshToken } from "./jwtService";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const storeRefreshToken = async (userId: string, rawToken: string) => {
    return prisma.refreshToken.create({
        data: {
            tokenHash: hashRefreshToken(rawToken),
            userId,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        },
    });
};

export const findValidRefreshToken = async (rawToken: string) => {
    const tokenHash = hashRefreshToken(rawToken);
    const record = await prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!record || record.revokedAt || record.expiresAt < new Date()) {
        return null;
    }
    return record;
};

export const revokeRefreshToken = async (rawToken: string) => {
    const tokenHash = hashRefreshToken(rawToken);
    await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { revokedAt: new Date() },
    });
};

export const revokeAllUserRefreshTokens = async (userId: string) => {
    await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
    });
};