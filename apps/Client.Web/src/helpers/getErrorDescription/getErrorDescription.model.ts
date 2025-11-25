import { AuthErrorCode } from '../../providers/AuthProvider/AuthProvider.model';

/**
 * Arguments for the getErrorDescription helper function.
 *
 * @property {AuthErrorCode | string} errorCode - The authentication error code to translate into a user-friendly message
 */
export type GetErrorDescriptionArguments = Readonly<{
  errorCode: AuthErrorCode | string;
}>;

/**
 * Function type that converts authentication error codes into localized, human-readable descriptions.
 *
 * @param {GetErrorDescriptionArguments} args - Object containing the error code to describe
 *
 * @returns {string} A translated, user-friendly error description suitable for display
 */
export type GetErrorDescriptionHelper = (
  args: GetErrorDescriptionArguments,
) => string;
