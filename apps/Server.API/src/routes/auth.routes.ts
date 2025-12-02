import Router from '@koa/router';
import { register } from '../controllers/auth.controller.js';

const authRouter = new Router({ prefix: '/api/auth' });

/**
 * Public authentication routes
 * These routes do not require authentication
 */

/**
 * POST /api/auth/register
 * Register a new user with Keycloak
 *
 * Request body:
 * {
 *   email: string;      // User's email address
 *   password: string;   // User's password (min 8 characters)
 *   username?: string;  // Optional username (defaults to email)
 * }
 *
 * Response (201): { message: "User registered successfully" }
 * Response (400): { error: string, code: "VALIDATION_ERROR" | "PASSWORD_POLICY" }
 * Response (409): { error: string, code: "USER_EXISTS" | "USERNAME_EXISTS" }
 * Response (500): { error: string, code: "SERVER_ERROR" }
 */
authRouter.post('/register', register);

export { authRouter };
