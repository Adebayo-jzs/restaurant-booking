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
        include: {
            restaurant: {
                select: {
                    id: true,
                    name: true,
                    logoUrl: true,
                    address: true,
                    city: true
                }
            }
        }
    });
};

export interface GetBookingsFilters {
    status?: string;
    date?: string;
}

export const getRestaurantBookings = async (restaurantId: string, filters?: GetBookingsFilters) => {
    const where: Prisma.BookingWhereInput = { restaurantId };
    
    if (filters?.status) {
        // Prisma will handle casting to enum if status is an enum
        where.status = filters.status.toUpperCase() as any;
    }
    
    if (filters?.date) {
        const bookingDay = new Date(filters.date);
        bookingDay.setUTCHours(0, 0, 0, 0);
        where.bookingDate = bookingDay;
    }

    return prisma.booking.findMany({
        where,
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

export const cancelBooking = async (id: string) => {
    return prisma.booking.update({
        where: { id },
        data: { status: "CANCELLED" }
    });
}
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
            const lock = await tx.$queryRaw<any[]>`
            SELECT id FROM "RestaurantAvailability" 
            WHERE "restaurantId" = ${restaurantId} AND "date" = ${bookingDay} 
            FOR UPDATE
        `;

        if (!lock || lock.length === 0) {
            throw new Error("NO_AVAILABILITY");
        }

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
    }, {
        maxWait: 5000, // 5 seconds to get a database connection
        timeout: 10000 // 10 seconds for the transaction to complete
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