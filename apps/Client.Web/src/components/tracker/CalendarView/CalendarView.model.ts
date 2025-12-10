import { Workout, Calendar } from '../../../types/tracker';

export interface CalendarViewProps {
  currentMonth: Date;
  workouts: Workout[];
  onDayClick: (date: Date) => void;
  onWorkoutClick: (workout: Readonly<Workout>) => void;
  calendars?: Calendar[];
  isCombinedView?: boolean;
}
