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
  SWIMMING = 'SWIMMING',
  CYCLING = 'CYCLING',
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
 * Swim types for swimming workouts
 */
export enum SwimType {
  FREESTYLE = 'FREESTYLE',
  BACKSTROKE = 'BACKSTROKE',
  BREASTSTROKE = 'BREASTSTROKE',
  BUTTERFLY = 'BUTTERFLY',
  INDIVIDUAL_MEDLEY = 'INDIVIDUAL_MEDLEY',
}

/**
 * Recovery activity types
 */
export enum RecoveryActivityType {
  STRETCHING = 'STRETCHING',
  FOAM_ROLLING = 'FOAM_ROLLING',
  YOGA = 'YOGA',
  MASSAGE = 'MASSAGE',
  ACTIVE_RECOVERY = 'ACTIVE_RECOVERY',
  ICE_BATH = 'ICE_BATH',
  SAUNA = 'SAUNA',
  OTHER = 'OTHER',
}

/**
 * Focus areas for recovery sessions
 */
export enum RecoveryFocusArea {
  FULL_BODY = 'FULL_BODY',
  UPPER_BODY = 'UPPER_BODY',
  LOWER_BODY = 'LOWER_BODY',
  BACK = 'BACK',
  LEGS = 'LEGS',
  SHOULDERS = 'SHOULDERS',
  CORE = 'CORE',
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
 * Swimming-specific workout details
 */
export interface SwimmingWorkoutDetails {
  distanceGoal: number; // in meters
  lapCount: number;
  timePerLap: number; // in seconds
  swimType: SwimType;
  intensity: IntensityLevel;
  heartRate?: number; // optional, beats per minute
  notes?: string;
}

/**
 * Cycling-specific workout details
 */
export interface CyclingWorkoutDetails {
  distance?: number; // in km
  averageSpeed?: number; // in km/h
  elevationGain?: number; // in meters
  averageHeartRate?: number; // in bpm
  notes?: string;
}

/**
 * Recovery-specific workout details
 */
export interface RecoveryWorkoutDetails {
  activityType: RecoveryActivityType;
  intensity: IntensityLevel;
  focusAreas: RecoveryFocusArea[];
  heartRate?: number; // optional heart rate in bpm
  notes?: string;
}

/**
 * Represents a single interval in interval training
 */
export interface IntervalSegment {
  id: string;
  type: 'work' | 'rest';
  durationMinutes: number;
  durationSeconds: number;
  distance?: number; // in km, optional
  targetPace?: string; // Format: MM:SS per km, optional
  notes?: string;
}

/**
 * Interval training-specific workout details
 */
export interface IntervalWorkoutDetails {
  intervals: IntervalSegment[];
  rounds: number; // number of times to repeat the interval sequence
  intensity: IntensityLevel;
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
  swimmingDetails?: SwimmingWorkoutDetails; // Only present for SWIMMING type workouts
  cyclingDetails?: CyclingWorkoutDetails; // Only present for CYCLING type workouts
  recoveryDetails?: RecoveryWorkoutDetails; // Only present for RECOVERY type workouts
  intervalDetails?: IntervalWorkoutDetails; // Only present for INTERVAL_TRAINING type workouts
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
