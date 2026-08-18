import * as bookingService from "../services/booking.service";
import * as restaurantService from "../services/restaurant.service";
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import z, { success } from "zod";

import prisma from "../config/prisma";
import crypto from "crypto";
import * as emailService from "../services/email.service";

const createBookingSchema = z.object({
    bookingDate: z.coerce.date({ message: "Booking date is required" }),
    bookingTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in 24-hour format (e.g., '19:30')"),
    numberOfPeople: z.number().min(1, "Number of people is required"),
    specialRequests: z.string().optional(),
    guestName: z.string().optional(),
    guestEmail: z.string().email("Invalid email").optional(),
    guestPhone: z.string().optional(),
});

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const restaurantId = req.params.restaurantId as string;

        const restaurant = await restaurantService.getRestaurantById(restaurantId);
        if (!restaurant) {
            res.status(404).json({ success: false, message: "Restaurant not found" });
            return;
        }

        // ── Guard: restaurant must be active ─────────────────────────────────
        if (!restaurant.isActive) {
            res.status(400).json({ success: false, message: "This restaurant is not currently accepting bookings" });
            return;
        }

        if (req.user && restaurant.ownerId === req.user.id) {
            res.status(403).json({ success: false, message: "You cannot book at your own restaurant" });
            return;
        }

        const validatedData = createBookingSchema.parse(req.body);

        let finalGuestName = validatedData.guestName;
        let finalGuestEmail = validatedData.guestEmail;
        let finalGuestPhone = validatedData.guestPhone;

        if (req.user) {
            const userDb = await prisma.user.findUnique({ where: { id: req.user.id } });
            if (userDb) {
                finalGuestName = userDb.name;
                finalGuestEmail = userDb.email;
            }
        }

        if (!finalGuestName || !finalGuestEmail || !finalGuestPhone) {
            res.status(400).json({ success: false, message: "Guest name, email, and phone number are strictly required." });
            return;
        }

        // ── Guard: booking date must not be in the past ───────────────────────
        // Strip time so a booking for "today" is always valid regardless of current hour.
        // Force "today" to be the start of the current day in West Africa Time (WAT)
        const now = new Date();
        const watDateString = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
        const today = new Date(`${watDateString}T00:00:00.000Z`);

        const bookingDay = new Date(validatedData.bookingDate);
        bookingDay.setUTCHours(0, 0, 0, 0);

        if (bookingDay < today) {
            res.status(400).json({ success: false, message: "Booking date cannot be in the past" });
            return;
        }

        if (bookingDay.getTime() === today.getTime()) {
            // Get current time strictly in West Africa Time (WAT)
            const currentTimeStr = now.toLocaleTimeString('en-GB', { 
                timeZone: 'Africa/Lagos', 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            if (validatedData.bookingTime < currentTimeStr) {
                res.status(400).json({ success: false, message: "Cannot book a time slot that has already passed today" });
                return;
            }
        }

        // ── Guard: Exact Time Slot Check ──────────────────────────────────────
        const availability = await restaurantService.getAvailabilityForDate(restaurantId, bookingDay);
        
        if (!availability) {
            res.status(400).json({ success: false, message: "This restaurant has no availability on the selected date." });
            return;
        }

        // The timeSlots field is now JSON: [{ time: "18:00", capacity: 20 }]
        const slots = availability.timeSlots as { time: string; capacity: number }[];
        const requestedSlot = slots.find(s => s.time === validatedData.bookingTime);

        if (!requestedSlot) {
            res.status(400).json({ 
                success: false, 
                message: "The requested time slot is not available for this date." 
            });
            return;
        }

        // ── Concurrency Safe Capacity Check & Creation ─────────────────────────
        const isVerified = !!req.user;
        const verificationToken = isVerified ? null : crypto.randomInt(100000, 999999).toString();
        const verificationTokenExpires = isVerified ? null : new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // Only pass fields that are in the schema
        const { guestName, guestEmail, guestPhone, ...restData } = validatedData;

        try {
            const booking = await prisma.$transaction(async (tx) => {
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
                        bookingTime: validatedData.bookingTime,
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
                if (currentBookedPeople + validatedData.numberOfPeople > requestedSlot.capacity) {
                    throw new Error("OVERBOOKED");
                }

                // 4. Create the booking
                return await tx.booking.create({
                    data: {
                        ...restData,
                        userId: req.user ? req.user.id : null,
                        restaurantId,
                        guestName: finalGuestName as string,
                        guestEmail: finalGuestEmail as string,
                        guestPhone: finalGuestPhone as string,
                        isVerified,
                        verificationToken,
                        verificationTokenExpires
                    }
                });
            });

            if (!isVerified) {
                await emailService.sendBookingVerificationEmail(finalGuestEmail as string, finalGuestName as string, verificationToken as string);
            }

            res.status(201).json({
                success: true,
                message: isVerified ? "Booking created successfully" : "Booking created! Please check your email for the 6-digit verification code.",
                data: booking,
            });

        } catch (e: any) {
            if (e.message === "OVERBOOKED") {
                res.status(400).json({ 
                    success: false, 
                    message: `This time slot is fully booked or cannot accommodate ${validatedData.numberOfPeople} people.` 
                });
                return;
            }
            throw e; // Pass to the outer catch block
        }
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

export const verifyGuestBooking = async (req: Request, res: Response): Promise<void> => {
    try {
        const bookingId = req.params.bookingId as string;
        const { otp } = req.body;

        if (!otp) {
            res.status(400).json({ success: false, message: "OTP is required" });
            return;
        }

        const booking = await bookingService.getBookingById(bookingId);
        if (!booking) {
            res.status(404).json({ success: false, message: "Booking not found" });
            return;
        }

        if (booking.isVerified) {
            res.status(400).json({ success: false, message: "Booking is already verified" });
            return;
        }

        if (booking.verificationToken !== otp || !booking.verificationTokenExpires || booking.verificationTokenExpires < new Date()) {
            res.status(400).json({ success: false, message: "Invalid or expired OTP" });
            return;
        }

        const verifiedBooking = await bookingService.verifyBooking(bookingId);
        res.status(200).json({ success: true, message: "Booking verified successfully", data: verifiedBooking });
    } catch (error) {
        console.error("[BookingController] Verify:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const acceptBooking = async (req:AuthRequest,res:Response): Promise<void> =>{
    try{
        const bookingId = req.params.bookingId as string;
        const booking = await prisma.booking.findUnique({
            where: {id: bookingId},
            include: {restaurant: true}
        })
        if(!booking){
            res.status(404).json({
                success: false,
                message: "Booking not found"
            });
            return;
        }

        if(booking.restaurant.ownerId !== req.user?.id) {
            res.status(403).json({
                success: false,
                message: "Unauthorized to perform this action: You do not own this restaurant"
            });
            return;
        }
        if(booking.status === "CONFIRMED"){
            res.status(400).json({
              success: false,
              message: "Booking has already been accepted"  
            });
            return;
        }        
        if(booking.status === "CANCELLED" || booking.status === "REJECTED"){
            res.status(400).json({
              success: false,
              message: `Booking has already been ${booking.status.toLowerCase()}`  
            });
            return;
        }
        if(booking.status === "PENDING" && new Date(booking.bookingDate) < new Date(new Date().setHours(0,0,0,0))){
            res.status(400).json({
              success: false,
              message: "Booking has already expired"  
            });
            return;
        } 
        const acceptedBooking = await prisma.booking.update({
            where: {id: bookingId},
            data: {status: "CONFIRMED"}
        })
        res.status(200).json({
            success: true,
            message: "Booking accepted successfully",
            data: acceptedBooking
        })
    } catch(error) {
        console.error("[BookingController] Accept:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}


export const rejectBooking = async (req:AuthRequest,res:Response): Promise<void> =>{
    try{
        const bookingId = req.params.bookingId as string;
        const booking = await prisma.booking.findUnique({
            where: {id: bookingId},
            include: {restaurant: true}
        })
        if(!booking){
            res.status(404).json({
                success: false,
                message: "Booking not found"
            });
            return;
        }

        if(booking.restaurant.ownerId !== req.user?.id) {
            res.status(403).json({
                success: false,
                message: "Unauthorized to perform this action: You do not own this restaurant"
            });
            return;
        }
        if(booking.status === "CONFIRMED"){
            res.status(400).json({
              success: false,
              message: "Booking has already been accepted"  
            });
            return;
        }        
        if(booking.status === "CANCELLED" || booking.status === "REJECTED"){
            res.status(400).json({
              success: false,
              message: `Booking has already been ${booking.status.toLowerCase()}`  
            });
            return;
        }
        if(booking.status === "PENDING" && new Date(booking.bookingDate) < new Date(new Date().setHours(0,0,0,0))){
            res.status(400).json({
              success: false,
              message: "Booking has already expired"  
            });
            return;
        } 
        const rejectedBooking = await prisma.booking.update({
            where: {id: bookingId},
            data: {status: "REJECTED"}
        })
        res.status(200).json({
            success: true,
            message: "Booking rejected successfully",
            data: rejectedBooking
        })
    } catch(error) {
        console.error("[BookingController] Reject:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}