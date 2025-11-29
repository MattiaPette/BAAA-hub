import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { koaSwagger } from 'koa2-swagger-ui';
import config from './config/index.js';
import { openApiSpec } from './config/openapi.js';
import { connectDatabase } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { userRouter } from './routes/user.routes.js';
import { imageRouter } from './routes/image.routes.js';
import { adminRouter } from './routes/admin.routes.js';
import { webhookRouter } from './routes/webhook.routes.js';
import { initializeStorage } from './services/storage.service.js';
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

/**
 * Raw body middleware for image uploads
 * Must run BEFORE body parser to capture raw binary data
 */
app.use(async (ctx, next) => {
  const isImageUpload =
    ctx.method === 'PUT' &&
    ctx.path.startsWith('/api/images/') &&
    ctx.request.headers['content-type']?.startsWith('image/');

  if (isImageUpload) {
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      ctx.req.on('data', (chunk: Buffer) => chunks.push(chunk));
      ctx.req.on('end', () => {
        ctx.request.body = Buffer.concat(chunks);
        resolve();
      });
      ctx.req.on('error', reject);
    });
    await next();
  } else {
    await next();
  }
});

/**
 * Configure body parser for non-image requests
 */
app.use(
  bodyParser({
    enableTypes: ['json', 'form', 'text'],
    // Increase limit for larger payloads
    formLimit: '1mb',
    jsonLimit: '1mb',
    textLimit: '1mb',
  }),
);

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
 * Swagger UI route
 */
app.use(
  koaSwagger({
    routePrefix: '/api/docs',
    swaggerOptions: {
      spec: openApiSpec,
    },
  }),
);

/**
 * Register routes
 */
app.use(healthRouter.routes()).use(healthRouter.allowedMethods());
app.use(userRouter.routes()).use(userRouter.allowedMethods());
app.use(imageRouter.routes()).use(imageRouter.allowedMethods());
app.use(adminRouter.routes()).use(adminRouter.allowedMethods());
app.use(webhookRouter.routes()).use(webhookRouter.allowedMethods());

/**
 * Start server
 */
const startServer = async (): Promise<void> => {
  console.log('Starting server...');
  try {
    // Connect to database
    await connectDatabase();

    // Initialize object storage (MinIO)
    await initializeStorage();

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
