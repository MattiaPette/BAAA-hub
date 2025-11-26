import type { Context, Next } from 'koa';
import { ErrorCode } from '@baaa-hub/shared-types';
import config from '../config/index.js';

/**
 * Decoded JWT payload structure from Auth0
 */
export interface DecodedToken {
  sub: string; // Auth0 user ID (e.g., "auth0|xxxxx")
  email?: string;
  email_verified?: boolean;
  name?: string;
  nickname?: string;
  picture?: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string | string[];
}

/**
 * Extended Koa context with auth information
 */
export interface AuthContext extends Context {
  state: Context['state'] & {
    auth: {
      userId: string;
      email?: string;
      emailVerified?: boolean;
      name?: string;
      nickname?: string;
      picture?: string;
    };
  };
}

/**
 * Extract and decode JWT token from Authorization header
 * Note: This performs basic validation. For production, use a proper JWT library
 * with signature verification against Auth0's public keys.
 */
const decodeToken = (token: string): DecodedToken | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf-8'),
    );

    return decoded as DecodedToken;
  } catch {
    return null;
  }
};

/**
 * Validate token expiration and issuer
 */
const validateToken = (decoded: DecodedToken): boolean => {
  const now = Math.floor(Date.now() / 1000);

  // Check expiration
  if (decoded.exp && decoded.exp < now) {
    return false;
  }

  // Check issuer matches Auth0 domain if configured
  if (config.auth0.domain) {
    const expectedIssuer = `https://${config.auth0.domain}/`;
    if (decoded.iss !== expectedIssuer) {
      return false;
    }
  }

  return true;
};

/**
 * Authentication middleware that validates JWT tokens from Auth0
 * Extracts user information and attaches it to the context state
 */
export const authMiddleware = async (
  ctx: AuthContext,
  next: Next,
): Promise<void> => {
  const authHeader = ctx.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.status = 401;
    ctx.body = {
      error: 'Authorization header missing or invalid',
      code: ErrorCode.UNAUTHORIZED,
    };
    return;
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  const decoded = decodeToken(token);

  if (!decoded) {
    ctx.status = 401;
    ctx.body = {
      error: 'Invalid token format',
      code: ErrorCode.INVALID_TOKEN,
    };
    return;
  }

  if (!validateToken(decoded)) {
    ctx.status = 401;
    ctx.body = {
      error: 'Token expired or invalid',
      code: ErrorCode.INVALID_TOKEN,
    };
    return;
  }

  // Attach auth info to context
  ctx.state.auth = {
    userId: decoded.sub,
    email: decoded.email,
    emailVerified: decoded.email_verified,
    name: decoded.name,
    nickname: decoded.nickname,
    picture: decoded.picture,
  };

  await next();
};

/**
 * Optional authentication middleware
 * Allows requests without auth but still extracts user info if present
 */
export const optionalAuthMiddleware = async (
  ctx: AuthContext,
  next: Next,
): Promise<void> => {
  const authHeader = ctx.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = decodeToken(token);

    if (decoded && validateToken(decoded)) {
      ctx.state.auth = {
        userId: decoded.sub,
        email: decoded.email,
        emailVerified: decoded.email_verified,
        name: decoded.name,
        nickname: decoded.nickname,
        picture: decoded.picture,
      };
    }
  }

  await next();
};
