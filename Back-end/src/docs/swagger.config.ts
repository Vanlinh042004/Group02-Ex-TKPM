import swaggerJSDoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Group02 TKPM API Documentation',
      version: '1.0.0',
      description:
        'API Documentation for Student Management System with Clean Architecture',
      contact: {
        name: 'Group02 TKPM',
        email: 'group02@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'http://localhost:5000',
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
      responses: {
        BadRequest: {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Invalid request data' },
                  errors: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Resource not found' },
                },
              },
            },
          },
        },
        InternalError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Internal server error' },
                },
              },
            },
          },
        },
        Unauthorized: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Unauthorized access' },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Students',
        description: 'Student management operations',
      },
      {
        name: 'Faculties',
        description: 'Faculty management operations',
      },
      {
        name: 'Programs',
        description: 'Program management operations',
      },
      {
        name: 'Statuses',
        description: 'Status management operations',
      },
      {
        name: 'Courses',
        description: 'Course management operations',
      },
      {
        name: 'Classes',
        description: 'Class management operations',
      },
      {
        name: 'Registrations',
        description: 'Course registration operations',
      },
      {
        name: 'Email Domains',
        description: 'Email domain management operations',
      },
      {
        name: 'Phone Number Configs',
        description: 'Phone number configuration operations',
      },
    ],
  },
  apis: [
    './src/docs/routes/*.yaml',
    './src/docs/schemas/*.yaml',
    './src/components/*/routes/*.ts',
    './src/infrastructure/routes/*.ts',
  ],
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Group02 TKPM API Docs',
    })
  );

  // Serve swagger.json
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};

export default specs;
