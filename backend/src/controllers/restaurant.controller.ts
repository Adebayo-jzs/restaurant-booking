import * as restaurantService from "../services/restaurant.service";
import { Response } from "express";
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
    logoUrl:z.string().url("Invalid url"),
    coverImage:z.string().url("Invalid url"),
    openingTime:z.string().min(1, "Restaurant openingTime is required"),
    closingTime:z.string().min(1, "Restaurant closingTime is required"),
    capacity:z.number().min(1, "Restaurant capacity is required"),
    startingPrice:z.number().min(1, "Restaurant startingPrice is required"),
});

export const createRestaurant = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Unauthorized" });
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
        // We don't have handleError imported here, so we handle it inline (or you can extract it to a utils file later)
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