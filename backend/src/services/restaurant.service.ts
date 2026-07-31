import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";

export const createRestaurant = async (data: Prisma.RestaurantUncheckedCreateInput) => {
    return prisma.restaurant.create({
        data,
    });
}

interface GetAllFilters {
    city?: string,
    cuisine?: string,
    search?: string,
    page?: number,
    limit?: number
}
export const getAllRestaurants = async (filters: GetAllFilters) => {
    const { city, cuisine, search, page = 1, limit = 20 } = filters;
    const where: Prisma.RestaurantWhereInput = {
        ...(city && { city: { equals: city, mode: "insensitive" } }),
        ...(cuisine && { cuisine: { equals: cuisine, mode: "insensitive" } }),
        ...(search && { name: { contains: search, mode: "insensitive" } }),
    };
    const [restaurants,total] = await Promise.all([
        prisma.restaurant.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma.restaurant.count({ where }),
    ])
    return {
        restaurants,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    }
}

export const getRestaurantById = async (id: string) => {
    return prisma.restaurant.findUnique({ where: { id } });
}

export const getRestaurantBySlug = async (slug: string) => {
    return prisma.restaurant.findUnique({ where: { slug } });
}

export const getRestaurantByIdOrSlug = async (identifier: string) => {
    return prisma.restaurant.findFirst({
        where: {
            OR: [
                { id: identifier },
                { slug: identifier }
            ]
        }
    });
}

export const getUserRestaurants = async (ownerId: string) => {
    return prisma.restaurant.findMany({
        where: { ownerId },
        orderBy: {createdAt:'desc'},
    });

};

export const updateRestaurant = async (id: string, data: Prisma.RestaurantUncheckedUpdateInput) => {
    return prisma.restaurant.update({
        where: { id },
        data,
    });
}

export const deactivateRestaurant = async (id: string) => {
    return prisma.restaurant.update({
        where: { id },
        data: { isActive: false },
    });
};