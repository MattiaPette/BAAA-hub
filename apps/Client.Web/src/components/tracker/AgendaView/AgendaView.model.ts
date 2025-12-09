import { Workout } from '../../../types/tracker';

/**
 * Props for the AgendaView component
 */
export interface AgendaViewProps {
  /**
   * The current month being displayed
   */
  currentMonth: Date;

  /**
   * Array of workouts to display in the agenda
   */
  workouts: Workout[];

  /**
   * Callback when a day is clicked
   */
  onDayClick: (date: Date) => void;

  /**
   * Callback when a workout item is clicked
   */
  onWorkoutClick: (workout: Readonly<Workout>) => void;
}

/**
 * Represents a day in the agenda with its workouts
 */
export interface AgendaDay {
  date: Date;
  workouts: Workout[];
}
