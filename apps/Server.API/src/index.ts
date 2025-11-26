import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { koaSwagger } from 'koa2-swagger-ui';
import config from './config/index.js';
import { connectDatabase } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { userRouter } from './routes/user.routes.js';
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
    description: 'RESTful API for the Activity Tracker application',
  },
  servers: [
    {
      url: `http://localhost:${config.port}`,
      description: 'Development server',
    },
  ],
  paths: {},
  components: {
    schemas: {},
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
app.use(userRouter.routes()).use(userRouter.allowedMethods());

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
