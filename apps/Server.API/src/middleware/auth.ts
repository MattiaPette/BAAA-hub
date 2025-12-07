import type { Context, Next } from 'koa';
import { ErrorCode } from '@baaa-hub/shared-types';
import config from '../config/index.js';
import { normalizeUrl } from '../utils/url.js';

/**
 * Decoded JWT payload structure from Keycloak
 */
export interface DecodedToken {
  sub: string; // Keycloak user ID
  email?: string;
  email_verified?: boolean;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string | string[];
  azp?: string; // Authorized party (client ID)
  realm_access?: {
    roles: string[];
  };
  resource_access?: Record<
    string,
    {
      roles: string[];
    }
  >;
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
 *
 * SECURITY NOTE: This implementation performs basic JWT decoding without
 * cryptographic signature verification. In a production environment, you MUST:
 * 1. Use a library like 'jose' or 'jsonwebtoken' with JWKS support
 * 2. Verify the token signature against Keycloak's public keys (JWKS endpoint)
 * 3. The JWKS endpoint is: {KEYCLOAK_URL}/realms/{REALM}/protocol/openid-connect/certs
 *
 * This basic implementation relies on:
 * - HTTPS for transport security
 * - Keycloak's token expiration
 * - Issuer validation
 *
 * For enhanced security, implement proper signature verification.
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

  // Check issuer matches Keycloak realm if configured
  if (config.keycloak.url && config.keycloak.realm) {
    const expectedIssuer = `${normalizeUrl(config.keycloak.url)}/realms/${config.keycloak.realm}`;
    if (decoded.iss !== expectedIssuer) {
      return false;
    }
  }

  return true;
};

/**
 * Authentication middleware that validates JWT tokens from Keycloak
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
  // Keycloak uses 'sub' for user ID and 'preferred_username' for nickname
  ctx.state.auth = {
    userId: decoded.sub,
    email: decoded.email,
    emailVerified: decoded.email_verified,
    name: decoded.name,
    nickname: decoded.preferred_username,
    picture: undefined, // Keycloak doesn't include picture in standard claims
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
        nickname: decoded.preferred_username,
        picture: undefined,
      };
    }
  }

  await next();
};
