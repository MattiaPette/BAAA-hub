import { Calendar } from '../../../types/tracker';

export interface CalendarLegendProps {
  calendars: Calendar[];
  enabledCalendarIds: Set<string>;
  onToggleCalendar: (calendarId: string) => void;
}
