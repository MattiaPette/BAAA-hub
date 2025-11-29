import { MfaType } from '@baaa-hub/shared-types';
import { User as UserMongooseModel } from '../models/user.model.js';
import { auth0UserUpdateWebhookSchema } from '../models/webhook.validation.js';
import { WebhookContext } from '../middleware/webhook.js';

/**
 * Map Auth0 MFA factor types to our MfaType enum
 */
const mapMfaType = (mfaType?: string): MfaType => {
  if (!mfaType) return MfaType.NONE;

  const typeMapping: Record<string, MfaType> = {
    otp: MfaType.TOTP,
    totp: MfaType.TOTP,
    sms: MfaType.SMS,
    email: MfaType.EMAIL,
    push: MfaType.PUSH,
    'push-notification': MfaType.PUSH,
    webauthn: MfaType.WEBAUTHN,
    'webauthn-roaming': MfaType.WEBAUTHN,
    'webauthn-platform': MfaType.WEBAUTHN,
    'recovery-code': MfaType.RECOVERY_CODE,
  };

  return typeMapping[mfaType.toLowerCase()] || MfaType.NONE;
};

/**
 * Handle Auth0 Post-Login Action webhook
 * Updates user's MFA status and email verification in the database
 */
export const handleAuth0UserUpdate = async (
  ctx: WebhookContext,
): Promise<void> => {
  // Validate request body
  const validationResult = auth0UserUpdateWebhookSchema.safeParse(
    ctx.request.body,
  );
  if (!validationResult.success) {
    throw validationResult.error;
  }

  const { user_id, email_verified, mfa_enabled, mfa_type } =
    validationResult.data;

  // Find user by Auth0 ID
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
