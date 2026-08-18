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

export const getBookingWithRestaurant = async (id: string) => {
    return prisma.booking.findUnique({
        where: { id },
        include: { restaurant: true },
    });
};

export const getUserById = async (userId: string) => {
    return prisma.user.findUnique({ where: { id: userId } });
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

export const acceptBooking = async (id: string) => {
    return prisma.booking.update({
        where: { id },
        data: { status: "CONFIRMED" },
    });
};

export const rejectBooking = async (id: string) => {
    return prisma.booking.update({
        where: { id },
        data: { status: "REJECTED" },
    });
};

/**
 * Creates a booking inside a transaction with row-level locking
 * to prevent overbooking a time slot.
 */
export const createBookingInTransaction = async (
    restaurantId: string,
    bookingDay: Date,
    bookingTime: string,
    numberOfPeople: number,
    slotCapacity: number,
    bookingData: Prisma.BookingUncheckedCreateInput
) => {
    return prisma.$transaction(async (tx) => {
        // 1. Lock the availability row for this date to prevent concurrent modifications
        await tx.$executeRaw`
            SELECT id FROM "RestaurantAvailability" 
            WHERE "restaurantId" = ${restaurantId} AND "date" = ${bookingDay} 
            FOR UPDATE
        `;

        // 2. Fetch current capacity inside the transaction
        const bookingsForSlot = await tx.booking.findMany({
            where: {
                restaurantId,
                bookingDate: bookingDay,
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

        const currentBookedPeople = bookingsForSlot.reduce((sum, b) => sum + b.numberOfPeople, 0);

        // 3. Reject if overbooked
        if (currentBookedPeople + numberOfPeople > slotCapacity) {
            throw new Error("OVERBOOKED");
        }

        // 4. Create the booking
        return await tx.booking.create({ data: bookingData });
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