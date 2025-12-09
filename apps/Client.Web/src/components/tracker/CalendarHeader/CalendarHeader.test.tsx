import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders as render } from '../../../test-utils';
import { CalendarHeader } from './CalendarHeader';

describe('CalendarHeader', () => {
  const mockOnPreviousMonth = vi.fn();
  const mockOnNextMonth = vi.fn();
  const mockOnCalendarSelect = vi.fn();
  const currentMonth = new Date(2025, 11, 1); // December 2025

  const mockCalendars = [
    { id: 'cal-1', name: 'John Athlete', color: '#1976d2', userId: 'user-1' },
    { id: 'cal-2', name: 'Sarah Runner', color: '#d32f2f', userId: 'user-2' },
  ];

  it('should render month and year', () => {
    render(
      <CalendarHeader
        currentMonth={currentMonth}
        onPreviousMonth={mockOnPreviousMonth}
        onNextMonth={mockOnNextMonth}
        calendars={mockCalendars}
        selectedCalendarId="cal-1"
        onCalendarSelect={mockOnCalendarSelect}
      />,
    );

    // Month name should be visible (localized)
    expect(screen.getByText(/december/i)).toBeInTheDocument();
    expect(screen.getByText(/2025/i)).toBeInTheDocument();
  });

  it('should call onPreviousMonth when left arrow is clicked', () => {
    render(
      <CalendarHeader
        currentMonth={currentMonth}
        onPreviousMonth={mockOnPreviousMonth}
        onNextMonth={mockOnNextMonth}
        calendars={mockCalendars}
        selectedCalendarId="cal-1"
        onCalendarSelect={mockOnCalendarSelect}
      />,
    );

    const previousButton = screen.getByLabelText(/previous month/i);
    fireEvent.click(previousButton);

    expect(mockOnPreviousMonth).toHaveBeenCalledTimes(1);
  });

  it('should call onNextMonth when right arrow is clicked', () => {
    render(
      <CalendarHeader
        currentMonth={currentMonth}
        onPreviousMonth={mockOnPreviousMonth}
        onNextMonth={mockOnNextMonth}
        calendars={mockCalendars}
        selectedCalendarId="cal-1"
        onCalendarSelect={mockOnCalendarSelect}
      />,
    );

    const nextButton = screen.getByLabelText(/next month/i);
    fireEvent.click(nextButton);

    expect(mockOnNextMonth).toHaveBeenCalledTimes(1);
  });

  it('should have proper navigation icons', () => {
    render(
      <CalendarHeader
        currentMonth={currentMonth}
        onPreviousMonth={mockOnPreviousMonth}
        onNextMonth={mockOnNextMonth}
        calendars={mockCalendars}
        selectedCalendarId="cal-1"
        onCalendarSelect={mockOnCalendarSelect}
      />,
    );

    expect(screen.getByLabelText(/previous month/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/next month/i)).toBeInTheDocument();
  });

  it('should render calendar selector with correct calendars', () => {
    render(
      <CalendarHeader
        currentMonth={currentMonth}
        onPreviousMonth={mockOnPreviousMonth}
        onNextMonth={mockOnNextMonth}
        calendars={mockCalendars}
        selectedCalendarId="cal-1"
        onCalendarSelect={mockOnCalendarSelect}
      />,
    );

    // Calendar selector should be present
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should display the selected calendar', () => {
    render(
      <CalendarHeader
        currentMonth={currentMonth}
        onPreviousMonth={mockOnPreviousMonth}
        onNextMonth={mockOnNextMonth}
        calendars={mockCalendars}
        selectedCalendarId="cal-1"
        onCalendarSelect={mockOnCalendarSelect}
      />,
    );

    expect(screen.getByText('John Athlete')).toBeInTheDocument();
  });
});
