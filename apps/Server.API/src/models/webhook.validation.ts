import { z } from 'zod';

/**
 * Zod schema for Keycloak Event Listener webhook payload
 * This validates the payload sent by a Keycloak event listener to sync MFA/email verification status
 */
export const keycloakUserUpdateWebhookSchema = z.object({
  /** Keycloak user ID (UUID format) */
  user_id: z.string().min(1, 'User ID is required'),
  /** User's email address */
  email: z.string().email('Invalid email address'),
  /** Whether the user's email is verified in Keycloak */
  email_verified: z.boolean(),
  /** Whether MFA is enabled for the user */
  mfa_enabled: z.boolean(),
  /** Primary MFA type if MFA is enabled (optional, can be null) */
  mfa_type: z.string().nullable().optional(),
});

export type KeycloakUserUpdateWebhookInput = z.infer<
  typeof keycloakUserUpdateWebhookSchema
>;
