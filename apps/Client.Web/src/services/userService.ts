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
 * Image type for upload operations
 */
export type ImageType = 'avatar' | 'banner';

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

/**
 * Upload a user image (avatar or banner)
 * @param idToken - Authentication token
 * @param imageType - Type of image (avatar or banner)
 * @param file - The image file to upload
 * @returns The uploaded image key
 */
export const uploadUserImage = async (
  idToken: string,
  imageType: ImageType,
  file: File,
): Promise<{ key: string }> => {
  const arrayBuffer = await file.arrayBuffer();
  const response = await axios.put<{ key: string; message: string }>(
    `${API_BASE_URL}/api/images/me/${imageType}`,
    arrayBuffer,
    {
      headers: {
        'Content-Type': file.type,
        Authorization: `Bearer ${idToken}`,
      },
    },
  );
  return { key: response.data.key };
};

/**
 * Delete a user image (avatar or banner)
 * @param idToken - Authentication token
 * @param imageType - Type of image (avatar or banner)
 */
export const deleteUserImage = async (
  idToken: string,
  imageType: ImageType,
): Promise<void> => {
  const client = createApiClient(idToken);
  await client.delete(`/api/images/me/${imageType}`);
};

/**
 * Get the URL for a user's image
 * @param userId - User ID
 * @param imageType - Type of image (avatar or banner)
 * @param original - If true, returns full-size image; otherwise returns thumbnail
 * @param cacheBuster - Optional timestamp to bust browser cache after image update
 * @returns The image URL
 */
export const getUserImageUrl = (
  userId: string,
  imageType: ImageType,
  original: boolean = false,
  cacheBuster?: number,
): string => {
  const url = `${API_BASE_URL}/api/images/user/${userId}/${imageType}`;
  const params = new URLSearchParams();
  if (original) {
    params.append('original', 'true');
  }
  if (cacheBuster) {
    params.append('t', cacheBuster.toString());
  }
  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
};

/**
 * Get the URL for the current user's image
 * @param imageType - Type of image (avatar or banner)
 * @param original - If true, returns full-size image; otherwise returns thumbnail
 * @returns The image URL (requires authentication header)
 */
export const getMyImageUrl = (
  imageType: ImageType,
  original: boolean = false,
): string => {
  const url = `${API_BASE_URL}/api/images/me/${imageType}`;
  return original ? `${url}?original=true` : url;
};
