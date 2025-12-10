import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders as render } from '../../../test-utils';
import { CalendarLegend } from './CalendarLegend';

describe('CalendarLegend', () => {
  const mockCalendars = [
    { id: 'cal-1', name: 'John Athlete', color: '#1976d2', userId: 'user-1' },
    { id: 'cal-2', name: 'Sarah Runner', color: '#d32f2f', userId: 'user-2' },
    { id: 'cal-3', name: 'Mike Trainer', color: '#388e3c', userId: 'user-3' },
  ];

  const mockOnToggleCalendar = vi.fn();

  it('should render all calendar chips', () => {
    const enabledCalendarIds = new Set(['cal-1', 'cal-2', 'cal-3']);

    render(
      <CalendarLegend
        calendars={mockCalendars}
        enabledCalendarIds={enabledCalendarIds}
        onToggleCalendar={mockOnToggleCalendar}
      />,
    );

    expect(screen.getByText('John Athlete')).toBeInTheDocument();
    expect(screen.getByText('Sarah Runner')).toBeInTheDocument();
    expect(screen.getByText('Mike Trainer')).toBeInTheDocument();
  });

  it('should call onToggleCalendar when chip is clicked', () => {
    const enabledCalendarIds = new Set(['cal-1', 'cal-2', 'cal-3']);

    render(
      <CalendarLegend
        calendars={mockCalendars}
        enabledCalendarIds={enabledCalendarIds}
        onToggleCalendar={mockOnToggleCalendar}
      />,
    );

    const chip = screen.getByText('John Athlete');
    fireEvent.click(chip);

    expect(mockOnToggleCalendar).toHaveBeenCalledWith('cal-1');
  });

  it('should render enabled and disabled chips correctly', () => {
    const enabledCalendarIds = new Set(['cal-1']);

    render(
      <CalendarLegend
        calendars={mockCalendars}
        enabledCalendarIds={enabledCalendarIds}
        onToggleCalendar={mockOnToggleCalendar}
      />,
    );

    // All chips should be rendered
    expect(screen.getByText('John Athlete')).toBeInTheDocument();
    expect(screen.getByText('Sarah Runner')).toBeInTheDocument();
    expect(screen.getByText('Mike Trainer')).toBeInTheDocument();
  });
});
