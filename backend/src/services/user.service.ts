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