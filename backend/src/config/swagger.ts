export const swaggerConfig = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Plata API',
      version: '1.0.0',
      description: 'Personal Finance Management API',
      contact: {
        name: 'Sandler Oliver',
        url: 'https://github.com/sandleroliver9-dot/plata',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.plata.app',
        description: 'Production server',
      },
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
        PaginationParams: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              minimum: 1,
              default: 1,
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 10,
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' },
              },
            },
            timestamp: { type: 'string' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', default: false },
            error: { type: 'string' },
            code: { type: 'string' },
            timestamp: { type: 'string' },
          },
        },
        Category: {
          type: 'object',
          required: ['id', 'user_id', 'nombre', 'tipo'],
          properties: {
            id: { type: 'string' },
            user_id: { type: 'string' },
            nombre: { type: 'string' },
            tipo: { type: 'string' },
            color: { type: 'string', nullable: true },
            prioridad: { type: 'integer', nullable: true },
            created_at: { type: 'string' },
            updated_at: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [],
};

export const swaggerOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Plata API Documentation',
};
