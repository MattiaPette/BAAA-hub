import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Workout, WorkoutsQueryParams } from '@baaa-hub/shared-types';
import {
  getWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  CreateWorkoutRequest,
  UpdateWorkoutRequest,
} from '../../services/workoutService';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';

/**
 * Custom hook to fetch workouts with optional filters.
 * Uses TanStack Query for caching and automatic refetching.
 *
 * @param params - Query parameters for filtering workouts
 * @returns Query result containing workouts data, loading state, and error state
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useWorkouts({
 *   startDate: '2024-01-01',
 *   endDate: '2024-01-31',
 * });
 * ```
 */
export const useWorkouts = (params?: WorkoutsQueryParams) => {
  const { token, isAuthenticated } = useAuth();

  return useQuery<{ workouts: Workout[]; total: number }, Error>({
    queryKey: ['workouts', token?.accessToken, params],
    queryFn: async () => {
      if (!token?.accessToken) {
        throw new Error('No authentication token available');
      }
      return getWorkouts(token.accessToken, params);
    },
    enabled: isAuthenticated && !!token?.accessToken,
    staleTime: 1 * 60 * 1000, // Consider data fresh for 1 minute
  });
};

/**
 * Custom hook to create a new workout.
 * Uses TanStack Query mutation for optimistic updates and cache invalidation.
 *
 * @returns Mutation object with mutate function and loading/error states
 *
 * @example
 * ```tsx
 * const createMutation = useCreateWorkout();
 *
 * const handleCreate = (workoutData: CreateWorkoutRequest) => {
 *   createMutation.mutate(workoutData, {
 *     onSuccess: () => {
 *       console.log('Workout created successfully');
 *     },
 *     onError: (error) => {
 *       console.error('Failed to create workout', error);
 *     },
 *   });
 * };
 * ```
 */
export const useCreateWorkout = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<Workout, Error, CreateWorkoutRequest>({
    mutationFn: async (data: CreateWorkoutRequest) => {
      if (!token?.accessToken) {
        throw new Error('No authentication token available');
      }
      return createWorkout(token.accessToken, data);
    },
    onSuccess: () => {
      // Invalidate workouts queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
};

/**
 * Custom hook to update an existing workout.
 * Uses TanStack Query mutation for optimistic updates and cache invalidation.
 *
 * @returns Mutation object with mutate function and loading/error states
 *
 * @example
 * ```tsx
 * const updateMutation = useUpdateWorkout();
 *
 * const handleUpdate = (workoutId: string, data: UpdateWorkoutRequest) => {
 *   updateMutation.mutate({ workoutId, data }, {
 *     onSuccess: () => {
 *       console.log('Workout updated successfully');
 *     },
 *   });
 * };
 * ```
 */
export const useUpdateWorkout = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    Workout,
    Error,
    { workoutId: string; data: UpdateWorkoutRequest }
  >({
    mutationFn: async ({ workoutId, data }) => {
      if (!token?.accessToken) {
        throw new Error('No authentication token available');
      }
      return updateWorkout(token.accessToken, workoutId, data);
    },
    onSuccess: () => {
      // Invalidate workouts queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
};

/**
 * Custom hook to delete a workout.
 * Uses TanStack Query mutation for optimistic updates and cache invalidation.
 *
 * @returns Mutation object with mutate function and loading/error states
 *
 * @example
 * ```tsx
 * const deleteMutation = useDeleteWorkout();
 *
 * const handleDelete = (workoutId: string) => {
 *   deleteMutation.mutate(workoutId, {
 *     onSuccess: () => {
 *       console.log('Workout deleted successfully');
 *     },
 *   });
 * };
 * ```
 */
export const useDeleteWorkout = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (workoutId: string) => {
      if (!token?.accessToken) {
        throw new Error('No authentication token available');
      }
      return deleteWorkout(token.accessToken, workoutId);
    },
    onSuccess: () => {
      // Invalidate workouts queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
};
