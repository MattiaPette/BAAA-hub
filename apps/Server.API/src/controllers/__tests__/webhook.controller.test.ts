import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MfaType } from '@baaa-hub/shared-types';
import { handleKeycloakUserUpdate } from '../webhook.controller.js';
import { type WebhookContext } from '../../middleware/webhook.js';

// Mock the user model
const mockFindByAuthId = vi.fn();
const mockSave = vi.fn();

vi.mock('../../models/user.model.js', () => ({
  User: {
    findByAuthId: (authId: string) => mockFindByAuthId(authId),
  },
}));

/**
 * Creates a mock Koa context for testing webhook controller
 */
const createMockContext = (body: unknown): WebhookContext => {
  return {
    status: 200,
    body: {},
    state: {
      webhookValidated: true,
    },
    request: {
      body,
    },
  } as unknown as WebhookContext;
};

/**
 * Creates a mock user document
 */
const createMockUser = (overrides = {}) => ({
  authId: 'keycloak-123',
  email: 'test@example.com',
  isEmailVerified: false,
  mfaEnabled: false,
  mfaType: MfaType.NONE,
  save: mockSave,
  ...overrides,
});

describe('handleKeycloakUserUpdate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSave.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validation', () => {
    it('should throw validation error if user_id is missing', async () => {
      const ctx = createMockContext({
        email: 'test@example.com',
        email_verified: true,
        mfa_enabled: false,
      });

      await expect(handleKeycloakUserUpdate(ctx)).rejects.toThrow();
    });

    it('should throw validation error if email is invalid', async () => {
      const ctx = createMockContext({
        user_id: 'keycloak-123',
        email: 'invalid-email',
        email_verified: true,
        mfa_enabled: false,
      });

      await expect(handleKeycloakUserUpdate(ctx)).rejects.toThrow();
    });

    it('should throw validation error if email_verified is not boolean', async () => {
      const ctx = createMockContext({
        user_id: 'keycloak-123',
        email: 'test@example.com',
        email_verified: 'true',
        mfa_enabled: false,
      });

      await expect(handleKeycloakUserUpdate(ctx)).rejects.toThrow();
    });

    it('should throw validation error if mfa_enabled is not boolean', async () => {
      const ctx = createMockContext({
        user_id: 'keycloak-123',
        email: 'test@example.com',
        email_verified: true,
        mfa_enabled: 'false',
      });

      await expect(handleKeycloakUserUpdate(ctx)).rejects.toThrow();
    });

    it('should accept null mfa_type when mfa is disabled', async () => {
      mockFindByAuthId.mockResolvedValue(createMockUser());

      const ctx = createMockContext({
        user_id: 'keycloak-123',
        email: 'test@example.com',
        email_verified: true,
        mfa_enabled: false,
        mfa_type: null,
      });

      await expect(handleKeycloakUserUpdate(ctx)).resolves.not.toThrow();
      expect(ctx.status).toBe(200);
    });
  });

  describe('user not found', () => {
    it('should return success with message when user is not in database', async () => {
      mockFindByAuthId.mockResolvedValue(null);

      const ctx = createMockContext({
        user_id: 'keycloak-123',
        email: 'test@example.com',
        email_verified: true,
        mfa_enabled: false,
      });

      await handleKeycloakUserUpdate(ctx);

      expect(ctx.status).toBe(200);
      expect(ctx.body).toEqual({
        success: true,
        message: 'User not found in database, skipping update',
        user_id: 'keycloak-123',
      });
      expect(mockSave).not.toHaveBeenCalled();
    });
  });

  describe('user update', () => {
    it('should update email verification status', async () => {
      const mockUser = createMockUser();
      mockFindByAuthId.mockResolvedValue(mockUser);

      const ctx = createMockContext({
        user_id: 'keycloak-123',
        email: 'test@example.com',
        email_verified: true,
        mfa_enabled: false,
      });

      await handleKeycloakUserUpdate(ctx);

      expect(mockUser.isEmailVerified).toBe(true);
      expect(mockSave).toHaveBeenCalled();
      expect(ctx.status).toBe(200);
      expect(ctx.body).toMatchObject({
        success: true,
        message: 'User updated successfully',
        user_id: 'keycloak-123',
        email_verified: true,
      });
    });

    it('should update MFA enabled status to true', async () => {
      const mockUser = createMockUser();
      mockFindByAuthId.mockResolvedValue(mockUser);

      const ctx = createMockContext({
        user_id: 'keycloak-123',
        email: 'test@example.com',
        email_verified: false,
        mfa_enabled: true,
        mfa_type: 'totp',
      });

      await handleKeycloakUserUpdate(ctx);

      expect(mockUser.mfaEnabled).toBe(true);
      expect(mockUser.mfaType).toBe(MfaType.TOTP);
      expect(mockSave).toHaveBeenCalled();
    });

    it('should update MFA enabled status to false', async () => {
      const mockUser = createMockUser({
        mfaEnabled: true,
        mfaType: MfaType.TOTP,
      });
      mockFindByAuthId.mockResolvedValue(mockUser);

      const ctx = createMockContext({
        user_id: 'keycloak-123',
        email: 'test@example.com',
        email_verified: false,
        mfa_enabled: false,
      });

      await handleKeycloakUserUpdate(ctx);

      expect(mockUser.mfaEnabled).toBe(false);
      expect(mockUser.mfaType).toBe(MfaType.NONE);
      expect(mockSave).toHaveBeenCalled();
    });

    it('should map otp MFA type to TOTP', async () => {
      const mockUser = createMockUser();
      mockFindByAuthId.mockResolvedValue(mockUser);

      const ctx = createMockContext({
        user_id: 'keycloak-123',
        email: 'test@example.com',
        email_verified: false,
        mfa_enabled: true,
        mfa_type: 'otp',
      });

      await handleKeycloakUserUpdate(ctx);

      expect(mockUser.mfaType).toBe(MfaType.TOTP);
    });

    it('should map sms MFA type correctly', async () => {
      const mockUser = createMockUser();
      mockFindByAuthId.mockResolvedValue(mockUser);

      const ctx = createMockContext({
        user_id: 'keycloak-123',
        email: 'test@example.com',
        email_verified: false,
        mfa_enabled: true,
        mfa_type: 'sms',
      });

      await handleKeycloakUserUpdate(ctx);

      expect(mockUser.mfaType).toBe(MfaType.SMS);
    });

    it('should map push-notification MFA type to PUSH', async () => {
      const mockUser = createMockUser();
      mockFindByAuthId.mockResolvedValue(mockUser);

      const ctx = createMockContext({
        user_id: 'keycloak-123',
        email: 'test@example.com',
        email_verified: false,
        mfa_enabled: true,
        mfa_type: 'push-notification',
      });

      await handleKeycloakUserUpdate(ctx);

      expect(mockUser.mfaType).toBe(MfaType.PUSH);
    });

    it('should map webauthn-roaming MFA type to WEBAUTHN', async () => {
      const mockUser = createMockUser();
      mockFindByAuthId.mockResolvedValue(mockUser);

      const ctx = createMockContext({
        user_id: 'keycloak-123',
        email: 'test@example.com',
        email_verified: false,
        mfa_enabled: true,
        mfa_type: 'webauthn-roaming',
      });

      await handleKeycloakUserUpdate(ctx);

      expect(mockUser.mfaType).toBe(MfaType.WEBAUTHN);
    });

    it('should map recovery-code MFA type correctly', async () => {
      const mockUser = createMockUser();
      mockFindByAuthId.mockResolvedValue(mockUser);

      const ctx = createMockContext({
        user_id: 'keycloak-123',
        email: 'test@example.com',
        email_verified: false,
        mfa_enabled: true,
        mfa_type: 'recovery-code',
      });

      await handleKeycloakUserUpdate(ctx);

      expect(mockUser.mfaType).toBe(MfaType.RECOVERY_CODE);
    });

    it('should default to NONE for unknown MFA type', async () => {
      const mockUser = createMockUser();
      mockFindByAuthId.mockResolvedValue(mockUser);

      const ctx = createMockContext({
        user_id: 'keycloak-123',
        email: 'test@example.com',
        email_verified: false,
        mfa_enabled: true,
        mfa_type: 'unknown-type',
      });

      await handleKeycloakUserUpdate(ctx);

      expect(mockUser.mfaType).toBe(MfaType.NONE);
    });

    it('should handle MFA enabled without mfa_type', async () => {
      const mockUser = createMockUser();
      mockFindByAuthId.mockResolvedValue(mockUser);

      const ctx = createMockContext({
        user_id: 'keycloak-123',
        email: 'test@example.com',
        email_verified: false,
        mfa_enabled: true,
      });

      await handleKeycloakUserUpdate(ctx);

      expect(mockUser.mfaEnabled).toBe(true);
      expect(mockUser.mfaType).toBe(MfaType.NONE);
    });
  });
});
