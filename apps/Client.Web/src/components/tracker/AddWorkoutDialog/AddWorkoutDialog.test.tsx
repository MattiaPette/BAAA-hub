import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders as render } from '../../../test-utils';
import { AddWorkoutDialog } from './AddWorkoutDialog';
import { WorkoutType } from '../../../types/tracker';

describe('AddWorkoutDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();
  const selectedDate = new Date(2025, 11, 10);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog when open', () => {
    render(
      <AddWorkoutDialog
        open
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        selectedDate={selectedDate}
        existingWorkouts={[]}
      />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <AddWorkoutDialog
        open={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        selectedDate={selectedDate}
        existingWorkouts={[]}
      />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should show "Edit Workout" title when editing', () => {
    const editingWorkout = {
      id: '1',
      date: selectedDate,
      startHour: 6,
      startMinute: 0,
      endHour: 7,
      endMinute: 0,
      type: WorkoutType.RUN,
      calendarId: '1',
    };

    render(
      <AddWorkoutDialog
        open
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        selectedDate={selectedDate}
        editingWorkout={editingWorkout}
        existingWorkouts={[]}
      />,
    );

    expect(screen.getByText(/edit workout/i)).toBeInTheDocument();
  });

  it('should render workout type selector', () => {
    render(
      <AddWorkoutDialog
        open
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        selectedDate={selectedDate}
        existingWorkouts={[]}
      />,
    );

    expect(screen.getByLabelText(/workout type/i)).toBeInTheDocument();
  });

  it('should render time input fields', () => {
    render(
      <AddWorkoutDialog
        open
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        selectedDate={selectedDate}
        existingWorkouts={[]}
      />,
    );

    expect(screen.getByLabelText(/start hour/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start minute/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end hour/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end minute/i)).toBeInTheDocument();
  });

  it('should call onSubmit with correct data when form is submitted', async () => {
    render(
      <AddWorkoutDialog
        open
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        selectedDate={selectedDate}
        existingWorkouts={[]}
      />,
    );

    const submitButton = screen.getByRole('button', { name: /add workout/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('should call onClose when cancel button is clicked', () => {
    render(
      <AddWorkoutDialog
        open
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        selectedDate={selectedDate}
        existingWorkouts={[]}
      />,
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show validation error for invalid time range', async () => {
    render(
      <AddWorkoutDialog
        open
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        selectedDate={selectedDate}
        existingWorkouts={[]}
      />,
    );

    // Set end time before start time
    const startHourInput = screen.getByLabelText(/start hour/i);
    const endHourInput = screen.getByLabelText(/end hour/i);

    fireEvent.change(startHourInput, { target: { value: '10' } });
    fireEvent.change(endHourInput, { target: { value: '8' } });

    const submitButton = screen.getByRole('button', { name: /add workout/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/end time must be after start time/i),
      ).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should show validation error for overlapping workouts', async () => {
    const existingWorkouts = [
      {
        id: '1',
        date: selectedDate,
        startHour: 6,
        startMinute: 0,
        endHour: 7,
        endMinute: 0,
        type: WorkoutType.RUN,
        calendarId: '1',
      },
    ];

    render(
      <AddWorkoutDialog
        open
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        selectedDate={selectedDate}
        existingWorkouts={existingWorkouts}
      />,
    );

    // Try to add workout at same time
    const startHourInput = screen.getByLabelText(/start hour/i);
    fireEvent.change(startHourInput, { target: { value: '6' } });

    const submitButton = screen.getByRole('button', { name: /add workout/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/overlaps/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should pre-fill form when editing workout', () => {
    const editingWorkout = {
      id: '1',
      date: selectedDate,
      startHour: 10,
      startMinute: 30,
      endHour: 11,
      endMinute: 45,
      type: WorkoutType.GYM,
      calendarId: '1',
    };

    render(
      <AddWorkoutDialog
        open
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        selectedDate={selectedDate}
        editingWorkout={editingWorkout}
        existingWorkouts={[editingWorkout]}
      />,
    );

    const startHourInput = screen.getByLabelText(
      /start hour/i,
    ) as HTMLInputElement;
    const startMinuteInput = screen.getByLabelText(
      /start minute/i,
    ) as HTMLInputElement;

    expect(startHourInput.value).toBe('10');
    expect(startMinuteInput.value).toBe('30');
  });

  it('should show RunWorkoutForm when RUN workout type is selected', async () => {
    render(
      <AddWorkoutDialog
        open
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        selectedDate={selectedDate}
        existingWorkouts={[]}
      />,
    );

    // RUN is the default type
    await waitFor(() => {
      expect(screen.getByText(/run details/i)).toBeInTheDocument();
    });
  });

  it('should hide RunWorkoutForm when changing from RUN to another workout type', async () => {
    render(
      <AddWorkoutDialog
        open
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        selectedDate={selectedDate}
        existingWorkouts={[]}
      />,
    );

    // Initially, RUN form should be visible
    await waitFor(() => {
      expect(screen.getByText(/run details/i)).toBeInTheDocument();
    });

    // Change to GYM type
    const workoutTypeSelect = screen.getByLabelText(/workout type/i);
    fireEvent.mouseDown(workoutTypeSelect);

    const gymOption = screen.getByRole('option', { name: /gym/i });
    fireEvent.click(gymOption);

    // RUN form should be hidden now
    await waitFor(() => {
      expect(screen.queryByText(/run details/i)).not.toBeInTheDocument();
    });
  });

  it('should submit run workout with runDetails', async () => {
    render(
      <AddWorkoutDialog
        open
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        selectedDate={selectedDate}
        existingWorkouts={[]}
      />,
    );

    // Fill in distance goal
    const distanceInput = screen.getByLabelText(/distance goal/i);
    fireEvent.change(distanceInput, { target: { value: '10' } });

    const submitButton = screen.getByRole('button', { name: /add workout/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: WorkoutType.RUN,
          runDetails: expect.objectContaining({
            distanceGoal: 10,
          }),
        }),
      );
    });
  });
});
