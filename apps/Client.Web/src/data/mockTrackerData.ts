/**
 * Mock data for the Tracker Calendar feature
 * Used for UI prototyping only - no real backend integration
 */

import { Workout, WorkoutType, Calendar } from '../types/tracker';

/**
 * Mock calendars (users/trainees)
 */
export const mockCalendars: Calendar[] = [
  {
    id: 'cal-1',
    name: 'John Athlete',
    color: '#1976d2',
    userId: 'user-1',
  },
  {
    id: 'cal-2',
    name: 'Sarah Runner',
    color: '#d32f2f',
    userId: 'user-2',
  },
  {
    id: 'cal-3',
    name: 'Mike Trainer',
    color: '#388e3c',
    userId: 'user-3',
  },
];

/**
 * Mock workout data for different calendars
 */
export const mockWorkouts: Workout[] = [
  // John's workouts
  {
    id: 'workout-1',
    date: new Date(2025, 11, 10), // Dec 10, 2025
    startHour: 6,
    startMinute: 0,
    endHour: 7,
    endMinute: 30,
    type: WorkoutType.RUN,
    calendarId: 'cal-1',
  },
  {
    id: 'workout-2',
    date: new Date(2025, 11, 10),
    startHour: 18,
    startMinute: 0,
    endHour: 19,
    endMinute: 0,
    type: WorkoutType.GYM,
    calendarId: 'cal-1',
  },
  {
    id: 'workout-3',
    date: new Date(2025, 11, 12),
    startHour: 6,
    startMinute: 30,
    endHour: 8,
    endMinute: 0,
    type: WorkoutType.INTERVAL_TRAINING,
    calendarId: 'cal-1',
  },
  {
    id: 'workout-4',
    date: new Date(2025, 11, 15),
    startHour: 7,
    startMinute: 0,
    endHour: 9,
    endMinute: 30,
    type: WorkoutType.LONG_RUN,
    calendarId: 'cal-1',
  },

  // Sarah's workouts
  {
    id: 'workout-5',
    date: new Date(2025, 11, 9),
    startHour: 5,
    startMinute: 30,
    endHour: 6,
    endMinute: 30,
    type: WorkoutType.RECOVERY,
    calendarId: 'cal-2',
  },
  {
    id: 'workout-6',
    date: new Date(2025, 11, 11),
    startHour: 6,
    startMinute: 0,
    endHour: 7,
    endMinute: 0,
    type: WorkoutType.RUN,
    calendarId: 'cal-2',
  },
  {
    id: 'workout-7',
    date: new Date(2025, 11, 13),
    startHour: 17,
    startMinute: 0,
    endHour: 18,
    endMinute: 30,
    type: WorkoutType.GYM,
    calendarId: 'cal-2',
  },

  // Mike's workouts
  {
    id: 'workout-8',
    date: new Date(2025, 11, 8),
    startHour: 8,
    startMinute: 0,
    endHour: 9,
    endMinute: 0,
    type: WorkoutType.GYM,
    calendarId: 'cal-3',
  },
  {
    id: 'workout-9',
    date: new Date(2025, 11, 14),
    startHour: 7,
    startMinute: 0,
    endHour: 8,
    endMinute: 30,
    type: WorkoutType.RUN,
    calendarId: 'cal-3',
  },
];
