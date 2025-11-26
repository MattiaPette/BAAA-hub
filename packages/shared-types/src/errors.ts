/**
 * Error codes for internationalization
 */
export enum ErrorCode {
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',

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
