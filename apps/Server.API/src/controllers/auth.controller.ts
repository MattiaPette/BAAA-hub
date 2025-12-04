import type { Context } from 'koa';
import { ErrorCode } from '@baaa-hub/shared-types';
import config from '../config/index.js';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * Request body for user registration
 */
interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
}

/**
 * Keycloak Admin API token response
 */
interface KeycloakTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

/**
 * Keycloak error response
 */
interface KeycloakErrorResponse {
  error?: string;
  error_description?: string;
  errorMessage?: string;
}

/**
 * Get admin access token from Keycloak
 * Uses client credentials grant to get a token for the admin API
 */
const getAdminToken = async (): Promise<string> => {
  const { url, realm, adminClientId, adminClientSecret } = config.keycloak;

  if (!adminClientId || !adminClientSecret) {
    throw new ApiError(
      500,
      'Keycloak admin credentials not configured',
      ErrorCode.SERVER_ERROR,
    );
  }

  const tokenEndpoint = `${url}/realms/${realm}/protocol/openid-connect/token`;

  const formData = new URLSearchParams();
  formData.append('grant_type', 'client_credentials');
  formData.append('client_id', adminClientId);
  formData.append('client_secret', adminClientSecret);

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  if (!response.ok) {
    const error = (await response
      .json()
      .catch(() => ({}))) as KeycloakErrorResponse;
    console.error('Failed to get admin token:', error);
    throw new ApiError(
      500,
      'Failed to authenticate with Keycloak admin API',
      ErrorCode.SERVER_ERROR,
    );
  }

  const data = (await response.json()) as KeycloakTokenResponse;
  return data.access_token;
};

/**
 * Register a new user with Keycloak
 *
 * This endpoint creates a new user in Keycloak using the Admin REST API.
 * It requires the backend to have a service account with user creation permissions.
 *
 * Required Keycloak configuration:
 * 1. Create a client with "Service Account Roles" enabled
 * 2. Assign the "manage-users" role from the "realm-management" client
 * 3. Set KEYCLOAK_ADMIN_CLIENT_ID and KEYCLOAK_ADMIN_CLIENT_SECRET env vars
 */
export const register = async (ctx: Context): Promise<void> => {
  const body = ctx.request.body as RegisterRequest;

  // Validate request
  if (!body.email || !body.password) {
    ctx.status = 400;
    ctx.body = {
      error: 'Email and password are required',
      code: ErrorCode.VALIDATION_ERROR,
    };
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    ctx.status = 400;
    ctx.body = {
      error: 'Invalid email format',
      code: ErrorCode.VALIDATION_ERROR,
    };
    return;
  }

  // Validate password length
  if (body.password.length < 8) {
    ctx.status = 400;
    ctx.body = {
      error: 'Password must be at least 8 characters',
      code: 'PASSWORD_POLICY',
    };
    return;
  }

  const { url, realm } = config.keycloak;

  try {
    // Get admin token
    const adminToken = await getAdminToken();

    // Create user in Keycloak
    const usersEndpoint = `${url}/admin/realms/${realm}/users`;

    const userPayload = {
      username: body.username || body.email,
      email: body.email,
      enabled: true,
      emailVerified: false,
      credentials: [
        {
          type: 'password',
          value: body.password,
          temporary: false,
        },
      ],
    };

    const createResponse = await fetch(usersEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(userPayload),
    });

    if (createResponse.status === 201) {
      // User created successfully
      ctx.status = 201;
      ctx.body = {
        message: 'User registered successfully',
      };
      return;
    }

    if (createResponse.status === 409) {
      // User already exists
      ctx.status = 409;
      ctx.body = {
        error: 'A user with this email already exists',
        code: 'USER_EXISTS',
      };
      return;
    }

    // Handle other errors
    const errorData = (await createResponse
      .json()
      .catch(() => ({}))) as KeycloakErrorResponse;

    // Check for specific error messages
    if (
      errorData.errorMessage?.toLowerCase().includes('username') ||
      errorData.error_description?.toLowerCase().includes('username')
    ) {
      ctx.status = 409;
      ctx.body = {
        error: 'Username is already taken',
        code: 'USERNAME_EXISTS',
      };
      return;
    }

    if (
      errorData.errorMessage?.toLowerCase().includes('password') ||
      errorData.error_description?.toLowerCase().includes('password')
    ) {
      ctx.status = 400;
      ctx.body = {
        error: 'Password does not meet requirements',
        code: 'PASSWORD_POLICY',
      };
      return;
    }

    console.error('Keycloak user creation error:', errorData);
    ctx.status = 500;
    ctx.body = {
      error: 'Failed to create user',
      code: ErrorCode.SERVER_ERROR,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      ctx.status = error.statusCode;
      ctx.body = {
        error: error.message,
        code: error.code,
      };
      return;
    }

    console.error('Registration error:', error);
    ctx.status = 500;
    ctx.body = {
      error: 'An error occurred during registration',
      code: ErrorCode.SERVER_ERROR,
    };
  }
};
