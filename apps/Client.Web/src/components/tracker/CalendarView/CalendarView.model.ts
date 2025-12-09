import { Workout } from '../../../types/tracker';

export interface CalendarViewProps {
  currentMonth: Date;
  workouts: Workout[];
  onDayClick: (date: Date) => void;
}
