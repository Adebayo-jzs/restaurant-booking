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
    const now = new Date();
    const watDateString = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
    const today = new Date(`${watDateString}T00:00:00.000Z`);

    const [restaurants,total] = await Promise.all([
        prisma.restaurant.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                availabilities: {
                    where: { date: today },
                    select: { timeSlots: true }
                }
            }
        }),
        prisma.restaurant.count({ where }),
    ])

    const currentTimeStr = now.toLocaleTimeString('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' });
    
    const processedRestaurants = restaurants.map(rest => {
        if (rest.availabilities && rest.availabilities.length > 0) {
            const rawSlots = rest.availabilities[0].timeSlots;
            const slots = Array.isArray(rawSlots) ? rawSlots : (typeof rawSlots === 'string' ? JSON.parse(rawSlots) : []);
            rest.availabilities[0].timeSlots = slots.filter((slot: { time: string; capacity: number }) => slot.time > currentTimeStr);
        }
        const { ownerId, ...restWithoutOwner } = rest;
        return restWithoutOwner;
    });

    return {
        restaurants: processedRestaurants,
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
    const now = new Date();
    const watDateString = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
    const today = new Date(`${watDateString}T00:00:00.000Z`);
    const currentTimeStr = now.toLocaleTimeString('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' });

    const restaurant = await prisma.restaurant.findFirst({
        where: {
            OR: [
                { id: identifier },
                { slug: identifier }
            ]
        },
        include: {
            availabilities: {
                where: { date: { gte: today } },
                orderBy: { date: 'asc' },
                take: 7
            }
        }
    });

    if (restaurant) {
        const safeAvailabilities = (restaurant.availabilities || []).map(avail => {
            const availDate = new Date(avail.date);
            const rawSlots = avail.timeSlots;
            let slots = Array.isArray(rawSlots) ? rawSlots : (typeof rawSlots === 'string' ? JSON.parse(rawSlots) : []);
            if (availDate.getTime() === today.getTime()) {
                slots = slots.filter((slot: { time: string; capacity: number }) => slot.time > currentTimeStr);
            }
            return {
                ...avail,
                timeSlots: slots,
            };
        }).filter(avail => {
            return Array.isArray(avail.timeSlots) && avail.timeSlots.length > 0;
        });
        
        const { ownerId, ...restaurantWithoutOwner } = restaurant;
        return {
            ...restaurantWithoutOwner,
            availabilities: safeAvailabilities,
        };
    }

    return restaurant;
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

export const upsertAvailabilities = async (restaurantId: string, availabilities: { date: Date; timeSlots: { time: string; capacity: number }[] }[]) => {
    // Process each availability date one by one.
    // If the date exists for this restaurant, update the timeslots. If not, create it.
    const promises = availabilities.map((avail) => {
        // Strip time portion to ensure uniqueness per day
        const day = new Date(avail.date);
        day.setUTCHours(0, 0, 0, 0);

        // Prisma doesn't have upsert with composite unique constraints without a unique identifier if it's not a direct primary key in some older setups, but we have @@unique([restaurantId, date]).
        // Let's use transaction with upsert.
        return prisma.restaurantAvailability.upsert({
            where: {
                restaurantId_date: {
                    restaurantId,
                    date: day
                }
            },
            update: {
                timeSlots: avail.timeSlots
            },
            create: {
                restaurantId,
                date: day,
                timeSlots: avail.timeSlots
            }
        });
    });

    return prisma.$transaction(promises);
};

export const getAvailabilities = async (restaurantId: string, fromDate: Date) => {
    const from = new Date(fromDate);
    from.setUTCHours(0, 0, 0, 0);
    
    const records = await prisma.restaurantAvailability.findMany({
        where: {
            restaurantId,
            date: {
                gte: from
            }
        },
        orderBy: {
            date: 'asc'
        }
    });

    // Get current time strictly in West Africa Time (WAT)
    const now = new Date();
    const watDateString = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
    const today = new Date(`${watDateString}T00:00:00.000Z`);
    const currentTimeStr = now.toLocaleTimeString('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' });

    return records.map(record => {
        // If the record is for today, filter out past time slots
        if (record.date.getTime() === today.getTime()) {
            const slots = record.timeSlots as { time: string; capacity: number }[];
            record.timeSlots = slots.filter(slot => slot.time > currentTimeStr);
        }
        return record;
    }).filter(record => {
        // Exclude days that have no time slots left
        const slots = record.timeSlots as { time: string; capacity: number }[];
        return slots.length > 0;
    });
};

export const getAvailabilityForDate = async (restaurantId: string, date: Date) => {
    const day = new Date(date);
    day.setUTCHours(0, 0, 0, 0);

    return prisma.restaurantAvailability.findUnique({
        where: {
            restaurantId_date: {
                restaurantId,
                date: day
            }
        }
    });
};