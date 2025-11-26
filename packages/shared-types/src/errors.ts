/**
 * Error codes for internationalization
 */
export enum ErrorCode {
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // Resource errors
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',

  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',

  // User errors
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_BLOCKED = 'USER_BLOCKED',
  NICKNAME_TAKEN = 'NICKNAME_TAKEN',
  EMAIL_TAKEN = 'EMAIL_TAKEN',
  AGE_REQUIREMENT_NOT_MET = 'AGE_REQUIREMENT_NOT_MET',
  INVALID_SPORT_TYPE = 'INVALID_SPORT_TYPE',

  // Server errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

/**
 * Standardized error response
 */
export interface ErrorResponse {
  error: string;
  code: ErrorCode;
  details?: Array<{
    path: string;
    message: string;
    code: ErrorCode;
  }>;
}
