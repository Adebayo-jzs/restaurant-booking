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

export const getBookingById = async (id: string) => {
    return prisma.booking.findUnique({ where: { id } });
};

export const verifyBooking = async (id: string) => {
    return prisma.booking.update({
        where: { id },
        data: {
            isVerified: true,
            verificationToken: null,
        }
    });
};

export const getRestaurantBookingsForSlot = async (restaurantId: string, bookingDate: Date, bookingTime: string) => {
    const day = new Date(bookingDate);
    day.setUTCHours(0, 0, 0, 0);
    
    // We only count PENDING or CONFIRMED bookings against capacity.
    // We ignore CANCELLED or REJECTED.
    // We ALSO ignore unverified bookings that have expired.
    return prisma.booking.findMany({
        where: { 
            restaurantId, 
            bookingDate: day,
            bookingTime,
            status: { in: ["PENDING", "CONFIRMED"] },
            OR: [
                { isVerified: true },
                {
                    isVerified: false,
                    verificationTokenExpires: { gt: new Date() }
                }
            ]
        }
    });
};