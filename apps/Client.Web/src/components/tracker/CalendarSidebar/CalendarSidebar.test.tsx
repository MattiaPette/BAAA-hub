import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders as render } from '../../../test-utils';
import { CalendarSidebar } from './CalendarSidebar';

describe('CalendarSidebar', () => {
  const mockOnCalendarSelect = vi.fn();

  const mockCalendars = [
    { id: '1', name: 'John Athlete', color: '#2196F3', userId: 'user1' },
    { id: '2', name: 'Sarah Runner', color: '#F44336', userId: 'user2' },
    { id: '3', name: 'Mike Trainer', color: '#4CAF50', userId: 'user3' },
  ];

  it('should render "Available Calendars" title', () => {
    render(
      <CalendarSidebar
        calendars={mockCalendars}
        selectedCalendarId="1"
        onCalendarSelect={mockOnCalendarSelect}
      />,
    );

    expect(screen.getByText(/available calendars/i)).toBeInTheDocument();
  });

  it('should render all calendars', () => {
    render(
      <CalendarSidebar
        calendars={mockCalendars}
        selectedCalendarId="1"
        onCalendarSelect={mockOnCalendarSelect}
      />,
    );

    expect(screen.getByText('John Athlete')).toBeInTheDocument();
    expect(screen.getByText('Sarah Runner')).toBeInTheDocument();
    expect(screen.getByText('Mike Trainer')).toBeInTheDocument();
  });

  it('should call onCalendarSelect when calendar is clicked', () => {
    render(
      <CalendarSidebar
        calendars={mockCalendars}
        selectedCalendarId="1"
        onCalendarSelect={mockOnCalendarSelect}
      />,
    );

    const calendarItem = screen.getByText('Sarah Runner');
    fireEvent.click(calendarItem);

    expect(mockOnCalendarSelect).toHaveBeenCalledWith('2');
  });

  it('should highlight selected calendar', () => {
    render(
      <CalendarSidebar
        calendars={mockCalendars}
        selectedCalendarId="2"
        onCalendarSelect={mockOnCalendarSelect}
      />,
    );

    // Selected calendar should be visible
    expect(screen.getByText('Sarah Runner')).toBeInTheDocument();
  });
});
