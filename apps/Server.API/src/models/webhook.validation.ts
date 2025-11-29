import { z } from 'zod';

/**
 * Zod schema for Auth0 Post-Login Action webhook payload
 * This validates the payload sent by Auth0 to sync MFA/email verification status
 */
export const auth0UserUpdateWebhookSchema = z.object({
  /** Auth0 user ID (e.g., "auth0|xxxxx") */
  user_id: z.string().min(1, 'User ID is required'),
  /** User's email address */
  email: z.string().email('Invalid email address'),
  /** Whether the user's email is verified in Auth0 */
  email_verified: z.boolean(),
  /** Whether MFA is enabled for the user */
  mfa_enabled: z.boolean(),
  /** Primary MFA type if MFA is enabled (optional, can be null) */
  mfa_type: z.string().nullable().optional(),
});

export type Auth0UserUpdateWebhookInput = z.infer<
  typeof auth0UserUpdateWebhookSchema
>;
