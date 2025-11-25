import { t } from '@lingui/core/macro';
import { AuthErrorCode } from '../../providers/AuthProvider/AuthProvider.model';
import { GetErrorDescriptionHelper } from './getErrorDescription.model';

/**
 * Maps an authentication error code to a localized, user-facing description.
 * - Uses lingui's t() macro to produce translatable strings.
 * - Covers known AuthErrorCode enum values and returns a specific message for each.
 * - Returns a generic fallback message for unknown or unhandled error codes.
 *
 * @param {Object} params - Function parameters.
 * @param {AuthErrorCode} params.errorCode - The authentication error code to describe.
 * @returns {string} A translated, human-readable description suitable for display to the user.
 */
export const getErrorDescription: GetErrorDescriptionHelper = ({
  errorCode,
}) => {
  switch (errorCode) {
    case AuthErrorCode.ACCESS_DENIED:
      return t({
        message: 'Access denied. Incorrect username and/or password',
      });
    case AuthErrorCode.INVALID_USER_PASSWORD:
      return t({ message: 'Incorrect username or password' });
    case AuthErrorCode.PASSWORD_LEAKED:
      return t({
        message:
          'This password has been compromised in a data breach. Please choose a different password to protect your account',
      });
    case AuthErrorCode.TOO_MANY_ATTEMPTS:
      return t({
        message:
          'Your account has been locked after too many consecutive login attempts. We have sent you an email with instructions on how to unlock it',
      });
    case AuthErrorCode.BLOCKED_USER:
      return t({
        message: 'Your account has been blocked for security reasons',
      });
    case AuthErrorCode.UNAUTHORIZED:
      return t({ message: 'Unauthorized. Please verify your credentials' });
    case AuthErrorCode.MFA_REQUIRED:
      return t({ message: 'Multi-factor authentication is required' });
    case AuthErrorCode.MFA_INVALID_CODE:
      return t({ message: 'Invalid authentication code' });
    case AuthErrorCode.MFA_REGISTRATION_REQUIRED:
      return t({
        message: 'You must register for multi-factor authentication',
      });
    case AuthErrorCode.INVALID_GRANT:
      return t({ message: 'Invalid credentials or session expired' });
    case AuthErrorCode.EXPIRED_TOKEN:
      return t({
        message: 'Your session has expired. Please log in again',
      });
    case AuthErrorCode.SERVER_ERROR:
      return t({
        message: 'A server error has occurred. Please try again later',
      });
    case AuthErrorCode.TEMPORARILY_UNAVAILABLE:
      return t({
        message:
          'The service is temporarily unavailable. Please try again later',
      });
    case AuthErrorCode.USER_EXISTS:
      return t({ message: 'There is already a user with this email address' });
    case AuthErrorCode.USERNAME_EXISTS:
      return t({ message: 'This username is already in use' });
    case AuthErrorCode.INVALID_SIGNUP:
      return t({
        message:
          'Invalid registration. Please check the information you entered',
      });
    case AuthErrorCode.PASSWORD_STRENGTH_ERROR:
      return t({
        message: 'The password does not meet the minimum security requirements',
      });
    case AuthErrorCode.PASSWORD_NO_USER_INFO_ERROR:
      return t({
        message: 'The password cannot contain personal information',
      });
    case AuthErrorCode.PASSWORD_DICTIONARY_ERROR:
      return t({
        message: 'Your password is too common. Choose a more secure one',
      });
    case AuthErrorCode.TOO_MANY_REQUESTS:
      return t({
        message: 'Too many attempts. Please try again in a few minutes',
      });
    case AuthErrorCode.NETWORK_ERROR:
      return t({
        message: 'Network error. Check your internet connection',
      });
    case AuthErrorCode.TIMEOUT:
      return t({ message: 'The request has expired. Please try again' });
    case AuthErrorCode.INVALID_TOKEN:
      return t({ message: 'Invalid token' });
    case AuthErrorCode.LOGIN_REQUIRED:
      return t({ message: 'You must log in' });
    case AuthErrorCode.CONSENT_REQUIRED:
      return t({ message: 'Consent is required' });
    case AuthErrorCode.INTERACTION_REQUIRED:
      return t({ message: 'Additional interaction is required' });
    case AuthErrorCode.INVALID_REQUEST:
      return t({ message: 'Invalid request' });
    case AuthErrorCode.UNAUTHORIZED_CLIENT:
      return t({ message: 'Unauthorized client' });
    case AuthErrorCode.UNSUPPORTED_RESPONSE_TYPE:
      return t({ message: 'Response type not supported' });
    case AuthErrorCode.INVALID_SCOPE:
      return t({ message: 'Invalid scope' });
    case AuthErrorCode.INVALID_CONFIGURATION:
      return t({ message: 'Invalid configuration' });
    case AuthErrorCode.UNKNOWN_ERROR:
    default:
      return t({
        message: 'An error occurred during authentication. Please try again',
      });
  }
};
