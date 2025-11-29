import { t } from '@lingui/core/macro';
import { MfaType } from '@baaa-hub/shared-types';

/**
 * Get translated MFA type labels for display
 */
export const getMfaTypeLabels = (): Record<MfaType, string> => ({
  [MfaType.NONE]: t`None`,
  [MfaType.TOTP]: t`Authenticator App`,
  [MfaType.SMS]: t`SMS`,
  [MfaType.EMAIL]: t`Email`,
  [MfaType.PUSH]: t`Push Notification`,
  [MfaType.WEBAUTHN]: t`Security Key`,
  [MfaType.RECOVERY_CODE]: t`Recovery Code`,
});

/**
 * Get translated MFA type short labels for admin table display
 */
export const getMfaTypeShortLabels = (): Record<MfaType, string> => ({
  [MfaType.NONE]: t`None`,
  [MfaType.TOTP]: t`TOTP`,
  [MfaType.SMS]: t`SMS`,
  [MfaType.EMAIL]: t`Email`,
  [MfaType.PUSH]: t`Push`,
  [MfaType.WEBAUTHN]: t`WebAuthn`,
  [MfaType.RECOVERY_CODE]: t`Recovery`,
});

/**
 * Get translated MFA type descriptions
 */
export const getMfaTypeDescriptions = (): Record<MfaType, string> => ({
  [MfaType.NONE]: t`No two-factor authentication enabled`,
  [MfaType.TOTP]: t`Time-based one-time password via authenticator app (Google Authenticator, Authy, etc.). Recommended for strongest security.`,
  [MfaType.SMS]: t`One-time codes sent via SMS to your phone number`,
  [MfaType.EMAIL]: t`One-time codes sent to your email address. Convenient but lower security than authenticator apps.`,
  [MfaType.PUSH]: t`Push notifications via Guardian app`,
  [MfaType.WEBAUTHN]: t`Physical security key (FIDO2/WebAuthn)`,
  [MfaType.RECOVERY_CODE]: t`Backup recovery codes`,
});
