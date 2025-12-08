import axios from 'axios';

import {
  UserSearchResponse,
  PublicUserProfileResponse,
  FollowResponse,
  UnfollowResponse,
  FollowStatsResponse,
  FollowStatusResponse,
  NotificationsListResponse,
  NotificationReadResponse,
} from '@baaa-hub/shared-types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Create axios instance with default configuration
 */
const createApiClient = (accessToken?: string) => {
  const headers: Readonly<Record<string, string>> = accessToken
    ? {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      }
    : {
        'Content-Type': 'application/json',
      };

  return axios.create({
    baseURL: API_BASE_URL,
    headers,
  });
};

/**
 * Search for users by nickname or name
 */
export const searchUsers = async (
  query: string,
): Promise<UserSearchResponse> => {
  const client = createApiClient();
  const response = await client.get<UserSearchResponse>('/api/users/search', {
    params: { q: query },
  });
  return response.data;
};

/**
 * Get public user profile with privacy filtering
 */
export const getPublicUserProfile = async (
  userId: string,
  accessToken?: string,
): Promise<PublicUserProfileResponse> => {
  const client = createApiClient(accessToken);
  const response = await client.get<PublicUserProfileResponse>(
    `/api/users/${userId}`,
  );
  return response.data;
};

/**
 * Follow a user
 */
export const followUser = async (
  userId: string,
  accessToken: string,
): Promise<FollowResponse> => {
  const client = createApiClient(accessToken);
  const response = await client.post<FollowResponse>(`/api/follow/${userId}`);
  return response.data;
};

/**
 * Unfollow a user
 */
export const unfollowUser = async (
  userId: string,
  accessToken: string,
): Promise<UnfollowResponse> => {
  const client = createApiClient(accessToken);
  const response = await client.delete<UnfollowResponse>(
    `/api/follow/${userId}`,
  );
  return response.data;
};

/**
 * Get follow statistics for a user
 */
export const getFollowStats = async (
  userId: string,
): Promise<FollowStatsResponse> => {
  const client = createApiClient();
  const response = await client.get<FollowStatsResponse>(
    `/api/follow/stats/${userId}`,
  );
  return response.data;
};

/**
 * Check if current user is following another user
 */
export const checkFollowStatus = async (
  userId: string,
  accessToken: string,
): Promise<FollowStatusResponse> => {
  const client = createApiClient(accessToken);
  const response = await client.get<FollowStatusResponse>(
    `/api/follow/status/${userId}`,
  );
  return response.data;
};

/**
 * Get notifications for the current user
 */
export const getNotifications = async (
  accessToken: string,
): Promise<NotificationsListResponse> => {
  const client = createApiClient(accessToken);
  const response =
    await client.get<NotificationsListResponse>('/api/notifications');
  return response.data;
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (
  notificationId: string,
  accessToken: string,
): Promise<NotificationReadResponse> => {
  const client = createApiClient(accessToken);
  const response = await client.patch<NotificationReadResponse>(
    `/api/notifications/${notificationId}/read`,
  );
  return response.data;
};
