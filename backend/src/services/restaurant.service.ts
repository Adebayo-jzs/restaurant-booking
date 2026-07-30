import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";

export const createRestaurant = async (data: Prisma.RestaurantUncheckedCreateInput) => {
    return prisma.restaurant.create({
        data,
    });
}