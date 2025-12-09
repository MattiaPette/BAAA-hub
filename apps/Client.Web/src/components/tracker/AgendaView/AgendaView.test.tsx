import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders as render } from '../../../test-utils';
import { AgendaView } from './AgendaView';
import { WorkoutType } from '../../../types/tracker';

describe('AgendaView', () => {
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
      endMinute: 30,
      type: WorkoutType.RUN,
      calendarId: '1',
    },
    {
      id: '2',
      date: new Date(2025, 11, 10),
      startHour: 18,
      startMinute: 0,
      endHour: 19,
      endMinute: 0,
      type: WorkoutType.GYM,
      calendarId: '1',
    },
    {
      id: '3',
      date: new Date(2025, 11, 15),
      startHour: 7,
      startMinute: 0,
      endHour: 9,
      endMinute: 30,
      type: WorkoutType.LONG_RUN,
      calendarId: '1',
    },
  ];

  it('should render empty state when no workouts', () => {
    render(
      <AgendaView
        currentMonth={currentMonth}
        workouts={[]}
        onDayClick={mockOnDayClick}
        onWorkoutClick={mockOnWorkoutClick}
      />,
    );

    expect(
      screen.getByText(/no workouts scheduled this month/i),
    ).toBeInTheDocument();
  });

  it('should display workouts grouped by date', () => {
    render(
      <AgendaView
        currentMonth={currentMonth}
        workouts={mockWorkouts}
        onDayClick={mockOnDayClick}
        onWorkoutClick={mockOnWorkoutClick}
      />,
    );

    // Should show date headers
    expect(screen.getByText(/december 10, 2025/i)).toBeInTheDocument();
    expect(screen.getByText(/december 15, 2025/i)).toBeInTheDocument();
  });

  it('should show workout count for each day', () => {
    render(
      <AgendaView
        currentMonth={currentMonth}
        workouts={mockWorkouts}
        onDayClick={mockOnDayClick}
        onWorkoutClick={mockOnWorkoutClick}
      />,
    );

    // December 10 has 2 workouts
    expect(screen.getByText(/2 workouts/i)).toBeInTheDocument();
    // December 15 has 1 workout
    expect(screen.getByText(/1 workout/i)).toBeInTheDocument();
  });

  it('should display workout times correctly', () => {
    render(
      <AgendaView
        currentMonth={currentMonth}
        workouts={mockWorkouts}
        onDayClick={mockOnDayClick}
        onWorkoutClick={mockOnWorkoutClick}
      />,
    );

    expect(screen.getByText(/06:00 - 07:30/i)).toBeInTheDocument();
    expect(screen.getByText(/18:00 - 19:00/i)).toBeInTheDocument();
    expect(screen.getByText(/07:00 - 09:30/i)).toBeInTheDocument();
  });

  it('should display workout type labels', () => {
    render(
      <AgendaView
        currentMonth={currentMonth}
        workouts={mockWorkouts}
        onDayClick={mockOnDayClick}
        onWorkoutClick={mockOnWorkoutClick}
      />,
    );

    // Check for specific workout type labels
    expect(screen.getAllByText(/run/i).length).toBeGreaterThanOrEqual(2); // "Run" and "Long Run"
    expect(screen.getByText(/gym/i)).toBeInTheDocument();
    expect(screen.getByText(/long run/i)).toBeInTheDocument();
  });

  it('should call onWorkoutClick when workout is clicked', async () => {
    const user = userEvent.setup();

    render(
      <AgendaView
        currentMonth={currentMonth}
        workouts={mockWorkouts}
        onDayClick={mockOnDayClick}
        onWorkoutClick={mockOnWorkoutClick}
      />,
    );

    // Find and click a workout button
    const workoutButtons = screen.getAllByRole('button');
    const firstWorkoutButton = workoutButtons[0];
    await user.click(firstWorkoutButton);

    expect(mockOnWorkoutClick).toHaveBeenCalledTimes(1);
    expect(mockOnWorkoutClick).toHaveBeenCalledWith(mockWorkouts[0]);
  });

  it('should have proper accessibility labels', () => {
    render(
      <AgendaView
        currentMonth={currentMonth}
        workouts={mockWorkouts}
        onDayClick={mockOnDayClick}
        onWorkoutClick={mockOnWorkoutClick}
      />,
    );

    // Check for ARIA labels on workout buttons
    expect(
      screen.getByLabelText(/run from 06:00 to 07:30/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/gym from 18:00 to 19:00/i),
    ).toBeInTheDocument();
  });

  it('should only show days with workouts', () => {
    render(
      <AgendaView
        currentMonth={currentMonth}
        workouts={mockWorkouts}
        onDayClick={mockOnDayClick}
        onWorkoutClick={mockOnWorkoutClick}
      />,
    );

    // Should only show December 10 and 15, not other days
    expect(screen.queryByText(/december 1,/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/december 5,/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/december 20,/i)).not.toBeInTheDocument();
  });

  it('should handle workouts with different types', () => {
    const differentTypesWorkouts = [
      {
        id: '1',
        date: new Date(2025, 11, 5),
        startHour: 6,
        startMinute: 0,
        endHour: 7,
        endMinute: 0,
        type: WorkoutType.RECOVERY,
        calendarId: '1',
      },
      {
        id: '2',
        date: new Date(2025, 11, 6),
        startHour: 7,
        startMinute: 0,
        endHour: 8,
        endMinute: 0,
        type: WorkoutType.INTERVAL_TRAINING,
        calendarId: '1',
      },
    ];

    render(
      <AgendaView
        currentMonth={currentMonth}
        workouts={differentTypesWorkouts}
        onDayClick={mockOnDayClick}
        onWorkoutClick={mockOnWorkoutClick}
      />,
    );

    expect(screen.getByText(/recovery/i)).toBeInTheDocument();
    expect(screen.getByText(/interval training/i)).toBeInTheDocument();
  });
});
