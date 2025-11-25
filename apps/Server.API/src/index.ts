import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { koaSwagger } from 'koa2-swagger-ui';
import config from './config/index.js';
import { connectDatabase } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import bookRoutes from './routes/bookRoutes.js';
import path from 'path';

/**
 * Create Koa application
 */
const app = new Koa();

/**
 * Apply global middleware
 */
app.use(errorHandler);
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  }),
);
app.use(bodyParser());

/**
 * Health check route
 */
const healthRouter = new Router();
healthRouter.get('/health', ctx => {
  ctx.body = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
});

/**
 * Swagger specification
 */
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Activity Tracker API',
    version: '1.0.0',
    description:
      'RESTful API for managing books in the Activity Tracker application',
  },
  servers: [
    {
      url: `http://localhost:${config.port}`,
      description: 'Development server',
    },
  ],
  paths: {
    '/api/books': {
      get: {
        summary: 'Get all books',
        description:
          'Retrieve a list of all books with optional filtering and pagination',
        tags: ['Books'],
        parameters: [
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', default: 1 },
            description: 'Page number',
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 10 },
            description: 'Number of items per page',
          },
          {
            in: 'query',
            name: 'genre',
            schema: { type: 'string' },
            description: 'Filter by genre',
          },
          {
            in: 'query',
            name: 'author',
            schema: { type: 'string' },
            description: 'Filter by author (case-insensitive partial match)',
          },
          {
            in: 'query',
            name: 'available',
            schema: { type: 'boolean' },
            description: 'Filter by availability',
          },
        ],
        responses: {
          '200': {
            description: 'Successfully retrieved books',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Book' },
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create a new book',
        description: 'Add a new book to the library',
        tags: ['Books'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BookInput' },
            },
          },
        },
        responses: {
          '201': { description: 'Book created successfully' },
          '400': { description: 'Validation error' },
          '409': { description: 'Book with this ISBN already exists' },
        },
      },
    },
    '/api/books/{id}': {
      get: {
        summary: 'Get a book by ID',
        description: 'Retrieve a single book by its ID',
        tags: ['Books'],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Book ID',
          },
        ],
        responses: {
          '200': { description: 'Successfully retrieved book' },
          '404': { description: 'Book not found' },
        },
      },
      put: {
        summary: 'Update a book',
        description: 'Update an existing book by its ID',
        tags: ['Books'],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Book ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BookInput' },
            },
          },
        },
        responses: {
          '200': { description: 'Book updated successfully' },
          '400': { description: 'Validation error' },
          '404': { description: 'Book not found' },
        },
      },
      delete: {
        summary: 'Delete a book',
        description: 'Delete a book by its ID',
        tags: ['Books'],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Book ID',
          },
        ],
        responses: {
          '200': { description: 'Book deleted successfully' },
          '404': { description: 'Book not found' },
        },
      },
    },
  },
  components: {
    schemas: {
      Book: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string' },
          author: { type: 'string' },
          isbn: { type: 'string' },
          publishedYear: { type: 'integer' },
          genre: { type: 'string' },
          description: { type: 'string' },
          available: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      BookInput: {
        type: 'object',
        required: ['title', 'author', 'isbn', 'publishedYear', 'genre'],
        properties: {
          title: { type: 'string', maxLength: 200 },
          author: { type: 'string', maxLength: 100 },
          isbn: { type: 'string' },
          publishedYear: { type: 'integer' },
          genre: { type: 'string', maxLength: 50 },
          description: { type: 'string', maxLength: 1000 },
          available: { type: 'boolean', default: true },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
          pages: { type: 'integer' },
        },
      },
    },
  },
};

/**
 * Swagger UI route
 */
app.use(
  koaSwagger({
    routePrefix: '/api/docs',
    swaggerOptions: {
      spec: swaggerSpec,
    },
  }),
);

/**
 * Register routes
 */
app.use(healthRouter.routes()).use(healthRouter.allowedMethods());
app.use(bookRoutes.routes()).use(bookRoutes.allowedMethods());

/**
 * Start server
 */
const startServer = async (): Promise<void> => {
  console.log('Starting server...');
  try {
    // Connect to database
    await connectDatabase();

    // Start listening
    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(
        `📚 API Documentation available at http://localhost:${config.port}/api/docs`,
      );
      console.log(
        `🏥 Health check available at http://localhost:${config.port}/health`,
      );
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server if this file is run directly
if (
  path.normalize(import.meta.url) ===
  path.normalize(`file://${process.argv[1]}`)
) {
  startServer();
}

export { app, startServer };
