import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Restaurant Booking API',
      version: '1.0.0',
      description: 'API documentation for the Restaurant Booking backend.\n\n[Download OpenAPI JSON for LLMs](/openapi.json)',
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server',
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication operations' },
      { name: 'Restaurants', description: 'Restaurant operations' },
      { name: 'Bookings', description: 'Booking operations' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        RegisterInput: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
            password: { type: 'string', example: 'Password123!' },
            role: { type: 'string', example: 'CUSTOMER', description: 'Optional role. CUSTOMER by default, or OWNER for restaurant owners.' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
            password: { type: 'string', example: 'Password123!' },
          },
        },
        ResetPasswordInput: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: { type: 'string', example: 'Password123!' },
            newPassword: { type: 'string', example: 'NewPassword123!' },
          },
        },
        RefreshTokenInput: {
          type: 'object',
          properties: {
            refreshToken: { type: 'string', example: 'opaque-refresh-token' },
          },
        },
        RestaurantInput: {
          type: 'object',
          required: ['name', 'slug', 'description', 'cuisine', 'city', 'address', 'country', 'phoneNumber', 'email', 'capacity', 'startingPrice'],
          properties: {
            name: { type: 'string', example: 'The Golden Fork' },
            slug: { type: 'string', example: 'the-golden-fork' },
            description: { type: 'string', example: 'A modern restaurant serving local and continental dishes.' },
            cuisine: { type: 'string', example: 'Italian' },
            city: { type: 'string', example: 'Lagos' },
            address: { type: 'string', example: '123 Main Street' },
            country: { type: 'string', example: 'Nigeria' },
            phoneNumber: { type: 'string', example: '+2348012345678' },
            email: { type: 'string', format: 'email', example: 'contact@goldenfork.com' },
            logoUrl: { type: 'string', example: 'https://example.com/logo.png' },
            coverImage: { type: 'string', example: 'https://example.com/cover.jpg' },
            capacity: { type: 'integer', example: 100 },
            startingPrice: { type: 'number', example: 50 },
            state: { type: 'string', example: 'Lagos State' },
          },
        },
        BookingInput: {
          type: 'object',
          required: ['bookingDate', 'bookingTime', 'numberOfPeople'],
          properties: {
            bookingDate: { type: 'string', format: 'date-time', example: '2023-11-15T00:00:00.000Z' },
            bookingTime: { type: 'string', example: '19:30' },
            numberOfPeople: { type: 'integer', example: 4 },
            specialRequests: { type: 'string', example: 'Window seat if possible' },
            guestName: { type: 'string', example: 'Jane Doe' },
            guestEmail: { type: 'string', format: 'email', example: 'jane@example.com' },
            guestPhone: { type: 'string', example: '+2348000000000' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'cld1xxyz0000...' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
            role: { type: 'string', example: 'CUSTOMER' },
            createdAt: { type: 'string', format: 'date-time', example: '2023-10-01T12:00:00Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2023-10-01T12:00:00Z' },
          },
        },
        Restaurant: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'res_abc123' },
            name: { type: 'string', example: 'The Golden Fork' },
            slug: { type: 'string', example: 'the-golden-fork' },
            description: { type: 'string', example: 'A modern restaurant serving local and continental dishes.' },
            cuisine: { type: 'string', example: 'Italian' },
            startingPrice: { type: 'number', example: 50 },
            capacity: { type: 'integer', example: 100 },
            address: { type: 'string', example: '123 Main Street' },
            city: { type: 'string', example: 'Lagos' },
            state: { type: 'string', example: 'Lagos State' },
            country: { type: 'string', example: 'Nigeria' },
            email: { type: 'string', format: 'email', example: 'contact@goldenfork.com' },
            phoneNumber: { type: 'string', example: '+2348012345678' },
            logoUrl: { type: 'string', example: 'https://example.com/logo.png' },
            coverImage: { type: 'string', example: 'https://example.com/cover.jpg' },
            isActive: { type: 'boolean', example: true },
            isVerified: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time', example: '2023-10-01T12:00:00Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2023-10-01T12:00:00Z' },
            availabilities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string', format: 'date-time', example: '2026-08-17T00:00:00.000Z' },
                  timeSlots: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        time: { type: 'string', example: '18:00' },
                        capacity: { type: 'integer', example: 20 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'bk_xyz987' },
            bookingDate: { type: 'string', format: 'date-time', example: '2023-11-15T00:00:00.000Z' },
            bookingTime: { type: 'string', example: '19:30' },
            numberOfPeople: { type: 'integer', example: 4 },
            status: { type: 'string', example: 'PENDING' },
            specialRequests: { type: 'string', example: 'Window seat if possible' },
            userId: { type: 'string', nullable: true, example: 'cld1xxyz0000...' },
            guestName: { type: 'string', example: 'Jane Doe' },
            guestEmail: { type: 'string', format: 'email', example: 'jane@example.com' },
            guestPhone: { type: 'string', example: '+2348000000000' },
            isVerified: { type: 'boolean', example: false },
            reminderSent: { type: 'boolean', example: false },
            restaurantId: { type: 'string', example: 'res_abc123' },
            restaurant: {
              type: 'object',
              description: 'Included when fetching user bookings',
              properties: {
                id: { type: 'string', example: 'res_abc123' },
                name: { type: 'string', example: 'The Golden Fork' },
                logoUrl: { type: 'string', example: 'https://example.com/logo.png' },
                address: { type: 'string', example: '123 Main Street' },
                city: { type: 'string', example: 'Lagos' },
              }
            },
            createdAt: { type: 'string', format: 'date-time', example: '2023-10-01T12:00:00Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2023-10-01T12:00:00Z' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
