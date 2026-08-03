// services/userService.ts
import { Prisma } from "@prisma/client";
import prisma from "../config/prisma";

export const findUserByEmail = async (email: string) => {
    return prisma.user.findUnique({ where: { email } });
};

export const findUserById = async (id: string) => {
    return prisma.user.findUnique({ where: { id } });
};

export const createUser = async (data: Prisma.UserUncheckedCreateInput) => {
    return prisma.user.create({ data });
};

export const updateUserPassword = async (id: string, hashedPassword: string) => {
    return prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
    });
};

export const updateUserVerification = async (id: string) => {
    return prisma.user.update({
        where: { id },
        data: {
            isVerified: true,
            verificationToken: null,
            verificationTokenExpires: null,
        }
    });
};

export const updateUserOtp = async (id: string, otp: string, expiresAt: Date) => {
    return prisma.user.update({
        where: { id },
        data: {
            verificationToken: otp,
            verificationTokenExpires: expiresAt
        }
    });
};

// Add this to the bottom of src/services/user.service.ts

export const findOrCreateGoogleUser = async (profile: {
    googleId: string;
    email: string;
    name: string;
    picture: string | null;
    emailVerified: boolean;
}) => {
    // 1. Check if a user with this googleId already exists (returning user)
    let user = await prisma.user.findUnique({
        where: { googleId: profile.googleId },
    });
    if (user) return user;

    // 2. Check if a user with this email exists but signed up with email/password
    //    Link the Google account to the existing user
    user = await prisma.user.findUnique({
        where: { email: profile.email },
    });
    if (user) {
        return prisma.user.update({
            where: { id: user.id },
            data: {
                googleId: profile.googleId,
                avatarUrl: profile.picture || user.avatarUrl,
                isVerified: true, // Google already verified their email
            },
        });
    }

    // 3. Brand new user — create account
    return prisma.user.create({
        data: {
            name: profile.name,
            email: profile.email,
            googleId: profile.googleId,
            avatarUrl: profile.picture,
            isVerified: true,       // Google verified the email
            role: "CUSTOMER",       // Default role for OAuth sign-ups
        },
    });
};
