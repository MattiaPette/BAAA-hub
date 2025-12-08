import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Context } from 'koa';
import {
  ErrorCode,
  SportType,
  UserRole,
  PrivacyLevel,
} from '@baaa-hub/shared-types';
import { AuthContext } from '../../middleware/auth';
import {
  checkProfileStatus,
  createUser,
  getCurrentUser,
  updateCurrentUser,
  checkNicknameAvailability,
  getPublicUserProfile,
} from '../user.controller';
import { User as UserMongooseModel } from '../../models/user.model.js';
import { ApiError } from '../../middleware/errorHandler';

// Mock the User model
vi.mock('../../models/user.model.js', () => {
  const MockUserModel: any = vi.fn().mockImplementation(function (
    this: any,
    data: any,
  ) {
    const instance = { ...data };
    instance.save = vi.fn().mockResolvedValue(undefined);
    instance.toObject = vi.fn().mockReturnValue({
      id: 'new-user-123',
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return instance;
  });
  MockUserModel.findByAuthId = vi.fn();
  MockUserModel.findByEmail = vi.fn();
  MockUserModel.findByNickname = vi.fn();
  MockUserModel.findById = vi.fn();
  return { User: MockUserModel };
});

// Mock the Follow model
vi.mock('../../models/follow.model.js', () => {
  return {
    Follow: {
      countFollowers: vi.fn(),
      countFollowing: vi.fn(),
      findFollow: vi.fn(),
    },
  };
});

// Helper function to create mock user document
const createMockUserDocument = (overrides = {}) => {
  const baseUser = {
    id: 'user-123',
    name: 'John',
    surname: 'Doe',
    nickname: 'johndoe',
    email: 'john@example.com',
    dateOfBirth: '1990-01-01',
    sportTypes: [SportType.RUNNING],
    profilePicture: undefined,
    stravaLink: undefined,
    instagramLink: undefined,
    authId: 'auth0|user123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBlocked: false,
    isEmailVerified: true,
    roles: [UserRole.MEMBER],
    ...overrides,
  };

  return {
    ...baseUser,
    save: vi.fn().mockResolvedValue(undefined),
    toObject: vi.fn().mockReturnValue(baseUser),
  };
};

const createMockAuthContext = (overrides = {}): AuthContext => {
  return {
    status: 200,
    body: undefined,
    params: {},
    request: {
      body: {},
    },
    state: {
      auth: {
        userId: 'auth0|user123',
        email: 'john@example.com',
        emailVerified: true,
        name: 'John Doe',
        nickname: 'johndoe',
        picture: undefined,
      },
    },
    ...overrides,
  } as unknown as AuthContext;
};

describe('user.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkProfileStatus', () => {
    it('should return hasProfile: true when user exists', async () => {
      const mockUser = createMockUserDocument();
      vi.mocked(UserMongooseModel.findByAuthId).mockResolvedValue(
        mockUser as any,
      );

      const ctx = createMockAuthContext();
      await checkProfileStatus(ctx);

      expect(ctx.status).toBe(200);
      expect(ctx.body).toEqual({
        hasProfile: true,
        user: expect.objectContaining({
          id: 'user-123',
          name: 'John',
          email: 'john@example.com',
        }),
      });
      expect(UserMongooseModel.findByAuthId).toHaveBeenCalledWith(
        'auth0|user123',
      );
    });

    it('should return hasProfile: false when user does not exist', async () => {
      vi.mocked(UserMongooseModel.findByAuthId).mockResolvedValue(null);

      const ctx = createMockAuthContext();
      await checkProfileStatus(ctx);

      expect(ctx.status).toBe(200);
      expect(ctx.body).toEqual({
        hasProfile: false,
        user: undefined,
      });
    });
  });

  describe('createUser', () => {
    const validUserData = {
      name: 'Jane',
      surname: 'Smith',
      nickname: 'janesmith',
      email: 'jane@example.com',
      dateOfBirth: '1995-05-15',
      sportTypes: [SportType.CYCLING],
      privacySettings: {
        email: PrivacyLevel.PUBLIC,
        dateOfBirth: PrivacyLevel.PUBLIC,
        sportTypes: PrivacyLevel.PUBLIC,
        socialLinks: PrivacyLevel.PUBLIC,
      },
    };

    it('should create a new user successfully', async () => {
      vi.mocked(UserMongooseModel.findByAuthId).mockResolvedValue(null);
      vi.mocked(UserMongooseModel.findByEmail).mockResolvedValue(null);
      vi.mocked(UserMongooseModel.findByNickname).mockResolvedValue(null);

      const ctx = createMockAuthContext({
        request: { body: validUserData },
      });

      await createUser(ctx);

      expect(ctx.status).toBe(201);
      expect(ctx.body).toEqual({
        user: expect.objectContaining({
          id: 'new-user-123',
          name: 'Jane',
          surname: 'Smith',
          nickname: 'janesmith',
          email: 'jane@example.com',
        }),
      });
    });

    it('should throw error when user profile already exists', async () => {
      const mockUser = createMockUserDocument();
      vi.mocked(UserMongooseModel.findByAuthId).mockResolvedValue(
        mockUser as any,
      );

      const ctx = createMockAuthContext({
        request: { body: validUserData },
      });

      await expect(createUser(ctx)).rejects.toThrow(ApiError);
      await expect(createUser(ctx)).rejects.toMatchObject({
        statusCode: 409,
        code: ErrorCode.USER_ALREADY_EXISTS,
      });
    });

    it('should throw error when email is already taken', async () => {
      const mockUser = createMockUserDocument();
      vi.mocked(UserMongooseModel.findByAuthId).mockResolvedValue(null);
      vi.mocked(UserMongooseModel.findByEmail).mockResolvedValue(
        mockUser as any,
      );

      const ctx = createMockAuthContext({
        request: { body: validUserData },
      });

      await expect(createUser(ctx)).rejects.toThrow(ApiError);
      await expect(createUser(ctx)).rejects.toMatchObject({
        statusCode: 409,
        code: ErrorCode.EMAIL_TAKEN,
      });
    });

    it('should throw error when nickname is already taken', async () => {
      const mockUser = createMockUserDocument();
      vi.mocked(UserMongooseModel.findByAuthId).mockResolvedValue(null);
      vi.mocked(UserMongooseModel.findByEmail).mockResolvedValue(null);
      vi.mocked(UserMongooseModel.findByNickname).mockResolvedValue(
        mockUser as any,
      );

      const ctx = createMockAuthContext({
        request: { body: validUserData },
      });

      await expect(createUser(ctx)).rejects.toThrow(ApiError);
      await expect(createUser(ctx)).rejects.toMatchObject({
        statusCode: 409,
        code: ErrorCode.NICKNAME_TAKEN,
      });
    });

    it('should throw ZodError for invalid input', async () => {
      const ctx = createMockAuthContext({
        request: { body: { name: '' } }, // Invalid: missing required fields
      });

      await expect(createUser(ctx)).rejects.toThrow();
    });

    it('should create user with optional stravaLink and instagramLink', async () => {
      vi.mocked(UserMongooseModel.findByAuthId).mockResolvedValue(null);
      vi.mocked(UserMongooseModel.findByEmail).mockResolvedValue(null);
      vi.mocked(UserMongooseModel.findByNickname).mockResolvedValue(null);

      const ctx = createMockAuthContext({
        request: {
          body: {
            ...validUserData,
            stravaLink: 'https://www.strava.com/athletes/12345',
            instagramLink: 'https://www.instagram.com/janesmith',
          },
        },
      });

      await createUser(ctx);

      expect(ctx.status).toBe(201);
      expect(ctx.body).toEqual({
        user: expect.objectContaining({
          stravaLink: 'https://www.strava.com/athletes/12345',
          instagramLink: 'https://www.instagram.com/janesmith',
        }),
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should return user when found and not blocked', async () => {
      const mockUser = createMockUserDocument();
      vi.mocked(UserMongooseModel.findByAuthId).mockResolvedValue(
        mockUser as any,
      );

      const ctx = createMockAuthContext();
      await getCurrentUser(ctx);

      expect(ctx.status).toBe(200);
      expect(ctx.body).toEqual({
        user: expect.objectContaining({
          id: 'user-123',
          name: 'John',
        }),
      });
    });

    it('should throw ApiError when user not found', async () => {
      vi.mocked(UserMongooseModel.findByAuthId).mockResolvedValue(null);

      const ctx = createMockAuthContext();

      await expect(getCurrentUser(ctx)).rejects.toThrow(ApiError);
      await expect(getCurrentUser(ctx)).rejects.toMatchObject({
        statusCode: 404,
        code: ErrorCode.USER_NOT_FOUND,
      });
    });

    it('should throw ApiError when user is blocked', async () => {
      const mockUser = createMockUserDocument({ isBlocked: true });
      vi.mocked(UserMongooseModel.findByAuthId).mockResolvedValue(
        mockUser as any,
      );

      const ctx = createMockAuthContext();

      await expect(getCurrentUser(ctx)).rejects.toThrow(ApiError);
      await expect(getCurrentUser(ctx)).rejects.toMatchObject({
        statusCode: 403,
        code: ErrorCode.USER_BLOCKED,
      });
    });
  });

  describe('updateCurrentUser', () => {
    it('should update user name successfully', async () => {
      const mockUser = createMockUserDocument();
      vi.mocked(UserMongooseModel.findByAuthId).mockResolvedValue(
        mockUser as any,
      );

      const ctx = createMockAuthContext({
        request: { body: { name: 'UpdatedName' } },
      });

      await updateCurrentUser(ctx);

      expect(ctx.status).toBe(200);
      expect(mockUser.name).toBe('UpdatedName');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should update multiple fields', async () => {
      const mockUser = createMockUserDocument();
      vi.mocked(UserMongooseModel.findByAuthId).mockResolvedValue(
        mockUser as any,
      );

      const ctx = createMockAuthContext({
        request: {
          body: {
            name: 'NewName',
            surname: 'NewSurname',
            sportTypes: [SportType.SWIMMING],
          },
        },
      });

      await updateCurrentUser(ctx);

      expect(ctx.status).toBe(200);
      expect(mockUser.name).toBe('NewName');
      expect(mockUser.surname).toBe('NewSurname');
      expect(mockUser.sportTypes).toEqual([SportType.SWIMMING]);
    });

    it('should update optional fields to null', async () => {
      const mockUser = createMockUserDocument({
        profilePicture: 'https://example.com/old.jpg',
        stravaLink: 'https://www.strava.com/athletes/12345',
        instagramLink: 'https://www.instagram.com/olduser',
      });
      vi.mocked(UserMongooseModel.findByAuthId).mockResolvedValue(
        mockUser as any,
      );

      const ctx = createMockAuthContext({
        request: {
          body: {
            profilePicture: null,
            stravaLink: null,
            instagramLink: null,
          },
        },
      });

      await updateCurrentUser(ctx);

      expect(ctx.status).toBe(200);
      expect(mockUser.profilePicture).toBeUndefined();
      expect(mockUser.stravaLink).toBeUndefined();
      expect(mockUser.instagramLink).toBeUndefined();
    });

    it('should throw ApiError when user not found', async () => {
      vi.mocked(UserMongooseModel.findByAuthId).mockResolvedValue(null);

      const ctx = createMockAuthContext({
        request: { body: { name: 'NewName' } },
      });

      await expect(updateCurrentUser(ctx)).rejects.toThrow(ApiError);
      await expect(updateCurrentUser(ctx)).rejects.toMatchObject({
        statusCode: 404,
        code: ErrorCode.USER_NOT_FOUND,
      });
    });

    it('should throw ApiError when user is blocked', async () => {
      const mockUser = createMockUserDocument({ isBlocked: true });
      vi.mocked(UserMongooseModel.findByAuthId).mockResolvedValue(
        mockUser as any,
      );

      const ctx = createMockAuthContext({
        request: { body: { name: 'NewName' } },
      });

      await expect(updateCurrentUser(ctx)).rejects.toThrow(ApiError);
      await expect(updateCurrentUser(ctx)).rejects.toMatchObject({
        statusCode: 403,
        code: ErrorCode.USER_BLOCKED,
      });
    });

    it('should throw ZodError for invalid input', async () => {
      const mockUser = createMockUserDocument();
      vi.mocked(UserMongooseModel.findByAuthId).mockResolvedValue(
        mockUser as any,
      );

      const ctx = createMockAuthContext({
        request: { body: { sportTypes: [] } }, // Invalid: empty array
      });

      await expect(updateCurrentUser(ctx)).rejects.toThrow();
    });

    it('should update dateOfBirth', async () => {
      const mockUser = createMockUserDocument();
      vi.mocked(UserMongooseModel.findByAuthId).mockResolvedValue(
        mockUser as any,
      );

      const ctx = createMockAuthContext({
        request: { body: { dateOfBirth: '1988-03-25' } },
      });

      await updateCurrentUser(ctx);

      expect(ctx.status).toBe(200);
      expect(mockUser.dateOfBirth).toBe('1988-03-25');
    });
  });

  describe('checkNicknameAvailability', () => {
    it('should return available: true when nickname is not taken', async () => {
      vi.mocked(UserMongooseModel.findByNickname).mockResolvedValue(null);

      const ctx = createMockAuthContext({
        params: { nickname: 'available_nick' },
      }) as Context;

      await checkNicknameAvailability(ctx);

      expect(ctx.status).toBe(200);
      expect(ctx.body).toEqual({
        available: true,
        nickname: 'available_nick',
      });
    });

    it('should return available: false when nickname is taken', async () => {
      const mockUser = createMockUserDocument();
      vi.mocked(UserMongooseModel.findByNickname).mockResolvedValue(
        mockUser as any,
      );

      const ctx = createMockAuthContext({
        params: { nickname: 'taken_nick' },
      }) as Context;

      await checkNicknameAvailability(ctx);

      expect(ctx.status).toBe(200);
      expect(ctx.body).toEqual({
        available: false,
        nickname: 'taken_nick',
      });
    });

    it('should return 400 when nickname is too short', async () => {
      const ctx = createMockAuthContext({ params: { nickname: 'ab' } });

      await checkNicknameAvailability(ctx as Context);

      expect(ctx.status).toBe(400);
      expect(ctx.body).toEqual({
        error: 'Invalid nickname',
        code: ErrorCode.VALIDATION_ERROR,
      });
    });

    it('should return 400 when nickname is empty', async () => {
      const ctx = createMockAuthContext({ params: { nickname: '' } });

      await checkNicknameAvailability(ctx as Context);

      expect(ctx.status).toBe(400);
      expect(ctx.body).toEqual({
        error: 'Invalid nickname',
        code: ErrorCode.VALIDATION_ERROR,
      });
    });

    it('should return 400 when nickname is undefined', async () => {
      const ctx = createMockAuthContext({ params: {} });

      await checkNicknameAvailability(ctx as Context);

      expect(ctx.status).toBe(400);
      expect(ctx.body).toEqual({
        error: 'Invalid nickname',
        code: ErrorCode.VALIDATION_ERROR,
      });
    });
  });

  describe('getPublicUserProfile', () => {
    const createMockUserWithPrivacy = (
      privacySettings: any,
      overrides = {},
    ) => {
      return {
        _id: 'target-user-123',
        id: 'target-user-123',
        name: 'Jane',
        surname: 'Smith',
        nickname: 'janesmith',
        email: 'jane@example.com',
        dateOfBirth: '1995-05-15',
        sportTypes: [SportType.CYCLING],
        avatarKey: 'avatar-key',
        avatarThumbKey: 'avatar-thumb-key',
        bannerKey: 'banner-key',
        stravaLink: 'https://strava.com/jane',
        instagramLink: 'https://instagram.com/jane',
        createdAt: new Date().toISOString(),
        isBlocked: false,
        roles: [UserRole.MEMBER],
        privacySettings,
        ...overrides,
      };
    };

    beforeEach(async () => {
      // Import Follow to get the mocked version
      const { Follow } = await import('../../models/follow.model.js');
      vi.mocked(Follow.countFollowers).mockResolvedValue(10);
      vi.mocked(Follow.countFollowing).mockResolvedValue(5);
    });

    it('should return public user profile with only PUBLIC fields when not authenticated', async () => {
      const mockUser = createMockUserWithPrivacy({
        email: PrivacyLevel.FOLLOWERS,
        dateOfBirth: PrivacyLevel.FOLLOWERS,
        sportTypes: PrivacyLevel.FOLLOWERS,
        socialLinks: PrivacyLevel.FOLLOWERS,
        avatar: PrivacyLevel.FOLLOWERS,
        banner: PrivacyLevel.FOLLOWERS,
      });

      vi.mocked(UserMongooseModel.findById).mockResolvedValue(mockUser as any);

      const ctx = {
        params: { userId: 'target-user-123' },
        state: {}, // No auth
        status: 200,
        body: undefined,
      } as unknown as Context;

      await getPublicUserProfile(ctx);

      expect(ctx.status).toBe(200);
      expect(ctx.body).toEqual({
        user: {
          id: 'target-user-123',
          name: 'Jane',
          surname: 'Smith',
          nickname: 'janesmith',
          createdAt: mockUser.createdAt,
          roles: [UserRole.MEMBER],
          // FOLLOWERS-only fields should NOT be included
        },
        followStats: {
          followersCount: 10,
          followingCount: 5,
        },
        isFollowing: undefined,
      });

      expect(ctx.body.user).not.toHaveProperty('email');
      expect(ctx.body.user).not.toHaveProperty('dateOfBirth');
      expect(ctx.body.user).not.toHaveProperty('sportTypes');
      expect(ctx.body.user).not.toHaveProperty('stravaLink');
      expect(ctx.body.user).not.toHaveProperty('instagramLink');
      expect(ctx.body.user).not.toHaveProperty('avatarKey');
      expect(ctx.body.user).not.toHaveProperty('bannerKey');
    });

    it('should return public user profile with only PUBLIC fields when authenticated but not following', async () => {
      const mockTargetUser = createMockUserWithPrivacy({
        email: PrivacyLevel.FOLLOWERS,
        dateOfBirth: PrivacyLevel.FOLLOWERS,
        sportTypes: PrivacyLevel.FOLLOWERS,
        socialLinks: PrivacyLevel.FOLLOWERS,
        avatar: PrivacyLevel.FOLLOWERS,
        banner: PrivacyLevel.FOLLOWERS,
      });

      const mockRequestingUser = createMockUserDocument({
        _id: 'requesting-user-123',
      });

      vi.mocked(UserMongooseModel.findById).mockResolvedValue(
        mockTargetUser as any,
      );
      vi.mocked(UserMongooseModel.findByAuthId).mockResolvedValue(
        mockRequestingUser as any,
      );

      const { Follow } = await import('../../models/follow.model.js');
      vi.mocked(Follow.findFollow).mockResolvedValue(null); // Not following

      const ctx = {
        params: { userId: 'target-user-123' },
        state: { auth: { userId: 'auth0|requesting-user' } },
        status: 200,
        body: undefined,
      } as unknown as Context;

      await getPublicUserProfile(ctx);

      expect(ctx.status).toBe(200);
      expect(ctx.body.isFollowing).toBe(false);
      expect(ctx.body.user).not.toHaveProperty('email');
      expect(ctx.body.user).not.toHaveProperty('dateOfBirth');
      expect(ctx.body.user).not.toHaveProperty('sportTypes');
      expect(ctx.body.user).not.toHaveProperty('stravaLink');
      expect(ctx.body.user).not.toHaveProperty('instagramLink');
      expect(ctx.body.user).not.toHaveProperty('avatarKey');
      expect(ctx.body.user).not.toHaveProperty('bannerKey');
    });

    it('should return public user profile with FOLLOWERS fields when authenticated and following', async () => {
      const mockTargetUser = createMockUserWithPrivacy({
        email: PrivacyLevel.FOLLOWERS,
        dateOfBirth: PrivacyLevel.FOLLOWERS,
        sportTypes: PrivacyLevel.FOLLOWERS,
        socialLinks: PrivacyLevel.FOLLOWERS,
        avatar: PrivacyLevel.FOLLOWERS,
        banner: PrivacyLevel.FOLLOWERS,
      });

      const mockRequestingUser = createMockUserDocument({
        _id: 'requesting-user-123',
      });

      vi.mocked(UserMongooseModel.findById).mockResolvedValue(
        mockTargetUser as any,
      );
      vi.mocked(UserMongooseModel.findByAuthId).mockResolvedValue(
        mockRequestingUser as any,
      );

      const { Follow } = await import('../../models/follow.model.js');
      vi.mocked(Follow.findFollow).mockResolvedValue({
        followerId: 'requesting-user-123',
        followingId: 'target-user-123',
      } as any); // Is following

      const ctx = {
        params: { userId: 'target-user-123' },
        state: { auth: { userId: 'auth0|requesting-user' } },
        status: 200,
        body: undefined,
      } as unknown as Context;

      await getPublicUserProfile(ctx);

      expect(ctx.status).toBe(200);
      expect(ctx.body.isFollowing).toBe(true);
      // FOLLOWERS-only fields SHOULD be included
      expect(ctx.body.user.email).toBe('jane@example.com');
      expect(ctx.body.user.dateOfBirth).toBe('1995-05-15');
      expect(ctx.body.user.sportTypes).toEqual([SportType.CYCLING]);
      expect(ctx.body.user.stravaLink).toBe('https://strava.com/jane');
      expect(ctx.body.user.instagramLink).toBe('https://instagram.com/jane');
      expect(ctx.body.user.avatarKey).toBe('avatar-key');
      expect(ctx.body.user.bannerKey).toBe('banner-key');
    });

    it('should return public user profile with PUBLIC fields visible to all users', async () => {
      const mockTargetUser = createMockUserWithPrivacy({
        email: PrivacyLevel.PUBLIC,
        dateOfBirth: PrivacyLevel.PUBLIC,
        sportTypes: PrivacyLevel.PUBLIC,
        socialLinks: PrivacyLevel.PUBLIC,
        avatar: PrivacyLevel.PUBLIC,
        banner: PrivacyLevel.PUBLIC,
      });

      vi.mocked(UserMongooseModel.findById).mockResolvedValue(
        mockTargetUser as any,
      );

      const ctx = {
        params: { userId: 'target-user-123' },
        state: {}, // Not authenticated
        status: 200,
        body: undefined,
      } as unknown as Context;

      await getPublicUserProfile(ctx);

      expect(ctx.status).toBe(200);
      // PUBLIC fields should be visible to unauthenticated users
      expect(ctx.body.user.email).toBe('jane@example.com');
      expect(ctx.body.user.dateOfBirth).toBe('1995-05-15');
      expect(ctx.body.user.sportTypes).toEqual([SportType.CYCLING]);
      expect(ctx.body.user.stravaLink).toBe('https://strava.com/jane');
      expect(ctx.body.user.instagramLink).toBe('https://instagram.com/jane');
      expect(ctx.body.user.avatarKey).toBe('avatar-key');
      expect(ctx.body.user.bannerKey).toBe('banner-key');
    });

    it('should not return PRIVATE fields to anyone', async () => {
      const mockTargetUser = createMockUserWithPrivacy({
        email: PrivacyLevel.PRIVATE,
        dateOfBirth: PrivacyLevel.PRIVATE,
        sportTypes: PrivacyLevel.PRIVATE,
        socialLinks: PrivacyLevel.PRIVATE,
        avatar: PrivacyLevel.PRIVATE,
        banner: PrivacyLevel.PRIVATE,
      });

      const mockRequestingUser = createMockUserDocument({
        _id: 'requesting-user-123',
      });

      vi.mocked(UserMongooseModel.findById).mockResolvedValue(
        mockTargetUser as any,
      );
      vi.mocked(UserMongooseModel.findByAuthId).mockResolvedValue(
        mockRequestingUser as any,
      );

      const { Follow } = await import('../../models/follow.model.js');
      vi.mocked(Follow.findFollow).mockResolvedValue({
        followerId: 'requesting-user-123',
        followingId: 'target-user-123',
      } as any); // Is following

      const ctx = {
        params: { userId: 'target-user-123' },
        state: { auth: { userId: 'auth0|requesting-user' } },
        status: 200,
        body: undefined,
      } as unknown as Context;

      await getPublicUserProfile(ctx);

      expect(ctx.status).toBe(200);
      // PRIVATE fields should NOT be visible even to followers
      expect(ctx.body.user).not.toHaveProperty('email');
      expect(ctx.body.user).not.toHaveProperty('dateOfBirth');
      expect(ctx.body.user).not.toHaveProperty('sportTypes');
      expect(ctx.body.user).not.toHaveProperty('stravaLink');
      expect(ctx.body.user).not.toHaveProperty('instagramLink');
      expect(ctx.body.user).not.toHaveProperty('avatarKey');
      expect(ctx.body.user).not.toHaveProperty('bannerKey');
    });

    it('should return mixed privacy fields correctly', async () => {
      const mockTargetUser = createMockUserWithPrivacy({
        email: PrivacyLevel.PUBLIC,
        dateOfBirth: PrivacyLevel.FOLLOWERS,
        sportTypes: PrivacyLevel.PRIVATE,
        socialLinks: PrivacyLevel.FOLLOWERS,
        avatar: PrivacyLevel.PUBLIC,
        banner: PrivacyLevel.PRIVATE,
      });

      const mockRequestingUser = createMockUserDocument({
        _id: 'requesting-user-123',
      });

      vi.mocked(UserMongooseModel.findById).mockResolvedValue(
        mockTargetUser as any,
      );
      vi.mocked(UserMongooseModel.findByAuthId).mockResolvedValue(
        mockRequestingUser as any,
      );

      const { Follow } = await import('../../models/follow.model.js');
      vi.mocked(Follow.findFollow).mockResolvedValue({
        followerId: 'requesting-user-123',
        followingId: 'target-user-123',
      } as any); // Is following

      const ctx = {
        params: { userId: 'target-user-123' },
        state: { auth: { userId: 'auth0|requesting-user' } },
        status: 200,
        body: undefined,
      } as unknown as Context;

      await getPublicUserProfile(ctx);

      expect(ctx.status).toBe(200);
      // PUBLIC fields should be visible
      expect(ctx.body.user.email).toBe('jane@example.com');
      expect(ctx.body.user.avatarKey).toBe('avatar-key');
      // FOLLOWERS fields should be visible when following
      expect(ctx.body.user.dateOfBirth).toBe('1995-05-15');
      expect(ctx.body.user.stravaLink).toBe('https://strava.com/jane');
      expect(ctx.body.user.instagramLink).toBe('https://instagram.com/jane');
      // PRIVATE fields should NOT be visible
      expect(ctx.body.user).not.toHaveProperty('sportTypes');
      expect(ctx.body.user).not.toHaveProperty('bannerKey');
    });

    it('should throw 404 when user not found', async () => {
      vi.mocked(UserMongooseModel.findById).mockResolvedValue(null);

      const ctx = {
        params: { userId: 'non-existent' },
        state: {},
        status: 200,
        body: undefined,
      } as unknown as Context;

      await expect(getPublicUserProfile(ctx)).rejects.toThrow(ApiError);
      await expect(getPublicUserProfile(ctx)).rejects.toMatchObject({
        statusCode: 404,
        code: ErrorCode.USER_NOT_FOUND,
      });
    });

    it('should throw 404 when user is blocked', async () => {
      const mockUser = createMockUserWithPrivacy(
        {
          email: PrivacyLevel.PUBLIC,
          dateOfBirth: PrivacyLevel.PUBLIC,
          sportTypes: PrivacyLevel.PUBLIC,
          socialLinks: PrivacyLevel.PUBLIC,
        },
        { isBlocked: true },
      );

      vi.mocked(UserMongooseModel.findById).mockResolvedValue(mockUser as any);

      const ctx = {
        params: { userId: 'blocked-user' },
        state: {},
        status: 200,
        body: undefined,
      } as unknown as Context;

      await expect(getPublicUserProfile(ctx)).rejects.toThrow(ApiError);
      await expect(getPublicUserProfile(ctx)).rejects.toMatchObject({
        statusCode: 404,
        code: ErrorCode.USER_NOT_FOUND,
      });
    });
  });
});
