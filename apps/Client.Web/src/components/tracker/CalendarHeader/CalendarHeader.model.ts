import { Calendar } from '../../../types/tracker';

export interface CalendarHeaderProps {
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  calendars: Calendar[];
  selectedCalendarId: string;
  onCalendarSelect: (calendarId: string) => void;
}
