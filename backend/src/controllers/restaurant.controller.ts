import * as restaurantService from "../services/restaurant.service";
import { getRestaurantBookings } from "../services/booking.service";
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { z } from "zod";

const createRestaurantSchema = z.object({
    name:z.string().min(1, "Restaurant name is required"),
    slug:z.string().min(1, "Restaurant slug is required"),
    description:z.string().min(1, "Restaurant description is required"),
    cuisine:z.string().min(1, "Restaurant cuisine is required"),
    city:z.string().min(1, "Restaurant city is required"),
    address:z.string().min(1, "Restaurant address is required"),
    country:z.string().min(1, "Restaurant country is required"),
    phoneNumber:z.string().min(1, "Restaurant phoneNumber is required"),
    email:z.string().email("Invalid email"),
    logoUrl:z.string().url("Invalid url").optional(),
    coverImage:z.string().url("Invalid url").optional(),
    capacity:z.number().min(1, "Restaurant capacity is required"),
    startingPrice:z.number().min(1, "Restaurant startingPrice is required"),
});


const getAllQuerySchema = z.object({
    city: z.string().optional(),
    cuisine: z.string().optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
});
// export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;

export const createRestaurant = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ 
                success: false, 
                message: "Unauthorized" });
            return;
        }

        if (req.user.role !== "OWNER") {
            res.status(403).json({
                success: false,
                message: "Only restaurant owners can create restaurants",
            });
            return;
        }

        // Parse the body directly into a validated object
        const validatedData = createRestaurantSchema.parse(req.body);
        
        // Call the service with validated data AND the ownerId from the session
        const restaurant = await restaurantService.createRestaurant({
            ...validatedData,
            ownerId: req.user.id,
        });
        
        res.status(201).json({
            success: true, 
            message: "Restaurant created successfully", 
            data: restaurant
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                success: false,
                error: "Validation failed",
                details: error.issues,
            });
            return;
        }
        console.error("[RestaurantController]", error);
        res.status(500).json({
            success: false,
            message: "An unexpected error occurred. Please try again.",
        });
    }
}

export const getAllRestaurantsHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const filters = getAllQuerySchema.parse(req.query);
        const result = await restaurantService.getAllRestaurants(filters);

        res.status(200).json({ success: true, restaurants: result.restaurants, pagination: result.pagination });
    } catch (error) {
        console.error("[RestaurantController]", error);
        res.status(501).json({
            success:false,
            message: "An unexpected error occurred. Please try again.",
        })
    }
};

export const getUserRestaurantsController = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if(!req.user){
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        const restaurants = await restaurantService.getUserRestaurants(req.user.id);
        res.status(200).json({ success: true, data: restaurants });
    } catch(error){
        console.error("[RestaurantController]", error);
        res.status(501).json({
            success:false,
            message: "An unexpected error occurred. Please try again.",
        })
    }
}

const updateRestaurantSchema = createRestaurantSchema.partial();

export const getRestaurantByIdOrSlugHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const identifier = req.params.identifier as string;
        
        // Single database query checking both fields
        const restaurant = await restaurantService.getRestaurantByIdOrSlug(identifier);
            
        if (!restaurant) {
            res.status(404).json({ success: false, message: "Restaurant not found" });
            return;
        }
        res.status(200).json({ success: true, restaurant: restaurant });
    } catch (error) {
        console.error("[RestaurantController]", error);
        res.status(500).json({ success: false, message: "An unexpected error occurred" });
    }
};

export const updateRestaurantHandler = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== "OWNER") {
            res.status(403).json({ success: false, message: "Only restaurant owners can update restaurants" });
            return;
        }
        
        const restaurantId = req.params.restaurantId as string;
        const restaurant = await restaurantService.getRestaurantById(restaurantId);
        if (!restaurant) {
            res.status(404).json({ success: false, message: "Restaurant not found" });
            return;
        }
        
        if (restaurant.ownerId !== req.user.id) {
            res.status(403).json({ success: false, message: "You don't own this restaurant" });
            return;
        }

        const validatedData = updateRestaurantSchema.parse(req.body);
        const updated = await restaurantService.updateRestaurant(restaurantId, validatedData);
        
        res.status(200).json({ success: true, message: "Restaurant updated successfully", data: updated });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: "Validation failed", details: error.issues });
            return;
        }
        console.error("[RestaurantController]", error);
        res.status(500).json({ success: false, message: "An unexpected error occurred" });
    }
};

export const deactivateRestaurantHandler = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== "OWNER") {
            res.status(403).json({ success: false, message: "Only restaurant owners can deactivate restaurants" });
            return;
        }
        
        const restaurantId = req.params.restaurantId as string;
        const restaurant = await restaurantService.getRestaurantById(restaurantId);
        if (!restaurant) {
            res.status(404).json({ success: false, message: "Restaurant not found" });
            return;
        }
        
        if (restaurant.ownerId !== req.user.id) {
            res.status(403).json({ success: false, message: "You don't own this restaurant" });
            return;
        }

        await restaurantService.deactivateRestaurant(restaurantId);
        res.status(200).json({ success: true, message: "Restaurant deactivated successfully" });
    } catch (error) {
        console.error("[RestaurantController]", error);
        res.status(500).json({ success: false, message: "An unexpected error occurred" });
    }
};


export const getRestaurantBookingsController = async (req: AuthRequest, res:Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        const restaurantId = req.params.restaurantId as string;
        const restaurant = await restaurantService.getRestaurantById(restaurantId);
        if(!restaurant) {
            res.status(404).json({ success: false, message: "Restaurant not found" });
            return;
        }
        if (restaurant.ownerId !== req.user.id) {
            res.status(403).json({ success: false, message: "No permission to perform this function" });
            return;
        }
        const bookings = await getRestaurantBookings(restaurantId);
        res.status(200).json({success: true, data: bookings})
    
    } catch (error){
        console.error("[RestaurantController]", error);
        res.status(500).json({ success: false, message: "An unexpected error occurred" });
    }
}

// --- Availability Endpoints ---

const availabilitySchema = z.object({
    availabilities: z.array(z.object({
        date: z.coerce.date(),
        timeSlots: z.array(z.object({
            time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time slot format"),
            capacity: z.number().int().min(1, "Capacity must be at least 1")
        })),
    })),
});

export const addRestaurantAvailabilityHandler = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== "OWNER") {
            res.status(403).json({ success: false, message: "Only owners can manage availability" });
            return;
        }
        const restaurantId = req.params.restaurantId as string;
        const restaurant = await restaurantService.getRestaurantById(restaurantId);
        
        if (!restaurant) {
            res.status(404).json({ success: false, message: "Restaurant not found" });
            return;
        }
        if (restaurant.ownerId !== req.user.id) {
            res.status(403).json({ success: false, message: "You do not own this restaurant" });
            return;
        }

        const { availabilities } = availabilitySchema.parse(req.body);
        
        await restaurantService.upsertAvailabilities(restaurantId, availabilities);
        
        res.status(200).json({ success: true, message: "Availability updated successfully" });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: "Validation failed", details: error.issues });
            return;
        }
        console.error("[RestaurantController] Availability:", error);
        res.status(500).json({ success: false, message: "An unexpected error occurred" });
    }
};

export const getRestaurantAvailabilityHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const restaurantId = req.params.restaurantId as string;
        // Optionally filter by upcoming dates using query params
        const fromDateStr = req.query.from as string;
        const fromDate = fromDateStr ? new Date(fromDateStr) : new Date();
        
        const availabilities = await restaurantService.getAvailabilities(restaurantId, fromDate);
        res.status(200).json({ success: true, data: availabilities });
    } catch (error) {
        console.error("[RestaurantController] Get Availability:", error);
        res.status(500).json({ success: false, message: "An unexpected error occurred" });
    }
};