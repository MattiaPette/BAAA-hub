import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  WorkoutType,
  Workout as WorkoutInterface,
  ExerciseType,
  MuscleGroup,
  IntensityLevel,
  SwimType,
  RecoveryActivityType,
  RecoveryFocusArea,
  HeartRateZone,
} from '@baaa-hub/shared-types';

/**
 * Workout document interface for Mongoose
 */
export interface WorkoutDocument
  extends Omit<WorkoutInterface, 'id'>,
    Document {
  _id: mongoose.Types.ObjectId;
}

/**
 * Workout model interface with static methods
 */
export interface IWorkoutModel extends Model<WorkoutDocument> {
  findByUserId(userId: string): Promise<WorkoutDocument[]>;
  findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<WorkoutDocument[]>;
}

/**
 * Exercise Set subdocument schema
 */
const exerciseSetSchema = new Schema(
  {
    reps: {
      type: Number,
      required: [true, 'Reps are required'],
      min: [1, 'Reps must be at least 1'],
    },
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative'],
    },
  },
  { _id: false },
);

/**
 * Exercise subdocument schema
 */
const exerciseSchema = new Schema(
  {
    id: {
      type: String,
      required: [true, 'Exercise ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Exercise name is required'],
      trim: true,
      maxlength: [100, 'Exercise name must be 100 characters or less'],
    },
    type: {
      type: String,
      required: [true, 'Exercise type is required'],
      enum: Object.values(ExerciseType),
    },
    sets: {
      type: [exerciseSetSchema],
      required: [true, 'At least one set is required'],
      validate: {
        validator: (v: unknown[]) => v.length >= 1,
        message: 'At least one set is required',
      },
    },
  },
  { _id: false },
);

/**
 * Gym workout details subdocument schema
 */
const gymWorkoutDetailsSchema = new Schema(
  {
    exercises: {
      type: [exerciseSchema],
      required: [true, 'At least one exercise is required'],
      validate: {
        validator: (v: unknown[]) => v.length >= 1,
        message: 'At least one exercise is required',
      },
    },
    intensity: {
      type: String,
      required: [true, 'Intensity is required'],
      enum: Object.values(IntensityLevel),
    },
    restTimeBetweenSets: {
      type: Number,
      required: [true, 'Rest time between sets is required'],
      min: [0, 'Rest time cannot be negative'],
    },
    muscleGroups: {
      type: [String],
      required: [true, 'At least one muscle group is required'],
      enum: Object.values(MuscleGroup),
      validate: {
        validator: (v: string[]) => v.length >= 1,
        message: 'At least one muscle group is required',
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes must be 1000 characters or less'],
    },
  },
  { _id: false },
);

/**
 * Long run workout details subdocument schema
 */
const longRunWorkoutDetailsSchema = new Schema(
  {
    distanceGoal: {
      type: Number,
      required: [true, 'Distance goal is required'],
      min: [0.001, 'Distance must be positive'],
    },
    paceGoal: {
      type: Number,
      min: [0.001, 'Pace must be positive'],
    },
    hydrationNotes: {
      type: String,
      trim: true,
      maxlength: [500, 'Hydration notes must be 500 characters or less'],
    },
    averageHeartRate: {
      type: Number,
      min: [0, 'Heart rate cannot be negative'],
    },
    peakHeartRate: {
      type: Number,
      min: [0, 'Heart rate cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes must be 1000 characters or less'],
    },
  },
  { _id: false },
);

/**
 * Swimming workout details subdocument schema
 */
const swimmingWorkoutDetailsSchema = new Schema(
  {
    distanceGoal: {
      type: Number,
      required: [true, 'Distance goal is required'],
      min: [0.001, 'Distance must be positive'],
    },
    lapCount: {
      type: Number,
      required: [true, 'Lap count is required'],
      min: [1, 'Lap count must be at least 1'],
    },
    timePerLap: {
      type: Number,
      required: [true, 'Time per lap is required'],
      min: [0, 'Time per lap cannot be negative'],
    },
    swimType: {
      type: String,
      required: [true, 'Swim type is required'],
      enum: Object.values(SwimType),
    },
    intensity: {
      type: String,
      required: [true, 'Intensity is required'],
      enum: Object.values(IntensityLevel),
    },
    heartRate: {
      type: Number,
      min: [0, 'Heart rate cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes must be 1000 characters or less'],
    },
  },
  { _id: false },
);

/**
 * Cycling workout details subdocument schema
 */
const cyclingWorkoutDetailsSchema = new Schema(
  {
    distance: {
      type: Number,
      min: [0.001, 'Distance must be positive'],
    },
    averageSpeed: {
      type: Number,
      min: [0.001, 'Average speed must be positive'],
    },
    elevationGain: {
      type: Number,
      min: [0, 'Elevation gain cannot be negative'],
    },
    averageHeartRate: {
      type: Number,
      min: [0, 'Heart rate cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes must be 1000 characters or less'],
    },
  },
  { _id: false },
);

/**
 * Recovery workout details subdocument schema
 */
const recoveryWorkoutDetailsSchema = new Schema(
  {
    activityType: {
      type: String,
      required: [true, 'Activity type is required'],
      enum: Object.values(RecoveryActivityType),
    },
    intensity: {
      type: String,
      required: [true, 'Intensity is required'],
      enum: Object.values(IntensityLevel),
    },
    focusAreas: {
      type: [String],
      required: [true, 'At least one focus area is required'],
      enum: Object.values(RecoveryFocusArea),
      validate: {
        validator: (v: string[]) => v.length >= 1,
        message: 'At least one focus area is required',
      },
    },
    heartRate: {
      type: Number,
      min: [0, 'Heart rate cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes must be 1000 characters or less'],
    },
  },
  { _id: false },
);

/**
 * Interval segment subdocument schema
 */
const intervalSegmentSchema = new Schema(
  {
    id: {
      type: String,
      required: [true, 'Interval segment ID is required'],
    },
    type: {
      type: String,
      required: [true, 'Interval type is required'],
      enum: ['work', 'rest'],
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration minutes is required'],
      min: [0, 'Duration minutes cannot be negative'],
    },
    durationSeconds: {
      type: Number,
      required: [true, 'Duration seconds is required'],
      min: [0, 'Duration seconds cannot be negative'],
      max: [59, 'Duration seconds must be 59 or less'],
    },
    distance: {
      type: Number,
      min: [0.001, 'Distance must be positive'],
    },
    targetPace: {
      type: String,
      trim: true,
      match: [/^\d{2}:\d{2}$/, 'Target pace must be in MM:SS format'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes must be 500 characters or less'],
    },
  },
  { _id: false },
);

/**
 * Interval training workout details subdocument schema
 */
const intervalWorkoutDetailsSchema = new Schema(
  {
    intervals: {
      type: [intervalSegmentSchema],
      required: [true, 'At least one interval is required'],
      validate: {
        validator: (v: unknown[]) => v.length >= 1,
        message: 'At least one interval is required',
      },
    },
    rounds: {
      type: Number,
      required: [true, 'Rounds is required'],
      min: [1, 'Rounds must be at least 1'],
    },
    intensity: {
      type: String,
      required: [true, 'Intensity is required'],
      enum: Object.values(IntensityLevel),
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes must be 1000 characters or less'],
    },
  },
  { _id: false },
);

/**
 * Run workout details subdocument schema
 */
const runWorkoutDetailsSchema = new Schema(
  {
    distanceGoal: {
      type: Number,
      min: [0.001, 'Distance must be positive'],
    },
    paceGoal: {
      type: Number,
      min: [0.001, 'Pace must be positive'],
    },
    heartRateZone: {
      type: String,
      enum: Object.values(HeartRateZone),
    },
    customHeartRateMin: {
      type: Number,
      min: [0, 'Heart rate cannot be negative'],
    },
    customHeartRateMax: {
      type: Number,
      min: [0, 'Heart rate cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes must be 1000 characters or less'],
    },
  },
  { _id: false },
);

/**
 * Mongoose schema for Workout
 */
const workoutSchema = new Schema<WorkoutDocument>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      index: true,
    },
    startHour: {
      type: Number,
      required: [true, 'Start hour is required'],
      min: [0, 'Start hour must be between 0 and 23'],
      max: [23, 'Start hour must be between 0 and 23'],
    },
    startMinute: {
      type: Number,
      required: [true, 'Start minute is required'],
      min: [0, 'Start minute must be between 0 and 59'],
      max: [59, 'Start minute must be between 0 and 59'],
    },
    endHour: {
      type: Number,
      required: [true, 'End hour is required'],
      min: [0, 'End hour must be between 0 and 23'],
      max: [23, 'End hour must be between 0 and 23'],
    },
    endMinute: {
      type: Number,
      required: [true, 'End minute is required'],
      min: [0, 'End minute must be between 0 and 59'],
      max: [59, 'End minute must be between 0 and 59'],
    },
    type: {
      type: String,
      required: [true, 'Workout type is required'],
      enum: Object.values(WorkoutType),
      index: true,
    },
    gymDetails: gymWorkoutDetailsSchema,
    longRunDetails: longRunWorkoutDetailsSchema,
    swimmingDetails: swimmingWorkoutDetailsSchema,
    cyclingDetails: cyclingWorkoutDetailsSchema,
    recoveryDetails: recoveryWorkoutDetailsSchema,
    intervalDetails: intervalWorkoutDetailsSchema,
    runDetails: runWorkoutDetailsSchema,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        const id = String(ret._id);
        // Remove internal fields
        const result = Object.fromEntries(
          Object.entries(ret).filter(([key]) => key !== '_id' && key !== '__v'),
        );
        return { ...result, id };
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        const id = String(ret._id);
        // Remove internal fields
        const result = Object.fromEntries(
          Object.entries(ret).filter(([key]) => key !== '_id' && key !== '__v'),
        );
        return { ...result, id };
      },
    },
  },
);

// Indexes for efficient querying
workoutSchema.index({ userId: 1, date: 1 });
workoutSchema.index({ userId: 1, type: 1 });

/**
 * Static methods
 */
workoutSchema.statics.findByUserId = function (
  userId: string,
): Promise<WorkoutDocument[]> {
  return this.find({ userId }).sort({ date: -1 }).exec();
};

workoutSchema.statics.findByDateRange = function (
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<WorkoutDocument[]> {
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  return this.find({
    userId,
    date: {
      $gte: startDateStr,
      $lte: endDateStr,
    },
  })
    .sort({ date: 1 })
    .exec();
};

/**
 * Workout model
 */
export const Workout = mongoose.model<WorkoutDocument, IWorkoutModel>(
  'Workout',
  workoutSchema,
);
