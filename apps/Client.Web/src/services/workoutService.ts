import axios from 'axios';

import {
  Workout,
  WorkoutResponse,
  WorkoutsListResponse,
  WorkoutsQueryParams,
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
 * Create workout request data
 * Omit id, userId, createdAt, updatedAt as they are set by the server
 */
export type CreateWorkoutRequest = Omit<
  Workout,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
>;

/**
 * Update workout request data
 */
export type UpdateWorkoutRequest = Partial<CreateWorkoutRequest>;

/**
 * Create a new workout
 */
export const createWorkout = async (
  accessToken: string,
  data: Readonly<CreateWorkoutRequest>,
): Promise<Workout> => {
  const client = createApiClient(accessToken);
  const response = await client.post<WorkoutResponse>('/api/workouts', data);
  return response.data.workout;
};

/**
 * Get workouts with optional filters
 */
export const getWorkouts = async (
  accessToken: string,
  params?: Readonly<WorkoutsQueryParams>,
): Promise<{ workouts: Workout[]; total: number }> => {
  const client = createApiClient(accessToken);
  const response = await client.get<WorkoutsListResponse>('/api/workouts', {
    params,
  });
  return response.data;
};

/**
 * Get a specific workout by ID
 */
export const getWorkout = async (
  accessToken: string,
  workoutId: string,
): Promise<Workout> => {
  const client = createApiClient(accessToken);
  const response = await client.get<WorkoutResponse>(
    `/api/workouts/${workoutId}`,
  );
  return response.data.workout;
};

/**
 * Update a workout
 */
export const updateWorkout = async (
  accessToken: string,
  workoutId: string,
  data: Readonly<UpdateWorkoutRequest>,
): Promise<Workout> => {
  const client = createApiClient(accessToken);
  const response = await client.patch<WorkoutResponse>(
    `/api/workouts/${workoutId}`,
    data,
  );
  return response.data.workout;
};

/**
 * Delete a workout
 */
export const deleteWorkout = async (
  accessToken: string,
  workoutId: string,
): Promise<void> => {
  const client = createApiClient(accessToken);
  await client.delete(`/api/workouts/${workoutId}`);
};
