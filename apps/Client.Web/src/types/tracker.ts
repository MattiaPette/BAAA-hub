/**
 * Types for the Tracker Calendar feature
 * All types are for UI prototyping with mocked data only
 */

/**
 * Workout type enumeration
 */
export enum WorkoutType {
  RUN = 'RUN',
  GYM = 'GYM',
  LONG_RUN = 'LONG_RUN',
  RECOVERY = 'RECOVERY',
  INTERVAL_TRAINING = 'INTERVAL_TRAINING',
}

/**
 * Exercise types for gym workouts
 */
export enum ExerciseType {
  BARBELL = 'BARBELL',
  DUMBBELL = 'DUMBBELL',
  MACHINE = 'MACHINE',
  BODYWEIGHT = 'BODYWEIGHT',
  CABLE = 'CABLE',
  KETTLEBELL = 'KETTLEBELL',
  OTHER = 'OTHER',
}

/**
 * Muscle groups for gym workouts
 */
export enum MuscleGroup {
  CHEST = 'CHEST',
  BACK = 'BACK',
  SHOULDERS = 'SHOULDERS',
  BICEPS = 'BICEPS',
  TRICEPS = 'TRICEPS',
  LEGS = 'LEGS',
  CORE = 'CORE',
  GLUTES = 'GLUTES',
  CARDIO = 'CARDIO',
}

/**
 * Intensity levels for workouts
 */
export enum IntensityLevel {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
}

/**
 * Heart rate zones for running workouts
 */
export enum HeartRateZone {
  Z1 = 'Z1',
  Z2 = 'Z2',
  Z3 = 'Z3',
  Z4 = 'Z4',
  Z5 = 'Z5',
  Z6 = 'Z6',
  Z7 = 'Z7',
  CUSTOM = 'CUSTOM',
}

/**
 * Represents a single exercise set in a gym workout
 */
export interface ExerciseSet {
  reps: number;
  weight?: number; // in kg, optional for bodyweight exercises
}

/**
 * Represents a single exercise in a gym workout
 */
export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  sets: ExerciseSet[];
}

/**
 * Gym-specific workout details
 */
export interface GymWorkoutDetails {
  exercises: Exercise[];
  intensity: IntensityLevel;
  restTimeBetweenSets: number; // in seconds
  muscleGroups: MuscleGroup[];
  notes?: string;
}

/**
 * Run-specific workout details
 */
export interface RunWorkoutDetails {
  distanceGoal?: number; // in kilometers
  paceGoal?: number; // in minutes per kilometer
  heartRateZone?: HeartRateZone;
  customHeartRateMin?: number; // BPM, used when heartRateZone is CUSTOM
  customHeartRateMax?: number; // BPM, used when heartRateZone is CUSTOM
  notes?: string;
}

/**
 * Represents a single workout activity
 */
export interface Workout {
  id: string;
  date: Date;
  startHour: number; // 0-23
  startMinute: number; // 0-59
  endHour: number; // 0-23
  endMinute: number; // 0-59
  type: WorkoutType;
  calendarId: string;
  gymDetails?: GymWorkoutDetails; // Only present for GYM type workouts
  runDetails?: RunWorkoutDetails; // Only present for RUN type workouts
}

/**
 * Represents a user calendar (trainee/follower)
 */
export interface Calendar {
  id: string;
  name: string;
  color: string;
  userId: string;
}
