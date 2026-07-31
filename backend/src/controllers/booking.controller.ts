import * as bookingService from "../services/booking.service";
import * as restaurantService from "../services/restaurant.service";
import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import z from "zod";

const createBookingSchema = z.object({
    bookingDate: z.coerce.date({ message: "Booking date is required" }),
    bookingTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in 24-hour format (e.g., '19:30')"),
    numberOfPeople: z.number().min(1, "Number of people is required"),
    specialRequests: z.string().optional(),
});

export const createBooking = async (req: AuthRequest,res:Response): Promise<void> => {
    try {
        if(!req.user) {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }

        const restaurantId = req.params.restaurantId as string;

        const restaurant = await restaurantService.getRestaurantById(restaurantId);
        if (!restaurant) {
            res.status(404).json({ success: false, message: "Restaurant not found" });
            return;
        }

        if (restaurant.ownerId === req.user.id) {
            res.status(403).json({ success: false, message: "You cannot book at your own restaurant" });
            return;
        }

        const validatedData = createBookingSchema.parse(req.body);

        const booking = await bookingService.createBooking({
            ...validatedData,
            userId: req.user.id,
            restaurantId,
        });

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: booking,
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
        console.error("[BookingController]", error);
        res.status(500).json({
            success: false,
            message: "An unexpected error occurred. Please try again.",
        });
    }
}

export const getUserBookings = async (req: AuthRequest, res: Response) => {
    try {
        if(!req.user) {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }

        const bookings = await bookingService.getUserBookings(req.user.id);
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        return res.status(500).json({
            success:false,
            message: "Internal server error"
        })
    }
}