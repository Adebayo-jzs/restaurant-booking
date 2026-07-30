import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Restaurant Booking API',
      version: '1.0.0',
      description: 'API documentation for Restaurant Booking application',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          description: 'A user of the restaurant booking platform',
          properties: {
            id: { type: 'string', description: 'Unique identifier for the user', example: 'cld1xxyz0000...' },
            name: { type: 'string', description: 'Full name of the user', example: 'John Doe' },
            email: { type: 'string', description: 'User email address', example: 'john.doe@example.com' },
            role: { type: 'string', description: 'Role of the user (USER or ADMIN/OWNER)', default: 'USER', example: 'USER' },
            createdAt: { type: 'string', format: 'date-time', example: '2023-10-01T12:00:00Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2023-10-01T12:00:00Z' },
          },
        },
        Restaurant: {
          type: 'object',
          description: 'A restaurant available for booking',
          properties: {
            id: { type: 'string', example: 'res_abc123' },
            name: { type: 'string', description: 'Name of the restaurant', example: 'The Golden Fork' },
            slug: { type: 'string', description: 'URL-friendly identifier', example: 'the-golden-fork' },
            description: { type: 'string', description: 'Detailed description', example: 'A fine dining experience offering the best local cuisines.' },
            cuisine: { type: 'string', description: 'Primary type of food served', example: 'Italian' },
            startingPrice: { type: 'number', description: 'Average starting price per person', example: 50.0 },
            openingTime: { type: 'string', description: 'Daily opening time (HH:MM)', example: '09:00' },
            closingTime: { type: 'string', description: 'Daily closing time (HH:MM)', example: '22:00' },
            capacity: { type: 'integer', description: 'Total seating capacity', example: 100 },
            address: { type: 'string', example: '123 Main Street' },
            city: { type: 'string', example: 'Lagos' },
            state: { type: 'string', example: 'Lagos State' },
            country: { type: 'string', default: 'Nigeria', example: 'Nigeria' },
            email: { type: 'string', example: 'contact@goldenfork.com' },
            phoneNumber: { type: 'string', example: '+2348012345678' },
            logoUrl: { type: 'string', description: 'URL to the restaurant logo', example: 'https://example.com/logo.png' },
            coverImage: { type: 'string', description: 'URL to the cover image', example: 'https://example.com/cover.jpg' },
            isActive: { type: 'boolean', description: 'Whether the restaurant is currently accepting bookings', example: true },
            isVerified: { type: 'boolean', description: 'Whether the restaurant is verified by the platform', example: true },
            ownerId: { type: 'string', description: 'ID of the user who owns this restaurant', example: 'cld1xxyz0000...' },
            createdAt: { type: 'string', format: 'date-time', example: '2023-10-01T12:00:00Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2023-10-01T12:00:00Z' },
          },
        },
        Booking: {
          type: 'object',
          description: 'A reservation made by a user at a restaurant',
          properties: {
            id: { type: 'string', example: 'bk_xyz987' },
            bookingDate: { type: 'string', format: 'date-time', description: 'The date of the reservation', example: '2023-11-15T00:00:00.000Z' },
            bookingTime: { type: 'string', description: 'The time of the reservation (HH:MM)', example: '19:30' },
            numberOfPeople: { type: 'integer', description: 'Number of guests attending', example: 4 },
            status: { type: 'string', description: 'Current status of the booking', example: 'CONFIRMED' },
            specialRequests: { type: 'string', description: 'Any special requests from the user', example: 'Window seat if possible, celebrating an anniversary.' },
            userId: { type: 'string', description: 'ID of the user who made the booking', example: 'cld1xxyz0000...' },
            restaurantId: { type: 'string', description: 'ID of the booked restaurant', example: 'res_abc123' },
            createdAt: { type: 'string', format: 'date-time', example: '2023-10-01T12:00:00Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2023-10-01T12:00:00Z' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
