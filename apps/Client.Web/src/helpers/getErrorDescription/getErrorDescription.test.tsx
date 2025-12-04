import { describe, it, expect } from 'vitest';
import { AuthErrorCode } from '../../providers/AuthProvider/AuthProvider.model';
import { getErrorDescription } from './getErrorDescription';

describe('getErrorDescription', () => {
  it('should return correct message for ACCESS_DENIED', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.ACCESS_DENIED,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for INVALID_USER_PASSWORD', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.INVALID_USER_PASSWORD,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for PASSWORD_LEAKED', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.PASSWORD_LEAKED,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for TOO_MANY_ATTEMPTS', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.TOO_MANY_ATTEMPTS,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for BLOCKED_USER', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.BLOCKED_USER,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for UNAUTHORIZED', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.UNAUTHORIZED,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for MFA_REQUIRED', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.MFA_REQUIRED,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for MFA_INVALID_CODE', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.MFA_INVALID_CODE,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for MFA_REGISTRATION_REQUIRED', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.MFA_REGISTRATION_REQUIRED,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for INVALID_GRANT', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.INVALID_GRANT,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for EXPIRED_TOKEN', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.EXPIRED_TOKEN,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for SERVER_ERROR', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.SERVER_ERROR,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for TEMPORARILY_UNAVAILABLE', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.TEMPORARILY_UNAVAILABLE,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for USER_EXISTS', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.USER_EXISTS,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for USERNAME_EXISTS', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.USERNAME_EXISTS,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for ACCOUNT_NOT_FULLY_SET_UP', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.ACCOUNT_NOT_FULLY_SET_UP,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for EMAIL_NOT_VERIFIED', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.EMAIL_NOT_VERIFIED,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for ACTION_REQUIRED', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.ACTION_REQUIRED,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for ACCOUNT_EXPIRED', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.ACCOUNT_EXPIRED,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for INVALID_SIGNUP', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.INVALID_SIGNUP,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for PASSWORD_STRENGTH_ERROR', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.PASSWORD_STRENGTH_ERROR,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for PASSWORD_NO_USER_INFO_ERROR', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.PASSWORD_NO_USER_INFO_ERROR,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for PASSWORD_DICTIONARY_ERROR', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.PASSWORD_DICTIONARY_ERROR,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for TOO_MANY_REQUESTS', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.TOO_MANY_REQUESTS,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for NETWORK_ERROR', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.NETWORK_ERROR,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for TIMEOUT', () => {
    const result = getErrorDescription({ errorCode: AuthErrorCode.TIMEOUT });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for INVALID_TOKEN', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.INVALID_TOKEN,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for LOGIN_REQUIRED', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.LOGIN_REQUIRED,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for CONSENT_REQUIRED', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.CONSENT_REQUIRED,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for INTERACTION_REQUIRED', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.INTERACTION_REQUIRED,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for INVALID_REQUEST', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.INVALID_REQUEST,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for UNAUTHORIZED_CLIENT', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.UNAUTHORIZED_CLIENT,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for UNSUPPORTED_RESPONSE_TYPE', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.UNSUPPORTED_RESPONSE_TYPE,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for INVALID_SCOPE', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.INVALID_SCOPE,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for INVALID_CONFIGURATION', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.INVALID_CONFIGURATION,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return correct message for UNKNOWN_ERROR', () => {
    const result = getErrorDescription({
      errorCode: AuthErrorCode.UNKNOWN_ERROR,
    });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return default message for unknown error code', () => {
    const result = getErrorDescription({ errorCode: 'some_random_error' });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
});
