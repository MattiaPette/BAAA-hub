import { MfaType } from '@baaa-hub/shared-types';
import { User as UserMongooseModel } from '../models/user.model.js';
import { keycloakUserUpdateWebhookSchema } from '../models/webhook.validation.js';
import { WebhookContext } from '../middleware/webhook.js';

/**
 * Map Keycloak MFA factor types to our MfaType enum
 *
 * Keycloak credential types:
 * - 'otp' / 'totp' / 'otp-credentials': Time-based One-Time Password
 * - 'sms': SMS-based verification
 * - 'email': Email-based verification
 * - 'push' / 'push-notification': Push notification
 * - 'webauthn' / 'webauthn-roaming' / 'webauthn-platform': WebAuthn/FIDO2
 * - 'webauthn-credentials' / 'webauthn-passwordless': Keycloak WebAuthn credentials
 * - 'recovery-code': Backup recovery codes
 */
const mapMfaType = (mfaType?: string): MfaType => {
  if (!mfaType) return MfaType.NONE;

  // Standard Keycloak credential type mappings
  const typeMapping: Record<string, MfaType> = {
    // TOTP authenticator apps
    otp: MfaType.TOTP,
    totp: MfaType.TOTP,
    'otp-credentials': MfaType.TOTP, // Keycloak internal credential type
    // SMS-based MFA
    sms: MfaType.SMS,
    // Email-based MFA
    email: MfaType.EMAIL,
    // Push notification MFA
    push: MfaType.PUSH,
    'push-notification': MfaType.PUSH,
    // WebAuthn/FIDO2 security keys and platform authenticators
    webauthn: MfaType.WEBAUTHN,
    'webauthn-roaming': MfaType.WEBAUTHN, // Roaming authenticators (USB keys)
    'webauthn-platform': MfaType.WEBAUTHN, // Platform authenticators (Touch ID, Windows Hello)
    'webauthn-credentials': MfaType.WEBAUTHN, // Keycloak internal credential type
    'webauthn-passwordless': MfaType.WEBAUTHN, // Keycloak passwordless WebAuthn
    // Recovery codes
    'recovery-code': MfaType.RECOVERY_CODE,
  };

  return typeMapping[mfaType.toLowerCase()] || MfaType.NONE;
};

/**
 * Handle Keycloak Event Listener webhook
 * Updates user's MFA status and email verification in the database
 */
export const handleKeycloakUserUpdate = async (
  ctx: WebhookContext,
): Promise<void> => {
  // Validate request body
  const validationResult = keycloakUserUpdateWebhookSchema.safeParse(
    ctx.request.body,
  );
  if (!validationResult.success) {
    throw validationResult.error;
  }

  const { user_id, email_verified, mfa_enabled, mfa_type } =
    validationResult.data;

  // Find user by Keycloak ID
  const user = await UserMongooseModel.findByAuthId(user_id);

  if (!user) {
    // User not found in our database - this is not an error
    // The user may not have completed profile creation yet
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: 'User not found in database, skipping update',
      user_id,
    };
    return;
  }

  // Update user's MFA and email verification status
  user.isEmailVerified = email_verified;
  user.mfaEnabled = mfa_enabled;
  user.mfaType = mfa_enabled ? mapMfaType(mfa_type ?? undefined) : MfaType.NONE;

  await user.save();

  ctx.status = 200;
  ctx.body = {
    success: true,
    message: 'User updated successfully',
    user_id,
    email_verified,
    mfa_enabled,
    mfa_type: user.mfaType,
  };
};
