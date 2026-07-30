import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";

export const createBooking = async (data: Prisma.BookingUncheckedCreateInput) => {
    return prisma.booking.create({
        data,
    });
}