import { Router } from "express";
import * as BookingController from "../controllers/booking.controller";
import { authMiddleware } from "../middleware/auth";

const bookingRoutes = Router();

/**
 * @swagger
 * /api/bookings/{restaurantId}/book:
 *   post:
 *     summary: Book a table at a restaurant
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
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
 *             type: object
 *             properties:
 *               bookingDate:
 *                 type: string
 *                 format: date-time
 *               bookingTime:
 *                 type: string
 *               numberOfPeople:
 *                 type: integer
 *               specialRequests:
 *                 type: string
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
bookingRoutes.post("/:restaurantId/book", authMiddleware, BookingController.createBooking);

/**
 * @swagger
 * /api/bookings/my-bookings:
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