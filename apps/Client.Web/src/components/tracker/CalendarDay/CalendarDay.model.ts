import { Workout } from '../../../types/tracker';

export interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  workouts: Workout[];
  onDayClick: (date: Date) => void;
}
