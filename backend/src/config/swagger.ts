export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'GlobeTrotter REST API',
    version: '1.0.0',
    description:
      'Official REST API documentation for the GlobeTrotter travel planning web application. Provides endpoints for Authentication, User Profile management, Trip CRUD, City discovery, Activity exploration, Multi-City Planning, Day-wise Itinerary, Budget & Expense Tracking, and Trip Sharing.',
    contact: {
      name: 'GlobeTrotter Team',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'API Base URL',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token obtained from /api/auth/login or /api/auth/register',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description: 'HTTP-only session cookie named `token`',
      },
    },
    schemas: {
      StandardSuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
          message: { type: 'string', example: 'Operation completed successfully' },
        },
        required: ['success', 'data', 'message'],
      },
      StandardErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          data: { type: 'null', example: null },
          message: { type: 'string', example: 'Human readable error description' },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'ERROR_CODE' },
              details: { type: 'object' },
            },
            required: ['code'],
          },
        },
        required: ['success', 'data', 'message', 'error'],
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'c1f7a4b0-1234-4567-89ab-cdef01234567' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          name: { type: 'string', example: 'Jane Doe' },
          avatar: { type: 'string', nullable: true, example: 'https://example.com/avatar.jpg' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-08-22T04:30:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-08-22T04:30:00.000Z' },
        },
        required: ['id', 'email', 'name', 'createdAt', 'updatedAt'],
      },
      Trip: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'e8d6411d-5b32-47d0-994c-8a1924619d0a' },
          name: { type: 'string', example: 'Goa Beach & Heritage' },
          description: { type: 'string', nullable: true, example: '5-day trip exploring beaches and historical forts' },
          startDate: { type: 'string', format: 'date-time', example: '2026-10-01T00:00:00.000Z' },
          endDate: { type: 'string', format: 'date-time', example: '2026-10-05T00:00:00.000Z' },
          budget: { type: 'number', example: 45000 },
          currency: { type: 'string', example: 'INR' },
          userId: { type: 'string', format: 'uuid', example: 'c1f7a4b0-1234-4567-89ab-cdef01234567' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-08-22T04:36:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-08-22T04:36:00.000Z' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              email: { type: 'string' },
              avatar: { type: 'string', nullable: true },
            },
          },
          _count: {
            type: 'object',
            properties: {
              tripCities: { type: 'integer', example: 2 },
              itineraryItems: { type: 'integer', example: 5 },
              expenses: { type: 'integer', example: 3 },
            },
          },
        },
      },
      City: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'c1000000-0000-0000-0000-000000000013' },
          name: { type: 'string', example: 'Goa' },
          country: { type: 'string', example: 'India' },
          image: { type: 'string', nullable: true, example: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2' },
          description: { type: 'string', nullable: true, example: 'Known for its pristine beaches, vibrant nightlife, and Portuguese heritage architecture.' },
          latitude: { type: 'number', nullable: true, example: 15.2993 },
          longitude: { type: 'number', nullable: true, example: 74.124 },
          createdAt: { type: 'string', format: 'date-time', example: '2026-08-22T04:00:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-08-22T04:00:00.000Z' },
          _count: {
            type: 'object',
            properties: {
              activities: { type: 'integer', example: 8 },
            },
          },
        },
      },
      TripCity: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'tc-9912a1f0-0000-0000-0000-000000000001' },
          tripId: { type: 'string', format: 'uuid', example: 'e8d6411d-5b32-47d0-994c-8a1924619d0a' },
          cityId: { type: 'string', format: 'uuid', example: 'c1000000-0000-0000-0000-000000000013' },
          order: { type: 'integer', example: 0 },
          arrivalDate: { type: 'string', format: 'date-time', nullable: true, example: '2026-10-01T00:00:00.000Z' },
          departureDate: { type: 'string', format: 'date-time', nullable: true, example: '2026-10-05T00:00:00.000Z' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-08-22T05:42:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-08-22T05:42:00.000Z' },
          city: { $ref: '#/components/schemas/City' },
        },
      },
      Activity: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'a1000000-0000-0000-0000-000000000030' },
          cityId: { type: 'string', format: 'uuid', example: 'c1000000-0000-0000-0000-000000000013' },
          name: { type: 'string', example: 'Scuba Diving & Watersports at Grand Island' },
          description: { type: 'string', nullable: true, example: 'Speedboat ride, dolphin spotting, guided underwater scuba dive, jet ski, and parasailing.' },
          category: { type: 'string', example: 'Adventure' },
          duration: { type: 'integer', description: 'Duration in minutes', example: 360 },
          estimatedCost: { type: 'number', example: 35 },
          image: { type: 'string', nullable: true, example: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-08-22T04:00:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-08-22T04:00:00.000Z' },
          city: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              country: { type: 'string' },
            },
          },
        },
      },
      ItineraryItem: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'itin-881a-0000-0000-0000-000000000001' },
          tripId: { type: 'string', format: 'uuid', example: 'e8d6411d-5b32-47d0-994c-8a1924619d0a' },
          activityId: { type: 'string', format: 'uuid', nullable: true, example: 'a1000000-0000-0000-0000-000000000030' },
          dayNumber: { type: 'integer', example: 2 },
          date: { type: 'string', format: 'date-time', example: '2026-10-02T00:00:00.000Z' },
          startTime: { type: 'string', nullable: true, example: '09:00' },
          endTime: { type: 'string', nullable: true, example: '15:00' },
          title: { type: 'string', example: 'Scuba Diving at Grand Island' },
          notes: { type: 'string', nullable: true, example: 'Bring sunscreen and swimsuit' },
          estimatedCost: { type: 'number', example: 3500 },
          order: { type: 'integer', example: 0 },
          createdAt: { type: 'string', format: 'date-time', example: '2026-08-22T05:43:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-08-22T05:43:00.000Z' },
          activity: { $ref: '#/components/schemas/Activity' },
        },
      },
      Expense: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'exp-1100-0000-0000-0000-000000000001' },
          tripId: { type: 'string', format: 'uuid', example: 'e8d6411d-5b32-47d0-994c-8a1924619d0a' },
          category: { type: 'string', example: 'activities' },
          amount: { type: 'number', example: 4200 },
          date: { type: 'string', format: 'date-time', example: '2026-10-02T00:00:00.000Z' },
          description: { type: 'string', nullable: true, example: 'Grand Island scuba dive pass and rental equipment' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-08-22T05:44:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-08-22T05:44:00.000Z' },
        },
      },
      BudgetSummary: {
        type: 'object',
        properties: {
          tripId: { type: 'string', format: 'uuid', example: 'e8d6411d-5b32-47d0-994c-8a1924619d0a' },
          tripName: { type: 'string', example: 'Goa Coastal Exploration' },
          currency: { type: 'string', example: 'INR' },
          budget: { type: 'number', example: 60000 },
          spent: { type: 'number', example: 4200 },
          remaining: { type: 'number', example: 55800 },
          percentageUsed: { type: 'number', example: 7 },
          overBudget: { type: 'boolean', example: false },
          overBudgetAmount: { type: 'number', example: 0 },
          tripDays: { type: 'integer', example: 5 },
          averagePerDay: { type: 'number', example: 840 },
          dailyBudgetAllowance: { type: 'number', example: 12000 },
          categories: {
            type: 'object',
            properties: {
              transport: { type: 'number', example: 0 },
              food: { type: 'number', example: 0 },
              activities: { type: 'number', example: 4200 },
              accommodation: { type: 'number', example: 0 },
              shopping: { type: 'number', example: 0 },
              other: { type: 'number', example: 0 },
            },
          },
          expensesCount: { type: 'integer', example: 1 },
          expenses: {
            type: 'array',
            items: { $ref: '#/components/schemas/Expense' },
          },
        },
      },
      ShareLink: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'sh-0011-0000-0000-0000-000000000001' },
          tripId: { type: 'string', format: 'uuid', example: 'e8d6411d-5b32-47d0-994c-8a1924619d0a' },
          shareKey: { type: 'string', example: '8f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c' },
          shareUrl: { type: 'string', example: 'http://localhost:3000/shared/8f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c' },
          expiresAt: { type: 'string', format: 'date-time', nullable: true, example: null },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time', example: '2026-08-22T05:45:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-08-22T05:45:00.000Z' },
        },
      },
      PublicSharedTrip: {
        type: 'object',
        properties: {
          trip: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              description: { type: 'string', nullable: true },
              startDate: { type: 'string', format: 'date-time' },
              endDate: { type: 'string', format: 'date-time' },
              currency: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
          organizer: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              avatar: { type: 'string', nullable: true },
            },
          },
          cities: {
            type: 'array',
            items: { $ref: '#/components/schemas/TripCity' },
          },
          itinerary: {
            type: 'array',
            items: { $ref: '#/components/schemas/ItineraryItem' },
          },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        description: 'Creates a user account, hashes password, returns a JWT token, and sets an auth cookie.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Jane Doe' },
                  email: { type: 'string', format: 'email', example: 'jane@example.com' },
                  password: { type: 'string', minLength: 6, example: 'securepassword123' },
                },
                required: ['name', 'email', 'password'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Registration successful',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            user: { $ref: '#/components/schemas/User' },
                            token: { type: 'string' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          409: { description: 'Email already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in an existing user',
        description: 'Verifies email/password and returns a JWT token with a session cookie.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email', example: 'jane@example.com' },
                  password: { type: 'string', example: 'securepassword123' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            user: { $ref: '#/components/schemas/User' },
                            token: { type: 'string' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Log out current user',
        description: 'Clears the authentication session cookie.',
        responses: {
          200: {
            description: 'Logged out successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: { type: 'null' },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current authenticated user',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: {
            description: 'Current user retrieved',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            user: { $ref: '#/components/schemas/User' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { description: 'Unauthenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
    },
    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: {
            description: 'User profile retrieved',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            user: { $ref: '#/components/schemas/User' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { description: 'Unauthenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Update current user profile',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Jane Doe Updated' },
                  avatar: { type: 'string', format: 'uri', nullable: true, example: 'https://example.com/avatar.jpg' },
                  password: { type: 'string', minLength: 6, example: 'newPassword123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Profile updated successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            user: { $ref: '#/components/schemas/User' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { description: 'Unauthenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
    },
    '/trips': {
      get: {
        tags: ['Trips'],
        summary: 'Get all trips for the authenticated user',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: {
            description: 'Trips retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            trips: {
                              type: 'array',
                              items: { $ref: '#/components/schemas/Trip' },
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { description: 'Unauthenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
      post: {
        tags: ['Trips'],
        summary: 'Create a new trip',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Goa Adventure' },
                  description: { type: 'string', nullable: true, example: 'Beach and culture trip' },
                  startDate: { type: 'string', example: '2026-10-01' },
                  endDate: { type: 'string', example: '2026-10-05' },
                  budget: { type: 'number', example: 50000 },
                  currency: { type: 'string', example: 'INR' },
                },
                required: ['name', 'startDate', 'endDate'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Trip created successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            trip: { $ref: '#/components/schemas/Trip' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: { description: 'Validation error (e.g. endDate before startDate)', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          401: { description: 'Unauthenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
    },
    '/trips/{tripId}': {
      get: {
        tags: ['Trips'],
        summary: 'Get trip by ID',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'tripId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Trip ID (UUID)',
          },
        ],
        responses: {
          200: {
            description: 'Trip retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            trip: { $ref: '#/components/schemas/Trip' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { description: 'Unauthenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          403: { description: 'Forbidden - not owner or member', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          404: { description: 'Trip not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
      put: {
        tags: ['Trips'],
        summary: 'Update an existing trip',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'tripId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Goa & Gokarna Trip' },
                  description: { type: 'string', nullable: true, example: 'Updated beach trip' },
                  startDate: { type: 'string', example: '2026-10-01' },
                  endDate: { type: 'string', example: '2026-10-07' },
                  budget: { type: 'number', example: 60000 },
                  currency: { type: 'string', example: 'INR' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Trip updated successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            trip: { $ref: '#/components/schemas/Trip' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          404: { description: 'Trip not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
      delete: {
        tags: ['Trips'],
        summary: 'Delete a trip',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'tripId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Trip deleted successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: 'e8d6411d-5b32-47d0-994c-8a1924619d0a' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          403: { description: 'Forbidden - only owner can delete', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          404: { description: 'Trip not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
    },
    '/trips/{tripId}/cities': {
      get: {
        tags: ['Trip Cities'],
        summary: 'Get all cities linked to a trip',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'tripId', in: 'path', required: true, schema: { type: 'string' }, description: 'Trip ID (UUID)' },
        ],
        responses: {
          200: {
            description: 'Trip cities retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            tripCities: { type: 'array', items: { $ref: '#/components/schemas/TripCity' } },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { description: 'Unauthenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          404: { description: 'Trip not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
      post: {
        tags: ['Trip Cities'],
        summary: 'Add a city to a trip',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'tripId', in: 'path', required: true, schema: { type: 'string' }, description: 'Trip ID (UUID)' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  cityId: { type: 'string', format: 'uuid', example: 'c1000000-0000-0000-0000-000000000013' },
                  order: { type: 'integer', example: 0 },
                  arrivalDate: { type: 'string', example: '2026-10-01' },
                  departureDate: { type: 'string', example: '2026-10-05' },
                },
                required: ['cityId'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'City added to trip successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            tripCity: { $ref: '#/components/schemas/TripCity' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          404: { description: 'Trip or City not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          409: { description: 'City already added to trip', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
    },
    '/trips/{tripId}/cities/reorder': {
      put: {
        tags: ['Trip Cities'],
        summary: 'Reorder cities within a trip',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'tripId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  cityOrders: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        cityId: { type: 'string' },
                        order: { type: 'integer' },
                      },
                      required: ['cityId', 'order'],
                    },
                  },
                  cityIds: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Cities reordered successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            tripCities: { type: 'array', items: { $ref: '#/components/schemas/TripCity' } },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          404: { description: 'Trip not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
    },
    '/trips/{tripId}/cities/{cityId}': {
      delete: {
        tags: ['Trip Cities'],
        summary: 'Remove a city from a trip',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'tripId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'cityId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'City removed from trip successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            tripId: { type: 'string' },
                            cityId: { type: 'string' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          404: { description: 'City not in trip', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
    },
    '/cities': {
      get: {
        tags: ['Cities'],
        summary: 'Get list of cities with pagination, filter, and sorting',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'country', in: 'query', schema: { type: 'string' } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['name', 'country', 'createdAt'], default: 'name' } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } },
        ],
        responses: {
          200: {
            description: 'Cities retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            cities: { type: 'array', items: { $ref: '#/components/schemas/City' } },
                            pagination: {
                              type: 'object',
                              properties: {
                                page: { type: 'integer' },
                                limit: { type: 'integer' },
                                total: { type: 'integer' },
                                totalPages: { type: 'integer' },
                              },
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/cities/search': {
      get: {
        tags: ['Cities'],
        summary: 'Search cities with autocomplete / fast query',
        parameters: [
          { name: 'q', in: 'query', required: true, schema: { type: 'string' }, description: 'Search term for name/country/description' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: {
            description: 'Search results returned',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            cities: { type: 'array', items: { $ref: '#/components/schemas/City' } },
                            query: { type: 'string' },
                            total: { type: 'integer' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: { description: 'Missing query parameter', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
    },
    '/cities/{cityId}': {
      get: {
        tags: ['Cities'],
        summary: 'Get city details by ID',
        parameters: [
          { name: 'cityId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'City details returned',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            city: { $ref: '#/components/schemas/City' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          404: { description: 'City not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
    },
    '/activities': {
      get: {
        tags: ['Activities'],
        summary: 'Get paginated and filtered activities list',
        parameters: [
          { name: 'cityId', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'maxCost', in: 'query', schema: { type: 'number' } },
          { name: 'duration', in: 'query', schema: { type: 'integer' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'q', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['name', 'estimatedCost', 'duration', 'createdAt'], default: 'name' } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } },
        ],
        responses: {
          200: {
            description: 'Activities list retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            activities: { type: 'array', items: { $ref: '#/components/schemas/Activity' } },
                            pagination: {
                              type: 'object',
                              properties: {
                                page: { type: 'integer' },
                                limit: { type: 'integer' },
                                total: { type: 'integer' },
                                totalPages: { type: 'integer' },
                              },
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/activities/{activityId}': {
      get: {
        tags: ['Activities'],
        summary: 'Get single activity details by ID',
        parameters: [
          { name: 'activityId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Activity details returned',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            activity: { $ref: '#/components/schemas/Activity' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          404: { description: 'Activity not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
    },
    '/trips/{tripId}/itinerary': {
      get: {
        tags: ['Itinerary'],
        summary: 'Get trip itinerary items (day-wise breakdown)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'tripId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'dayNumber', in: 'query', schema: { type: 'integer' } },
          { name: 'date', in: 'query', schema: { type: 'string' } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['order', 'startTime', 'date', 'dayNumber'], default: 'order' } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } },
        ],
        responses: {
          200: {
            description: 'Itinerary retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            itinerary: { type: 'array', items: { $ref: '#/components/schemas/ItineraryItem' } },
                            days: { type: 'object' },
                            totalItems: { type: 'integer' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { description: 'Unauthenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          404: { description: 'Trip not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
      post: {
        tags: ['Itinerary'],
        summary: 'Add an itinerary item to a trip',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'tripId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  activityId: { type: 'string', format: 'uuid', nullable: true, example: 'a1000000-0000-0000-0000-000000000030' },
                  dayNumber: { type: 'integer', example: 2 },
                  date: { type: 'string', example: '2026-10-02' },
                  startTime: { type: 'string', example: '09:00' },
                  endTime: { type: 'string', example: '15:00' },
                  title: { type: 'string', example: 'Scuba Diving at Grand Island' },
                  notes: { type: 'string', nullable: true, example: 'Bring swimsuit and towel' },
                  estimatedCost: { type: 'number', example: 3500 },
                  order: { type: 'integer', example: 0 },
                },
                required: ['date', 'title'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Itinerary item created successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            itineraryItem: { $ref: '#/components/schemas/ItineraryItem' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: { description: 'Validation error (e.g. date outside trip window, endTime before startTime)', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          404: { description: 'Trip or Activity not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
    },
    '/trips/{tripId}/itinerary/reorder': {
      put: {
        tags: ['Itinerary'],
        summary: 'Reorder itinerary items within a trip',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'tripId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  itemOrders: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        itemId: { type: 'string' },
                        order: { type: 'integer' },
                        dayNumber: { type: 'integer' },
                      },
                      required: ['itemId', 'order'],
                    },
                  },
                  itemIds: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Itinerary items reordered successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            itineraryItems: { type: 'array', items: { $ref: '#/components/schemas/ItineraryItem' } },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          404: { description: 'Trip not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
    },
    '/itinerary/{itemId}': {
      get: {
        tags: ['Itinerary'],
        summary: 'Get single itinerary item by ID',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'itemId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Itinerary item retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            itineraryItem: { $ref: '#/components/schemas/ItineraryItem' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          404: { description: 'Itinerary item not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
      put: {
        tags: ['Itinerary'],
        summary: 'Update an itinerary item',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'itemId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  activityId: { type: 'string', format: 'uuid', nullable: true },
                  dayNumber: { type: 'integer' },
                  date: { type: 'string' },
                  startTime: { type: 'string' },
                  endTime: { type: 'string' },
                  title: { type: 'string' },
                  notes: { type: 'string', nullable: true },
                  estimatedCost: { type: 'number' },
                  order: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Itinerary item updated successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            itineraryItem: { $ref: '#/components/schemas/ItineraryItem' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          404: { description: 'Itinerary item not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
      delete: {
        tags: ['Itinerary'],
        summary: 'Delete an itinerary item',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'itemId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Itinerary item deleted successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            tripId: { type: 'string' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          404: { description: 'Itinerary item not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
    },
    '/trips/{tripId}/budget': {
      get: {
        tags: ['Budget & Expenses'],
        summary: 'Get aggregated budget summary and expenses for a trip',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'tripId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Budget summary retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: { $ref: '#/components/schemas/BudgetSummary' },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { description: 'Unauthenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          404: { description: 'Trip not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
    },
    '/trips/{tripId}/expenses': {
      post: {
        tags: ['Budget & Expenses'],
        summary: 'Record a new expense for a trip',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'tripId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  amount: { type: 'number', example: 4200 },
                  category: { type: 'string', example: 'activities', enum: ['transport', 'food', 'activities', 'accommodation', 'shopping', 'other'] },
                  date: { type: 'string', example: '2026-10-02' },
                  description: { type: 'string', nullable: true, example: 'Scuba dive equipment rental' },
                },
                required: ['amount', 'category'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Expense created successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            expense: { $ref: '#/components/schemas/Expense' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: { description: 'Validation error (e.g. invalid category or non-positive amount)', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          404: { description: 'Trip not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
    },
    '/expenses/{expenseId}': {
      get: {
        tags: ['Budget & Expenses'],
        summary: 'Get single expense by ID',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'expenseId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Expense retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            expense: { $ref: '#/components/schemas/Expense' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          404: { description: 'Expense not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
      put: {
        tags: ['Budget & Expenses'],
        summary: 'Update an expense item',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'expenseId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  amount: { type: 'number', example: 4500 },
                  category: { type: 'string', example: 'activities' },
                  date: { type: 'string', example: '2026-10-02' },
                  description: { type: 'string', nullable: true, example: 'Updated equipment cost' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Expense updated successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            expense: { $ref: '#/components/schemas/Expense' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          404: { description: 'Expense not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
      delete: {
        tags: ['Budget & Expenses'],
        summary: 'Delete an expense item',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'expenseId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Expense deleted successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            tripId: { type: 'string' },
                            amount: { type: 'number' },
                            category: { type: 'string' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          404: { description: 'Expense not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
    },
    '/trips/{tripId}/share': {
      get: {
        tags: ['Trip Sharing'],
        summary: 'Get active share status and link for a trip',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'tripId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Share status retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            isShared: { type: 'boolean' },
                            shareLink: { $ref: '#/components/schemas/ShareLink' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { description: 'Unauthenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          404: { description: 'Trip not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
      post: {
        tags: ['Trip Sharing'],
        summary: 'Generate or regenerate public share link for a trip',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'tripId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  expiresAt: { type: 'string', example: '2026-12-31' },
                  regenerate: { type: 'boolean', default: false },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Share link created/retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            shareLink: { $ref: '#/components/schemas/ShareLink' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          404: { description: 'Trip not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
      delete: {
        tags: ['Trip Sharing'],
        summary: 'Revoke sharing for a trip',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'tripId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Share link revoked successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            tripId: { type: 'string' },
                            isShared: { type: 'boolean', example: false },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
          404: { description: 'Trip not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
    },
    '/shared/{shareId}': {
      get: {
        tags: ['Trip Sharing'],
        summary: 'View public shared trip (No authentication required)',
        parameters: [
          { name: 'shareId', in: 'path', required: true, schema: { type: 'string' }, description: 'Share token / key' },
        ],
        responses: {
          200: {
            description: 'Public trip view retrieved successfully (sanitized)',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardSuccessResponse' },
                    {
                      properties: {
                        data: { $ref: '#/components/schemas/PublicSharedTrip' },
                      },
                    },
                  ],
                },
              },
            },
          },
          404: { description: 'Shared trip not found or expired', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardErrorResponse' } } } },
        },
      },
    },
  },
};
