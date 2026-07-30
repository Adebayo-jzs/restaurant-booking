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
 *               $ref: '#/components/schemas/Booking'
 */
bookingRoutes.post("/:restaurantId/book", authMiddleware, BookingController.createBooking);

export default bookingRoutes;