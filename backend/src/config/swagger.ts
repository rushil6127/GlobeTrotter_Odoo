export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'GlobeTrotter REST API',
    version: '1.0.0',
    description:
      'Official REST API documentation for the GlobeTrotter travel planning web application. Provides endpoints for Authentication, User Profile management, Trip CRUD, City discovery, and Activity exploration.',
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
          id: { type: 'string', format: 'uuid', example: '3f7a1e0b-8d4c-4e8a-bf6d-92a15c8e4123' },
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
      Activity: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
          cityId: { type: 'string', format: 'uuid', example: '3f7a1e0b-8d4c-4e8a-bf6d-92a15c8e4123' },
          name: { type: 'string', example: 'Scuba Diving at Grand Island' },
          description: { type: 'string', nullable: true, example: 'Experience underwater marine life with certified instructors.' },
          category: { type: 'string', example: 'Adventure' },
          duration: { type: 'integer', description: 'Duration in minutes', example: 180 },
          estimatedCost: { type: 'number', example: 3500 },
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
  },
};
