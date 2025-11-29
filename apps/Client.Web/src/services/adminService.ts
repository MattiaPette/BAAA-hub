import axios from 'axios';

import {
  User,
  UserRole,
  UserResponse,
  AdminUsersListResponse,
  AdminUpdateUserRolesRequest,
  AdminUpdateUserBlockedRequest,
} from '@baaa-hub/shared-types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Create axios instance with default configuration
 */
const createApiClient = (idToken: string) =>
  axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
  });

/**
 * Admin: List users with pagination and search
 */
export interface ListUsersParams {
  page?: number;
  perPage?: number;
  search?: string;
  role?: UserRole;
  blocked?: boolean;
  emailVerified?: boolean;
}

export const listUsers = async (
  idToken: string,
  params: ListUsersParams = {},
): Promise<AdminUsersListResponse> => {
  const client = createApiClient(idToken);
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.perPage) queryParams.append('perPage', params.perPage.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.role) queryParams.append('role', params.role);
  if (params.blocked !== undefined)
    queryParams.append('blocked', params.blocked.toString());
  if (params.emailVerified !== undefined)
    queryParams.append('emailVerified', params.emailVerified.toString());

  const response = await client.get<AdminUsersListResponse>(
    `/api/admin/users?${queryParams.toString()}`,
  );
  return response.data;
};

/**
 * Admin: Get a specific user by ID
 */
export const getUserById = async (
  idToken: string,
  userId: string,
): Promise<User> => {
  const client = createApiClient(idToken);
  const response = await client.get<UserResponse>(`/api/admin/users/${userId}`);
  return response.data.user;
};

/**
 * Admin: Update user roles
 */
export const updateUserRoles = async (
  idToken: string,
  userId: string,
  roles: UserRole[],
): Promise<User> => {
  const client = createApiClient(idToken);
  const data: AdminUpdateUserRolesRequest = { roles };
  const response = await client.patch<UserResponse>(
    `/api/admin/users/${userId}/roles`,
    data,
  );
  return response.data.user;
};

/**
 * Admin: Update user blocked status
 */
export const updateUserBlocked = async (
  idToken: string,
  userId: string,
  isBlocked: boolean,
): Promise<User> => {
  const client = createApiClient(idToken);
  const data: AdminUpdateUserBlockedRequest = { isBlocked };
  const response = await client.patch<UserResponse>(
    `/api/admin/users/${userId}/blocked`,
    data,
  );
  return response.data.user;
};
