import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";

export const createBooking = async (data: Prisma.BookingUncheckedCreateInput) => {
    return prisma.booking.create({
        data,
    });
}

export const getUserBookings = async (userId: string) => {
    return prisma.booking.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
};

export const getRestaurantBookings = async (restaurantId: string) => {
    return prisma.booking.findMany({
        where: { restaurantId },
        orderBy: {createdAt:"desc"},
    })
}