import {
  ErrorCode,
  Workout as WorkoutType,
  WorkoutResponse,
  WorkoutsListResponse,
} from '@baaa-hub/shared-types';
import { Workout, WorkoutDocument } from '../models/workout.model.js';
import {
  createWorkoutSchema,
  updateWorkoutSchema,
  CreateWorkoutInput,
  UpdateWorkoutInput,
} from '../models/workout.validation.js';
import { ApiError } from '../middleware/errorHandler.js';
import { AuthContext } from '../middleware/auth.js';
import { User as UserMongooseModel } from '../models/user.model.js';

/**
 * Transform WorkoutDocument to Workout response object
 */
const toWorkoutResponse = (doc: WorkoutDocument): WorkoutType => {
  return doc.toObject() as WorkoutType;
};

/**
 * Create a new workout
 */
export const createWorkout = async (ctx: AuthContext): Promise<void> => {
  const { userId } = ctx.state.auth;

  // Validate request body
  const validationResult = createWorkoutSchema.safeParse(ctx.request.body);
  if (!validationResult.success) {
    throw validationResult.error;
  }

  const data: CreateWorkoutInput = validationResult.data;

  // Verify user exists
  const user = await UserMongooseModel.findByAuthId(userId);
  if (!user) {
    throw new ApiError(404, 'User not found', ErrorCode.USER_NOT_FOUND);
  }

  // Create workout
  const workout = await Workout.create({
    userId: String(user._id),
    ...data,
  });

  const response: WorkoutResponse = {
    workout: toWorkoutResponse(workout),
  };

  ctx.status = 201;
  ctx.body = response;
};

/**
 * Get workouts for the authenticated user or a specific user (with optional filters)
 */
export const getWorkouts = async (ctx: AuthContext): Promise<void> => {
  const { userId: authUserId } = ctx.state.auth;

  // Get query parameters
  const targetUserId = ctx.query.userId as string | undefined;
  const startDate = ctx.query.startDate as string | undefined;
  const endDate = ctx.query.endDate as string | undefined;
  const type = ctx.query.type as string | undefined;

  // Determine which user's workouts to fetch
  let queryUserId = authUserId;

  if (targetUserId) {
    // If requesting another user's workouts, verify the target user exists
    const targetUser = await UserMongooseModel.findById(targetUserId);
    if (!targetUser) {
      throw new ApiError(404, 'User not found', ErrorCode.USER_NOT_FOUND);
    }
    queryUserId = targetUserId;
  } else {
    // No targetUserId provided, use authenticated user
    const currentUser = await UserMongooseModel.findByAuthId(authUserId);
    if (!currentUser) {
      throw new ApiError(404, 'User not found', ErrorCode.USER_NOT_FOUND);
    }
    queryUserId = String(currentUser._id);
  }

  let workouts: WorkoutDocument[];

  // Fetch workouts with filters
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ApiError(
        400,
        'Invalid date format',
        ErrorCode.VALIDATION_ERROR,
      );
    }

    workouts = await Workout.findByDateRange(queryUserId, start, end);
  } else {
    workouts = await Workout.findByUserId(queryUserId);
  }

  // Apply type filter if provided
  if (type) {
    workouts = workouts.filter(workout => workout.type === type);
  }

  const response: WorkoutsListResponse = {
    workouts: workouts.map(toWorkoutResponse),
    total: workouts.length,
  };

  ctx.status = 200;
  ctx.body = response;
};

/**
 * Get a single workout by ID
 */
export const getWorkout = async (ctx: AuthContext): Promise<void> => {
  const { userId: authUserId } = ctx.state.auth;
  const { workoutId } = ctx.params;

  const workout = await Workout.findById(workoutId);

  if (!workout) {
    throw new ApiError(404, 'Workout not found', ErrorCode.NOT_FOUND);
  }

  // Get the authenticated user's database ID
  const currentUser = await UserMongooseModel.findByAuthId(authUserId);
  if (!currentUser) {
    throw new ApiError(404, 'User not found', ErrorCode.USER_NOT_FOUND);
  }

  // Check if the workout belongs to the authenticated user or if they have permission to view it
  // For now, users can only view their own workouts
  // TODO: Implement follower/sharing logic when needed
  if (workout.userId !== String(currentUser._id)) {
    throw new ApiError(
      403,
      'You do not have permission to view this workout',
      ErrorCode.FORBIDDEN,
    );
  }

  const response: WorkoutResponse = {
    workout: toWorkoutResponse(workout),
  };

  ctx.status = 200;
  ctx.body = response;
};

/**
 * Update a workout
 */
export const updateWorkout = async (ctx: AuthContext): Promise<void> => {
  const { userId: authUserId } = ctx.state.auth;
  const { workoutId } = ctx.params;

  // Validate request body
  const validationResult = updateWorkoutSchema.safeParse(ctx.request.body);
  if (!validationResult.success) {
    throw validationResult.error;
  }

  const data: UpdateWorkoutInput = validationResult.data;

  const workout = await Workout.findById(workoutId);

  if (!workout) {
    throw new ApiError(404, 'Workout not found', ErrorCode.NOT_FOUND);
  }

  // Get the authenticated user's database ID
  const currentUser = await UserMongooseModel.findByAuthId(authUserId);
  if (!currentUser) {
    throw new ApiError(404, 'User not found', ErrorCode.USER_NOT_FOUND);
  }

  // Check if the workout belongs to the authenticated user
  if (workout.userId !== String(currentUser._id)) {
    throw new ApiError(
      403,
      'You do not have permission to update this workout',
      ErrorCode.FORBIDDEN,
    );
  }

  // If workout type is being changed, clear old type-specific details
  if (data.type && data.type !== workout.type) {
    // Clear all type-specific details
    workout.gymDetails = undefined;
    workout.longRunDetails = undefined;
    workout.swimmingDetails = undefined;
    workout.cyclingDetails = undefined;
    workout.recoveryDetails = undefined;
    workout.intervalDetails = undefined;
    workout.runDetails = undefined;
  }

  // Update workout with new data
  Object.assign(workout, data);
  await workout.save();

  const response: WorkoutResponse = {
    workout: toWorkoutResponse(workout),
  };

  ctx.status = 200;
  ctx.body = response;
};

/**
 * Delete a workout
 */
export const deleteWorkout = async (ctx: AuthContext): Promise<void> => {
  const { userId: authUserId } = ctx.state.auth;
  const { workoutId } = ctx.params;

  const workout = await Workout.findById(workoutId);

  if (!workout) {
    throw new ApiError(404, 'Workout not found', ErrorCode.NOT_FOUND);
  }

  // Get the authenticated user's database ID
  const currentUser = await UserMongooseModel.findByAuthId(authUserId);
  if (!currentUser) {
    throw new ApiError(404, 'User not found', ErrorCode.USER_NOT_FOUND);
  }

  // Check if the workout belongs to the authenticated user
  if (workout.userId !== String(currentUser._id)) {
    throw new ApiError(
      403,
      'You do not have permission to delete this workout',
      ErrorCode.FORBIDDEN,
    );
  }

  await workout.deleteOne();

  ctx.status = 204;
};
