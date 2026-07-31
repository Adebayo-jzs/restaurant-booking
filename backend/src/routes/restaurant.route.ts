import { Router } from "express";
import * as RestaurantController from "../controllers/restaurant.controller";
import { authMiddleware, requireRole } from "../middleware/auth";

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
 *       403:
 *         description: Forbidden. Only OWNER users can create restaurants.
 */
restaurantRoutes.post("/", authMiddleware, requireRole("OWNER"), RestaurantController.createRestaurant);

/**
 * @swagger
 * /api/restaurants:
 *   get:
 *     summary: Get all restaurants
 *     tags: [Restaurants]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: cuisine
 *         schema:
 *           type: string
 *         description: Filter by cuisine
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by restaurant name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of restaurants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     restaurants:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Restaurant'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 */
restaurantRoutes.get("/", RestaurantController.getAllRestaurantsHandler);

/**
 * @swagger
 * /api/restaurants/my-restaurants:
 *   get:
 *     summary: Get restaurants owned by the current user
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of restaurants owned by the user
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
 *                     $ref: '#/components/schemas/Restaurant'
 *       401:
 *         description: Unauthorized
 */
restaurantRoutes.get("/my-restaurants", authMiddleware, RestaurantController.getUserRestaurantsController);

/**
 * @swagger
 * /api/restaurants/{identifier}:
 *   get:
 *     summary: Get a restaurant by ID or slug
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant ID or slug
 *     responses:
 *       200:
 *         description: Restaurant found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Restaurant'
 *       404:
 *         description: Restaurant not found
 */
restaurantRoutes.get("/:identifier", RestaurantController.getRestaurantByIdOrSlugHandler);

/**
 * @swagger
 * /api/restaurants/{restaurantId}/bookings:
 *   get:
 *     summary: Get all bookings for a restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant ID
 *     responses:
 *       200:
 *         description: List of bookings for the restaurant
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
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Restaurant not found
 */
restaurantRoutes.get("/:restaurantId/bookings", authMiddleware, RestaurantController.getRestaurantBookingsController);

/**
 * @swagger
 * /api/restaurants/{restaurantId}:
 *   put:
 *     summary: Update a restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RestaurantInput'
 *     responses:
 *       200:
 *         description: Restaurant updated successfully
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
 *                   $ref: '#/components/schemas/Restaurant'
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Restaurant not found
 */
restaurantRoutes.put("/:restaurantId", authMiddleware, requireRole("OWNER"), RestaurantController.updateRestaurantHandler);

/**
 * @swagger
 * /api/restaurants/{restaurantId}:
 *   delete:
 *     summary: Deactivate a restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant ID
 *     responses:
 *       200:
 *         description: Restaurant deactivated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Restaurant not found
 */
restaurantRoutes.delete("/:restaurantId", authMiddleware, requireRole("OWNER"), RestaurantController.deactivateRestaurantHandler);

export default restaurantRoutes;