import type { Context, Next } from 'koa';
import { ErrorCode } from '@baaa-hub/shared-types';
import config from '../config/index.js';
import crypto from 'crypto';

/**
 * Extended context for webhook requests
 */
export interface WebhookContext extends Context {
  state: Context['state'] & {
    webhookValidated: boolean;
  };
}

/**
 * Validates that the webhook request has a valid secret header.
 * Uses constant-time comparison to prevent timing attacks.
 */
export const webhookSecretMiddleware = async (
  ctx: WebhookContext,
  next: Next,
): Promise<void> => {
  const secret = ctx.headers['x-webhook-secret'];

  if (!secret || typeof secret !== 'string') {
    ctx.status = 401;
    ctx.body = {
      error: 'Missing webhook secret',
      code: ErrorCode.UNAUTHORIZED,
    };
    return;
  }

  const configuredSecret = config.webhook.auth0Secret;

  if (!configuredSecret) {
    console.error('AUTH0_WEBHOOK_SECRET is not configured');
    ctx.status = 500;
    ctx.body = {
      error: 'Webhook secret not configured',
      code: ErrorCode.INTERNAL_SERVER_ERROR,
    };
    return;
  }

  // Use constant-time comparison to prevent timing attacks
  const isValid =
    secret.length === configuredSecret.length &&
    crypto.timingSafeEqual(Buffer.from(secret), Buffer.from(configuredSecret));

  if (!isValid) {
    ctx.status = 401;
    ctx.body = {
      error: 'Invalid webhook secret',
      code: ErrorCode.UNAUTHORIZED,
    };
    return;
  }

  ctx.state.webhookValidated = true;
  await next();
};
