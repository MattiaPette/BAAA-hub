import { Calendar } from '../../../types/tracker';

export interface CalendarSidebarProps {
  calendars: Calendar[];
  selectedCalendarId: string;
  onCalendarSelect: (calendarId: string) => void;
}
