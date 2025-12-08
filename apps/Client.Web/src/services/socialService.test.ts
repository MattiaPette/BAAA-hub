import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  UserSearchResult,
  PublicUserProfileResponse,
  FollowResponse,
  UnfollowResponse,
  FollowStatsResponse,
  FollowStatusResponse,
  NotificationsResponse,
  NotificationType,
  UserRole,
  PrivacyLevel,
  MfaType,
} from '@baaa-hub/shared-types';
import {
  searchUsers,
  getPublicUserProfile,
  followUser,
  unfollowUser,
  getFollowStats,
  getFollowStatus,
  getNotifications,
  markNotificationAsRead,
} from './socialService';

const API_BASE_URL = 'http://localhost:3000';

const mockSearchResults: UserSearchResult[] = [
  {
    id: '1',
    nickname: 'john_doe',
    name: 'John',
    surname: 'Doe',
  },
  {
    id: '2',
    nickname: 'jane_smith',
    name: 'Jane',
    surname: 'Smith',
  },
];

const mockPublicProfile: PublicUserProfileResponse = {
  user: {
    id: '1',
    nickname: 'john_doe',
    name: 'John',
    surname: 'Doe',
    email: 'john@example.com',
    dateOfBirth: '1990-01-01',
    sportTypes: [],
    authId: 'auth-123',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    isBlocked: false,
    isEmailVerified: true,
    mfaEnabled: false,
    mfaType: MfaType.NONE,
    roles: [UserRole.MEMBER],
    privacySettings: {
      email: PrivacyLevel.PUBLIC,
      dateOfBirth: PrivacyLevel.PUBLIC,
      sportTypes: PrivacyLevel.PUBLIC,
      socialLinks: PrivacyLevel.PUBLIC,
    },
  },
  followStats: {
    followersCount: 10,
    followingCount: 5,
  },
  isFollowing: false,
};

const server = setupServer();

beforeEach(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  server.close();
});

describe('socialService', () => {
  describe('searchUsers', () => {
    it('should search for users successfully', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/users/search`, () =>
          HttpResponse.json({ users: mockSearchResults }),
        ),
      );

      const result = await searchUsers('john');
      expect(result.users).toEqual(mockSearchResults);
    });

    it('should handle empty search results', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/users/search`, () =>
          HttpResponse.json({ users: [] }),
        ),
      );

      const result = await searchUsers('nonexistent');
      expect(result.users).toEqual([]);
    });

    it('should handle search errors', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/users/search`, () =>
          HttpResponse.json({ error: 'Server error' }, { status: 500 }),
        ),
      );

      await expect(searchUsers('john')).rejects.toThrow();
    });
  });

  describe('getPublicUserProfile', () => {
    it('should get public profile without auth', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/users/:userId`, () =>
          HttpResponse.json(mockPublicProfile),
        ),
      );

      const result = await getPublicUserProfile('1');
      expect(result).toEqual(mockPublicProfile);
    });

    it('should get public profile with auth', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/users/:userId`, () =>
          HttpResponse.json({
            ...mockPublicProfile,
            isFollowing: true,
          }),
        ),
      );

      const result = await getPublicUserProfile('1', 'mock-token');
      expect(result.isFollowing).toBe(true);
    });

    it('should handle profile not found', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/users/:userId`, () =>
          HttpResponse.json({ error: 'User not found' }, { status: 404 }),
        ),
      );

      await expect(getPublicUserProfile('999')).rejects.toThrow();
    });
  });

  describe('followUser', () => {
    it('should follow a user successfully', async () => {
      const mockResponse: FollowResponse = {
        follow: {
          id: 'follow-1',
          followerId: 'user-1',
          followingId: 'user-2',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      };

      server.use(
        http.post(`${API_BASE_URL}/api/follow/:userId`, () =>
          HttpResponse.json(mockResponse, { status: 201 }),
        ),
      );

      const result = await followUser('user-2', 'mock-token');
      expect(result).toEqual(mockResponse);
    });

    it('should handle follow errors', async () => {
      server.use(
        http.post(`${API_BASE_URL}/api/follow/:userId`, () =>
          HttpResponse.json(
            { error: 'Cannot follow yourself' },
            { status: 400 },
          ),
        ),
      );

      await expect(followUser('self', 'mock-token')).rejects.toThrow();
    });
  });

  describe('unfollowUser', () => {
    it('should unfollow a user successfully', async () => {
      const mockResponse: UnfollowResponse = {
        message: 'Successfully unfollowed user',
      };

      server.use(
        http.delete(`${API_BASE_URL}/api/follow/:userId`, () =>
          HttpResponse.json(mockResponse),
        ),
      );

      const result = await unfollowUser('user-2', 'mock-token');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getFollowStats', () => {
    it('should get follow stats successfully', async () => {
      const mockStats: FollowStatsResponse = {
        stats: {
          followersCount: 100,
          followingCount: 50,
        },
      };

      server.use(
        http.get(`${API_BASE_URL}/api/follow/stats/:userId`, () =>
          HttpResponse.json(mockStats),
        ),
      );

      const result = await getFollowStats('user-1');
      expect(result).toEqual(mockStats);
    });
  });

  describe('getFollowStatus', () => {
    it('should get follow status successfully', async () => {
      const mockStatus: FollowStatusResponse = {
        isFollowing: true,
      };

      server.use(
        http.get(`${API_BASE_URL}/api/follow/status/:userId`, () =>
          HttpResponse.json(mockStatus),
        ),
      );

      const result = await getFollowStatus('user-1', 'mock-token');
      expect(result).toEqual(mockStatus);
    });
  });

  describe('getNotifications', () => {
    it('should get notifications successfully', async () => {
      const mockNotifications: NotificationsResponse = {
        notifications: [
          {
            id: 'notif-1',
            userId: 'user-1',
            type: NotificationType.NEW_FOLLOWER,
            isRead: false,
            data: {
              followerId: 'user-2',
              followerNickname: 'jane_doe',
              followerName: 'Jane',
              followerSurname: 'Doe',
            },
            createdAt: '2024-01-01T00:00:00.000Z',
          },
        ],
        unreadCount: 1,
      };

      server.use(
        http.get(`${API_BASE_URL}/api/notifications`, () =>
          HttpResponse.json(mockNotifications),
        ),
      );

      const result = await getNotifications('mock-token');
      expect(result).toEqual(mockNotifications);
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark notification as read successfully', async () => {
      const mockResponse = {
        notification: {
          id: 'notif-1',
          userId: 'user-1',
          type: NotificationType.NEW_FOLLOWER,
          isRead: true,
          data: {},
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      };

      server.use(
        http.patch(`${API_BASE_URL}/api/notifications/:id/read`, () =>
          HttpResponse.json(mockResponse),
        ),
      );

      const result = await markNotificationAsRead('notif-1', 'mock-token');
      expect(result.notification.isRead).toBe(true);
    });
  });
});
