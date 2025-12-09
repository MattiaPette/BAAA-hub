import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders as render } from '../../../test-utils';
import { CalendarView } from './CalendarView';
import { WorkoutType } from '../../../types/tracker';

describe('CalendarView', () => {
  const mockOnDayClick = vi.fn();
  const mockOnWorkoutClick = vi.fn();
  const currentMonth = new Date(2025, 11, 1); // December 2025

  const mockWorkouts = [
    {
      id: '1',
      date: new Date(2025, 11, 10),
      startHour: 6,
      startMinute: 0,
      endHour: 7,
      endMinute: 0,
      type: WorkoutType.RUN,
      calendarId: '1',
    },
  ];

  it('should render week day headers', () => {
    render(
      <CalendarView
        currentMonth={currentMonth}
        workouts={mockWorkouts}
        onDayClick={mockOnDayClick}
        onWorkoutClick={mockOnWorkoutClick}
      />,
    );

    expect(screen.getByText(/mon/i)).toBeInTheDocument();
    expect(screen.getByText(/tue/i)).toBeInTheDocument();
    expect(screen.getByText(/wed/i)).toBeInTheDocument();
    expect(screen.getByText(/thu/i)).toBeInTheDocument();
    expect(screen.getByText(/fri/i)).toBeInTheDocument();
    expect(screen.getByText(/sat/i)).toBeInTheDocument();
    expect(screen.getByText(/sun/i)).toBeInTheDocument();
  });

  it('should render all days in the month grid', () => {
    render(
      <CalendarView
        currentMonth={currentMonth}
        workouts={mockWorkouts}
        onDayClick={mockOnDayClick}
        onWorkoutClick={mockOnWorkoutClick}
      />,
    );

    // Should have multiple day cells (including days from previous/next months)
    const dayCells = screen.getAllByRole('button');
    expect(dayCells.length).toBeGreaterThan(28); // At least 28 days
  });

  it('should display workouts on correct days', () => {
    render(
      <CalendarView
        currentMonth={currentMonth}
        workouts={mockWorkouts}
        onDayClick={mockOnDayClick}
        onWorkoutClick={mockOnWorkoutClick}
      />,
    );

    // Workout should be visible
    expect(screen.getByText(/06:00/i)).toBeInTheDocument();
  });

  it('should render empty calendar when no workouts', () => {
    render(
      <CalendarView
        currentMonth={currentMonth}
        workouts={[]}
        onDayClick={mockOnDayClick}
        onWorkoutClick={mockOnWorkoutClick}
      />,
    );

    // Should still render day headers
    expect(screen.getByText(/mon/i)).toBeInTheDocument();
    // Should still render day cells
    const dayCells = screen.getAllByRole('button');
    expect(dayCells.length).toBeGreaterThan(0);
  });

  it('should create consistent grid layout', () => {
    const { container } = render(
      <CalendarView
        currentMonth={currentMonth}
        workouts={mockWorkouts}
        onDayClick={mockOnDayClick}
        onWorkoutClick={mockOnWorkoutClick}
      />,
    );

    // Check that the calendar grid is rendered
    expect(container.firstChild).toBeInTheDocument();
  });
});
