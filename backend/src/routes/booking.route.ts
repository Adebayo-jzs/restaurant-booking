import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as BookingController from "../controllers/booking.controller";
import { authMiddleware, optionalAuthMiddleware, requireRole } from "../middleware/auth";

const bookingRoutes = Router();

const createBookingLimiter = rateLimit({ 
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 booking attempts per 15 minutes
    standardHeaders: true, 
    legacyHeaders: false, 
    message: { success: false, message: "Too many booking attempts, please try again later." }
});

/**
 * @swagger
 * /bookings/{restaurantId}/book:
 *   post:
 *     summary: Book a table at a restaurant
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *       - {}
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the restaurant to book
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingInput'
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Owner cannot book at their own restaurant)
 *       404:
 *         description: Restaurant not found
 *       500:
 *         description: Internal server error
 */
bookingRoutes.post("/:restaurantId/book", optionalAuthMiddleware, createBookingLimiter, BookingController.createBooking);

/**
 * @swagger
 * /bookings/{bookingId}/verify:
 *   post:
 *     summary: Verify a guest booking using OTP
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */
bookingRoutes.post("/:bookingId/verify", BookingController.verifyGuestBooking);

/**
 * @swagger
 * /bookings/{bookingId}/accept:
 *   post:
 *     summary: Accept a pending booking (Owner only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking accepted successfully
 *       400:
 *         description: Invalid state transition
 *       403:
 *         description: Forbidden (Not the owner)
 *       404:
 *         description: Booking not found
 */
bookingRoutes.post("/:bookingId/accept", authMiddleware, requireRole("OWNER"), BookingController.acceptBooking);

/**
 * @swagger
 * /bookings/{bookingId}/reject:
 *   post:
 *     summary: Reject a pending booking (Owner only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking rejected successfully
 *       400:
 *         description: Invalid state transition
 *       403:
 *         description: Forbidden (Not the owner)
 *       404:
 *         description: Booking not found
 */
bookingRoutes.post("/:bookingId/reject", authMiddleware, requireRole("OWNER"), BookingController.rejectBooking);

/**
 * @swagger
 * /bookings/{bookingId}/cancel:
 *   post:
 *     summary: Cancel a pending booking (User only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking rejected successfully
 *       400:
 *         description: Invalid state transition
 *       403:
 *         description: Forbidden (Not the user)
 *       404:
 *         description: Booking not found
 */
bookingRoutes.post("/:bookingId/cancel", authMiddleware, requireRole("USER"), BookingController.cancelBooking);


/**
 * @swagger
 * /bookings/my-bookings:
 *   get:
 *     summary: Get all bookings for the current user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of the user's bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized
 */
bookingRoutes.get("/my-bookings", authMiddleware, BookingController.getUserBookings);

export default bookingRoutes;