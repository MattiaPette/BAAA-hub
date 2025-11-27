import axios from 'axios';

import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
  UserProfileStatusResponse,
} from '@baaa-hub/shared-types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Create axios instance with default configuration
 */
const createApiClient = (idToken?: string) => {
  const headers: Readonly<Record<string, string>> = idToken
    ? {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
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
 * Check if user has completed profile setup
 */
export const checkProfileStatus = async (
  idToken: string,
): Promise<UserProfileStatusResponse> => {
  const client = createApiClient(idToken);
  const response = await client.get<UserProfileStatusResponse>(
    '/api/users/profile/status',
  );
  return response.data;
};

/**
 * Create a new user profile
 */
export const createUserProfile = async (
  idToken: string,
  data: Readonly<CreateUserRequest>,
): Promise<User> => {
  const client = createApiClient(idToken);
  const response = await client.post<UserResponse>('/api/users', data);
  return response.data.user;
};

/**
 * Get the current user's profile
 */
export const getCurrentUser = async (idToken: string): Promise<User> => {
  const client = createApiClient(idToken);
  const response = await client.get<UserResponse>('/api/users/me');
  return response.data.user;
};

/**
 * Update the current user's profile
 */
export const updateUserProfile = async (
  idToken: string,
  data: Readonly<UpdateUserRequest>,
): Promise<User> => {
  const client = createApiClient(idToken);
  const response = await client.patch<UserResponse>('/api/users/me', data);
  return response.data.user;
};

/**
 * Check if a nickname is available
 */
export const checkNicknameAvailability = async (
  nickname: string,
): Promise<{ available: boolean; nickname: string }> => {
  const client = createApiClient();
  const response = await client.get<{ available: boolean; nickname: string }>(
    `/api/users/nickname/${encodeURIComponent(nickname)}/available`,
  );
  return response.data;
};
