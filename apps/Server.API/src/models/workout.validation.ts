import { z } from 'zod';
import {
  WorkoutType,
  ExerciseType,
  MuscleGroup,
  IntensityLevel,
  SwimType,
  RecoveryActivityType,
  RecoveryFocusArea,
  HeartRateZone,
} from '@baaa-hub/shared-types';

/**
 * Exercise set validation schema
 */
const exerciseSetSchema = z.object({
  reps: z.number().int().positive('Reps must be a positive integer'),
  weight: z.number().nonnegative('Weight cannot be negative').optional(),
});

/**
 * Exercise validation schema
 */
const exerciseSchema = z.object({
  id: z.string().min(1, 'Exercise ID is required'),
  name: z
    .string()
    .min(1, 'Exercise name is required')
    .max(100, 'Exercise name must be 100 characters or less'),
  type: z.nativeEnum(ExerciseType),
  sets: z
    .array(exerciseSetSchema)
    .min(1, 'At least one set is required')
    .max(20, 'Maximum 20 sets allowed'),
});

/**
 * Gym workout details validation schema
 */
const gymWorkoutDetailsSchema = z.object({
  exercises: z
    .array(exerciseSchema)
    .min(1, 'At least one exercise is required')
    .max(20, 'Maximum 20 exercises allowed'),
  intensity: z.nativeEnum(IntensityLevel),
  restTimeBetweenSets: z
    .number()
    .int()
    .nonnegative('Rest time cannot be negative'),
  muscleGroups: z
    .array(z.nativeEnum(MuscleGroup))
    .min(1, 'At least one muscle group is required')
    .max(9, 'Maximum 9 muscle groups allowed'),
  notes: z
    .string()
    .max(1000, 'Notes must be 1000 characters or less')
    .optional(),
});

/**
 * Long run workout details validation schema
 */
const longRunWorkoutDetailsSchema = z.object({
  distanceGoal: z.number().positive('Distance goal must be positive'),
  paceGoal: z.number().positive('Pace goal must be positive').optional(),
  hydrationNotes: z
    .string()
    .max(500, 'Hydration notes must be 500 characters or less')
    .optional(),
  averageHeartRate: z
    .number()
    .int()
    .positive('Average heart rate must be positive')
    .optional(),
  peakHeartRate: z
    .number()
    .int()
    .positive('Peak heart rate must be positive')
    .optional(),
  notes: z
    .string()
    .max(1000, 'Notes must be 1000 characters or less')
    .optional(),
});

/**
 * Swimming workout details validation schema
 */
const swimmingWorkoutDetailsSchema = z.object({
  distanceGoal: z.number().positive('Distance goal must be positive'),
  lapCount: z.number().int().positive('Lap count must be positive'),
  timePerLap: z.number().positive('Time per lap must be positive'),
  swimType: z.nativeEnum(SwimType),
  intensity: z.nativeEnum(IntensityLevel),
  heartRate: z
    .number()
    .int()
    .positive('Heart rate must be positive')
    .optional(),
  notes: z
    .string()
    .max(1000, 'Notes must be 1000 characters or less')
    .optional(),
});

/**
 * Cycling workout details validation schema
 */
const cyclingWorkoutDetailsSchema = z.object({
  distance: z.number().positive('Distance must be positive').optional(),
  averageSpeed: z
    .number()
    .positive('Average speed must be positive')
    .optional(),
  elevationGain: z
    .number()
    .nonnegative('Elevation gain cannot be negative')
    .optional(),
  averageHeartRate: z
    .number()
    .int()
    .positive('Average heart rate must be positive')
    .optional(),
  notes: z
    .string()
    .max(1000, 'Notes must be 1000 characters or less')
    .optional(),
});

/**
 * Recovery workout details validation schema
 */
const recoveryWorkoutDetailsSchema = z.object({
  activityType: z.nativeEnum(RecoveryActivityType),
  intensity: z.nativeEnum(IntensityLevel),
  focusAreas: z
    .array(z.nativeEnum(RecoveryFocusArea))
    .min(1, 'At least one focus area is required')
    .max(7, 'Maximum 7 focus areas allowed'),
  heartRate: z
    .number()
    .int()
    .positive('Heart rate must be positive')
    .optional(),
  notes: z
    .string()
    .max(1000, 'Notes must be 1000 characters or less')
    .optional(),
});

/**
 * Interval segment validation schema
 */
const intervalSegmentSchema = z.object({
  id: z.string().min(1, 'Interval segment ID is required'),
  type: z.enum(['work', 'rest']),
  durationMinutes: z
    .number()
    .int()
    .nonnegative('Duration minutes cannot be negative'),
  durationSeconds: z
    .number()
    .int()
    .min(0, 'Duration seconds cannot be negative')
    .max(59, 'Duration seconds must be 59 or less'),
  distance: z.number().positive('Distance must be positive').optional(),
  targetPace: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Target pace must be in MM:SS format')
    .optional(),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
});

/**
 * Interval training workout details validation schema
 */
const intervalWorkoutDetailsSchema = z.object({
  intervals: z
    .array(intervalSegmentSchema)
    .min(1, 'At least one interval is required')
    .max(20, 'Maximum 20 intervals allowed'),
  rounds: z.number().int().positive('Rounds must be positive'),
  intensity: z.nativeEnum(IntensityLevel),
  notes: z
    .string()
    .max(1000, 'Notes must be 1000 characters or less')
    .optional(),
});

/**
 * Run workout details validation schema
 */
const runWorkoutDetailsSchema = z.object({
  distanceGoal: z
    .number()
    .positive('Distance goal must be positive')
    .optional(),
  paceGoal: z.number().positive('Pace goal must be positive').optional(),
  heartRateZone: z.nativeEnum(HeartRateZone).optional(),
  customHeartRateMin: z
    .number()
    .int()
    .positive('Custom heart rate min must be positive')
    .optional(),
  customHeartRateMax: z
    .number()
    .int()
    .positive('Custom heart rate max must be positive')
    .optional(),
  notes: z
    .string()
    .max(1000, 'Notes must be 1000 characters or less')
    .optional(),
});

/**
 * Base workout validation schema (common fields)
 */
const baseWorkoutSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  startHour: z
    .number()
    .int()
    .min(0, 'Start hour must be between 0 and 23')
    .max(23, 'Start hour must be between 0 and 23'),
  startMinute: z
    .number()
    .int()
    .min(0, 'Start minute must be between 0 and 59')
    .max(59, 'Start minute must be between 0 and 59'),
  endHour: z
    .number()
    .int()
    .min(0, 'End hour must be between 0 and 23')
    .max(23, 'End hour must be between 0 and 23'),
  endMinute: z
    .number()
    .int()
    .min(0, 'End minute must be between 0 and 59')
    .max(59, 'End minute must be between 0 and 59'),
  type: z.nativeEnum(WorkoutType),
});

/**
 * Create workout validation schema
 */
export const createWorkoutSchema = baseWorkoutSchema
  .extend({
    gymDetails: gymWorkoutDetailsSchema.optional(),
    longRunDetails: longRunWorkoutDetailsSchema.optional(),
    swimmingDetails: swimmingWorkoutDetailsSchema.optional(),
    cyclingDetails: cyclingWorkoutDetailsSchema.optional(),
    recoveryDetails: recoveryWorkoutDetailsSchema.optional(),
    intervalDetails: intervalWorkoutDetailsSchema.optional(),
    runDetails: runWorkoutDetailsSchema.optional(),
  })
  .refine(
    data => {
      // Ensure the appropriate details are provided based on workout type
      switch (data.type) {
        case WorkoutType.GYM:
          return !!data.gymDetails;
        case WorkoutType.LONG_RUN:
          return !!data.longRunDetails;
        case WorkoutType.SWIMMING:
          return !!data.swimmingDetails;
        case WorkoutType.CYCLING:
          return !!data.cyclingDetails;
        case WorkoutType.RECOVERY:
          return !!data.recoveryDetails;
        case WorkoutType.INTERVAL_TRAINING:
          return !!data.intervalDetails;
        case WorkoutType.RUN:
          return !!data.runDetails;
        default:
          return false;
      }
    },
    {
      message: 'Workout details must match the workout type',
    },
  );

/**
 * Update workout validation schema (all fields optional)
 */
export const updateWorkoutSchema = z
  .object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .optional(),
    startHour: z
      .number()
      .int()
      .min(0, 'Start hour must be between 0 and 23')
      .max(23, 'Start hour must be between 0 and 23')
      .optional(),
    startMinute: z
      .number()
      .int()
      .min(0, 'Start minute must be between 0 and 59')
      .max(59, 'Start minute must be between 0 and 59')
      .optional(),
    endHour: z
      .number()
      .int()
      .min(0, 'End hour must be between 0 and 23')
      .max(23, 'End hour must be between 0 and 23')
      .optional(),
    endMinute: z
      .number()
      .int()
      .min(0, 'End minute must be between 0 and 59')
      .max(59, 'End minute must be between 0 and 59')
      .optional(),
    type: z.nativeEnum(WorkoutType).optional(),
    gymDetails: gymWorkoutDetailsSchema.optional(),
    longRunDetails: longRunWorkoutDetailsSchema.optional(),
    swimmingDetails: swimmingWorkoutDetailsSchema.optional(),
    cyclingDetails: cyclingWorkoutDetailsSchema.optional(),
    recoveryDetails: recoveryWorkoutDetailsSchema.optional(),
    intervalDetails: intervalWorkoutDetailsSchema.optional(),
    runDetails: runWorkoutDetailsSchema.optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  })
  .refine(
    data => {
      // If workout type is being updated, ensure the appropriate details are provided
      if (data.type) {
        switch (data.type) {
          case WorkoutType.GYM:
            return !!data.gymDetails;
          case WorkoutType.LONG_RUN:
            return !!data.longRunDetails;
          case WorkoutType.SWIMMING:
            return !!data.swimmingDetails;
          case WorkoutType.CYCLING:
            return !!data.cyclingDetails;
          case WorkoutType.RECOVERY:
            return !!data.recoveryDetails;
          case WorkoutType.INTERVAL_TRAINING:
            return !!data.intervalDetails;
          case WorkoutType.RUN:
            return !!data.runDetails;
          default:
            return false;
        }
      }
      return true;
    },
    {
      message:
        'When changing workout type, corresponding workout details must be provided',
    },
  );

/**
 * Type inference for TypeScript
 */
export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;
