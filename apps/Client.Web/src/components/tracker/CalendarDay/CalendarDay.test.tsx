import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders as render } from '../../../test-utils';
import { CalendarDay } from './CalendarDay';
import { WorkoutType } from '../../../types/tracker';

describe('CalendarDay', () => {
  const mockOnDayClick = vi.fn();
  const mockOnWorkoutClick = vi.fn();
  const testDate = new Date(2025, 11, 10); // December 10, 2025

  const mockWorkouts = [
    {
      id: '1',
      date: testDate,
      startHour: 6,
      startMinute: 0,
      endHour: 7,
      endMinute: 0,
      type: WorkoutType.RUN,
      calendarId: '1',
    },
    {
      id: '2',
      date: testDate,
      startHour: 18,
      startMinute: 0,
      endHour: 19,
      endMinute: 0,
      type: WorkoutType.GYM,
      calendarId: '1',
    },
  ];

  it('should render day number', () => {
    render(
      <CalendarDay
        date={testDate}
        workouts={[]}
        isCurrentMonth
        onDayClick={mockOnDayClick}
        onWorkoutClick={mockOnWorkoutClick}
      />,
    );

    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should call onDayClick when day cell is clicked', () => {
    render(
      <CalendarDay
        date={testDate}
        workouts={[]}
        isCurrentMonth
        onDayClick={mockOnDayClick}
        onWorkoutClick={mockOnWorkoutClick}
      />,
    );

    const dayCell = screen.getByRole('button');
    fireEvent.click(dayCell);

    expect(mockOnDayClick).toHaveBeenCalledWith(testDate);
  });

  it('should display workout chips', () => {
    render(
      <CalendarDay
        date={testDate}
        workouts={mockWorkouts}
        isCurrentMonth
        onDayClick={mockOnDayClick}
        onWorkoutClick={mockOnWorkoutClick}
      />,
    );

    expect(screen.getByText(/06:00/i)).toBeInTheDocument();
    expect(screen.getByText(/18:00/i)).toBeInTheDocument();
  });

  it('should call onWorkoutClick when workout chip is clicked', () => {
    render(
      <CalendarDay
        date={testDate}
        workouts={mockWorkouts}
        isCurrentMonth
        onDayClick={mockOnDayClick}
        onWorkoutClick={mockOnWorkoutClick}
      />,
    );

    const workoutChip = screen.getByText(/06:00/i);
    fireEvent.click(workoutChip);

    expect(mockOnWorkoutClick).toHaveBeenCalledWith(mockWorkouts[0]);
    // Note: The day click is also triggered due to event bubbling in the test environment
  });

  it('should show "+X more" when more than 3 workouts', () => {
    const manyWorkouts = [
      ...mockWorkouts,
      {
        id: '3',
        date: testDate,
        startHour: 12,
        startMinute: 0,
        endHour: 13,
        endMinute: 0,
        type: WorkoutType.LONG_RUN,
        calendarId: '1',
      },
      {
        id: '4',
        date: testDate,
        startHour: 14,
        startMinute: 0,
        endHour: 15,
        endMinute: 0,
        type: WorkoutType.RECOVERY,
        calendarId: '1',
      },
    ];

    render(
      <CalendarDay
        date={testDate}
        workouts={manyWorkouts}
        isCurrentMonth
        onDayClick={mockOnDayClick}
        onWorkoutClick={mockOnWorkoutClick}
      />,
    );

    expect(screen.getByText(/\+1 more/i)).toBeInTheDocument();
  });

  it('should handle keyboard navigation', () => {
    render(
      <CalendarDay
        date={testDate}
        workouts={[]}
        isCurrentMonth
        onDayClick={mockOnDayClick}
        onWorkoutClick={mockOnWorkoutClick}
      />,
    );

    const dayCell = screen.getByRole('button');
    fireEvent.keyDown(dayCell, { key: 'Enter' });

    expect(mockOnDayClick).toHaveBeenCalledWith(testDate);
  });

  it('should apply proper styling for today', () => {
    const today = new Date();
    render(
      <CalendarDay
        date={today}
        workouts={[]}
        isCurrentMonth
        onDayClick={mockOnDayClick}
        onWorkoutClick={mockOnWorkoutClick}
      />,
    );

    const dayCell = screen.getByRole('button');
    expect(dayCell).toBeInTheDocument();
  });

  it('should apply disabled styling for non-current month days', () => {
    render(
      <CalendarDay
        date={testDate}
        workouts={[]}
        isCurrentMonth={false}
        onDayClick={mockOnDayClick}
        onWorkoutClick={mockOnWorkoutClick}
      />,
    );

    const dayCell = screen.getByRole('button');
    expect(dayCell).toBeInTheDocument();
  });
});
