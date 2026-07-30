import { Router } from "express";
import * as RestaurantController from "../controllers/restaurant.controller";
import { authMiddleware } from "../middleware/auth";

const restaurantRoutes = Router();

/**
 * @swagger
 * /api/restaurants:
 *   post:
 *     summary: Create a new restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               cuisine:
 *                 type: string
 *               startingPrice:
 *                 type: number
 *               openingTime:
 *                 type: string
 *               closingTime:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Restaurant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurant'
 */
restaurantRoutes.post("/", authMiddleware, RestaurantController.createRestaurant);

export default restaurantRoutes;