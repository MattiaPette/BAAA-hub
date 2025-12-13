/**
 * Mock data for the Tracker Calendar feature
 * Used for UI prototyping only - no real backend integration
 */

import {
  Workout,
  WorkoutType,
  Calendar,
  IntensityLevel,
  ExerciseType,
  MuscleGroup,
  SwimType,
  RecoveryActivityType,
  RecoveryFocusArea,
  HeartRateZone,
} from '../types/tracker';

/**
 * Mock calendars (users/trainees)
 * The first calendar (cal-1) represents the current user's calendar
 */
export const mockCalendars: Calendar[] = [
  {
    id: 'cal-1',
    name: 'John Athlete',
    color: '#1976d2',
    userId: 'user-1',
    isCurrentUser: true,
  },
  {
    id: 'cal-2',
    name: 'Sarah Runner',
    color: '#d32f2f',
    userId: 'user-2',
    isCurrentUser: false,
  },
  {
    id: 'cal-3',
    name: 'Mike Trainer',
    color: '#388e3c',
    userId: 'user-3',
    isCurrentUser: false,
  },
];

/**
 * Get the current user's calendar ID
 */
export const getCurrentUserCalendarId = (): string =>
  mockCalendars.find(cal => cal.isCurrentUser)?.id || mockCalendars[0].id;

/**
 * Get current month for mock data base
 */
const getCurrentMonthBase = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

/**
 * Mock workout data for different calendars
 * Uses current month to ensure workouts are visible in the calendar view
 */
export const mockWorkouts: Workout[] = [
  // John's workouts - Complete showcase of all workout types with full details
  {
    id: 'workout-1',
    date: new Date(
      getCurrentMonthBase().getFullYear(),
      getCurrentMonthBase().getMonth(),
      10,
    ),
    startHour: 6,
    startMinute: 0,
    endHour: 7,
    endMinute: 30,
    type: WorkoutType.RUN,
    calendarId: 'cal-1',
    runDetails: {
      distanceGoal: 10,
      paceGoal: 5.5,
      heartRateZone: HeartRateZone.Z3,
      notes: 'Morning tempo run, felt great!',
    },
  },
  {
    id: 'workout-2',
    date: new Date(
      getCurrentMonthBase().getFullYear(),
      getCurrentMonthBase().getMonth(),
      10,
    ),
    startHour: 18,
    startMinute: 0,
    endHour: 19,
    endMinute: 0,
    type: WorkoutType.GYM,
    calendarId: 'cal-1',
    gymDetails: {
      exercises: [
        {
          id: 'ex-1',
          name: 'Bench Press',
          type: ExerciseType.BARBELL,
          sets: [
            { reps: 10, weight: 80 },
            { reps: 8, weight: 85 },
            { reps: 6, weight: 90 },
          ],
        },
        {
          id: 'ex-2',
          name: 'Incline Dumbbell Press',
          type: ExerciseType.DUMBBELL,
          sets: [
            { reps: 12, weight: 30 },
            { reps: 10, weight: 32.5 },
            { reps: 8, weight: 35 },
          ],
        },
        {
          id: 'ex-3',
          name: 'Cable Flyes',
          type: ExerciseType.CABLE,
          sets: [
            { reps: 15, weight: 20 },
            { reps: 15, weight: 20 },
            { reps: 12, weight: 22.5 },
          ],
        },
        {
          id: 'ex-4',
          name: 'Push-ups',
          type: ExerciseType.BODYWEIGHT,
          sets: [{ reps: 25 }, { reps: 20 }, { reps: 18 }],
        },
      ],
      intensity: IntensityLevel.HIGH,
      restTimeBetweenSets: 90,
      muscleGroups: [
        MuscleGroup.CHEST,
        MuscleGroup.TRICEPS,
        MuscleGroup.SHOULDERS,
      ],
      notes: 'Great chest day, increased weight on incline press',
    },
  },
  {
    id: 'workout-3',
    date: new Date(
      getCurrentMonthBase().getFullYear(),
      getCurrentMonthBase().getMonth(),
      12,
    ),
    startHour: 6,
    startMinute: 30,
    endHour: 8,
    endMinute: 0,
    type: WorkoutType.INTERVAL_TRAINING,
    calendarId: 'cal-1',
    intervalDetails: {
      intervals: [
        {
          id: 'int-1',
          type: 'work',
          durationMinutes: 5,
          durationSeconds: 0,
          distance: 1.2,
          targetPace: '04:10',
          notes: 'Fast pace',
        },
        {
          id: 'int-2',
          type: 'rest',
          durationMinutes: 2,
          durationSeconds: 0,
          notes: 'Recovery jog',
        },
        {
          id: 'int-3',
          type: 'work',
          durationMinutes: 4,
          durationSeconds: 0,
          distance: 1.0,
          targetPace: '04:00',
          notes: 'Faster pace',
        },
        {
          id: 'int-4',
          type: 'rest',
          durationMinutes: 2,
          durationSeconds: 30,
          notes: 'Easy jog',
        },
      ],
      rounds: 3,
      intensity: IntensityLevel.VERY_HIGH,
      notes: 'Speed workout focusing on lactate threshold',
    },
  },
  {
    id: 'workout-4',
    date: new Date(
      getCurrentMonthBase().getFullYear(),
      getCurrentMonthBase().getMonth(),
      15,
    ),
    startHour: 7,
    startMinute: 0,
    endHour: 9,
    endMinute: 30,
    type: WorkoutType.LONG_RUN,
    calendarId: 'cal-1',
    longRunDetails: {
      distanceGoal: 21,
      paceGoal: 6.0,
      hydrationNotes: 'Took water every 5km, felt well hydrated',
      averageHeartRate: 145,
      peakHeartRate: 162,
      notes: 'Half marathon distance, preparation for upcoming race',
    },
  },
  {
    id: 'workout-10',
    date: new Date(
      getCurrentMonthBase().getFullYear(),
      getCurrentMonthBase().getMonth(),
      16,
    ),
    startHour: 8,
    startMinute: 0,
    endHour: 9,
    endMinute: 0,
    type: WorkoutType.SWIMMING,
    calendarId: 'cal-1',
    swimmingDetails: {
      distanceGoal: 2000,
      lapCount: 40,
      timePerLap: 50,
      swimType: SwimType.FREESTYLE,
      intensity: IntensityLevel.MODERATE,
      heartRate: 135,
      notes: 'Pool session focusing on technique',
    },
  },
  {
    id: 'workout-11',
    date: new Date(
      getCurrentMonthBase().getFullYear(),
      getCurrentMonthBase().getMonth(),
      17,
    ),
    startHour: 14,
    startMinute: 0,
    endHour: 16,
    endMinute: 30,
    type: WorkoutType.CYCLING,
    calendarId: 'cal-1',
    cyclingDetails: {
      distance: 45,
      averageSpeed: 28.5,
      elevationGain: 650,
      averageHeartRate: 152,
      notes: 'Hill training route, challenging but rewarding',
    },
  },

  // Sarah's workouts
  {
    id: 'workout-5',
    date: new Date(
      getCurrentMonthBase().getFullYear(),
      getCurrentMonthBase().getMonth(),
      9,
    ),
    startHour: 5,
    startMinute: 30,
    endHour: 6,
    endMinute: 30,
    type: WorkoutType.RECOVERY,
    calendarId: 'cal-2',
    recoveryDetails: {
      activityType: RecoveryActivityType.YOGA,
      intensity: IntensityLevel.LOW,
      focusAreas: [
        RecoveryFocusArea.FULL_BODY,
        RecoveryFocusArea.CORE,
        RecoveryFocusArea.BACK,
      ],
      heartRate: 85,
      notes: 'Vinyasa flow, great for flexibility',
    },
  },
  {
    id: 'workout-6',
    date: new Date(
      getCurrentMonthBase().getFullYear(),
      getCurrentMonthBase().getMonth(),
      11,
    ),
    startHour: 6,
    startMinute: 0,
    endHour: 7,
    endMinute: 0,
    type: WorkoutType.RUN,
    calendarId: 'cal-2',
    runDetails: {
      distanceGoal: 8,
      paceGoal: 6.2,
      heartRateZone: HeartRateZone.Z2,
      notes: 'Easy recovery run',
    },
  },
  {
    id: 'workout-7',
    date: new Date(
      getCurrentMonthBase().getFullYear(),
      getCurrentMonthBase().getMonth(),
      13,
    ),
    startHour: 17,
    startMinute: 0,
    endHour: 18,
    endMinute: 30,
    type: WorkoutType.GYM,
    calendarId: 'cal-2',
    gymDetails: {
      exercises: [
        {
          id: 'ex-5',
          name: 'Squats',
          type: ExerciseType.BARBELL,
          sets: [
            { reps: 12, weight: 60 },
            { reps: 10, weight: 65 },
            { reps: 8, weight: 70 },
          ],
        },
        {
          id: 'ex-6',
          name: 'Leg Press',
          type: ExerciseType.MACHINE,
          sets: [
            { reps: 15, weight: 100 },
            { reps: 12, weight: 110 },
            { reps: 10, weight: 120 },
          ],
        },
      ],
      intensity: IntensityLevel.MODERATE,
      restTimeBetweenSets: 120,
      muscleGroups: [MuscleGroup.LEGS, MuscleGroup.GLUTES],
      notes: 'Leg day focus',
    },
  },
  {
    id: 'workout-12',
    date: new Date(
      getCurrentMonthBase().getFullYear(),
      getCurrentMonthBase().getMonth(),
      18,
    ),
    startHour: 7,
    startMinute: 0,
    endHour: 8,
    endMinute: 0,
    type: WorkoutType.SWIMMING,
    calendarId: 'cal-2',
    swimmingDetails: {
      distanceGoal: 1500,
      lapCount: 60,
      timePerLap: 25,
      swimType: SwimType.INDIVIDUAL_MEDLEY,
      intensity: IntensityLevel.HIGH,
      heartRate: 155,
      notes: 'Mixed strokes workout',
    },
  },

  // Mike's workouts
  {
    id: 'workout-8',
    date: new Date(
      getCurrentMonthBase().getFullYear(),
      getCurrentMonthBase().getMonth(),
      8,
    ),
    startHour: 8,
    startMinute: 0,
    endHour: 9,
    endMinute: 0,
    type: WorkoutType.GYM,
    calendarId: 'cal-3',
    gymDetails: {
      exercises: [
        {
          id: 'ex-7',
          name: 'Deadlift',
          type: ExerciseType.BARBELL,
          sets: [
            { reps: 8, weight: 120 },
            { reps: 6, weight: 130 },
            { reps: 5, weight: 140 },
          ],
        },
        {
          id: 'ex-8',
          name: 'Bent Over Row',
          type: ExerciseType.BARBELL,
          sets: [
            { reps: 10, weight: 70 },
            { reps: 8, weight: 75 },
            { reps: 8, weight: 80 },
          ],
        },
        {
          id: 'ex-9',
          name: 'Pull-ups',
          type: ExerciseType.BODYWEIGHT,
          sets: [{ reps: 12 }, { reps: 10 }, { reps: 8 }],
        },
      ],
      intensity: IntensityLevel.VERY_HIGH,
      restTimeBetweenSets: 180,
      muscleGroups: [MuscleGroup.BACK, MuscleGroup.BICEPS],
      notes: 'Back and biceps power session',
    },
  },
  {
    id: 'workout-9',
    date: new Date(
      getCurrentMonthBase().getFullYear(),
      getCurrentMonthBase().getMonth(),
      14,
    ),
    startHour: 7,
    startMinute: 0,
    endHour: 8,
    endMinute: 30,
    type: WorkoutType.RUN,
    calendarId: 'cal-3',
    runDetails: {
      distanceGoal: 12,
      paceGoal: 5.0,
      heartRateZone: HeartRateZone.CUSTOM,
      customHeartRateMin: 140,
      customHeartRateMax: 165,
      notes: 'Custom heart rate training zone',
    },
  },
  {
    id: 'workout-13',
    date: new Date(
      getCurrentMonthBase().getFullYear(),
      getCurrentMonthBase().getMonth(),
      19,
    ),
    startHour: 10,
    startMinute: 0,
    endHour: 11,
    endMinute: 30,
    type: WorkoutType.CYCLING,
    calendarId: 'cal-3',
    cyclingDetails: {
      distance: 65,
      averageSpeed: 32.0,
      elevationGain: 420,
      averageHeartRate: 148,
      notes: 'Long distance ride on flat terrain',
    },
  },
  {
    id: 'workout-14',
    date: new Date(
      getCurrentMonthBase().getFullYear(),
      getCurrentMonthBase().getMonth(),
      20,
    ),
    startHour: 18,
    startMinute: 0,
    endHour: 18,
    endMinute: 45,
    type: WorkoutType.RECOVERY,
    calendarId: 'cal-3',
    recoveryDetails: {
      activityType: RecoveryActivityType.FOAM_ROLLING,
      intensity: IntensityLevel.LOW,
      focusAreas: [RecoveryFocusArea.LOWER_BODY, RecoveryFocusArea.LEGS],
      notes: 'Post-cycling recovery, focused on IT bands and calves',
    },
  },
];
