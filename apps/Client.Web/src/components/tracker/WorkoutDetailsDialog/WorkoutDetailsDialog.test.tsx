import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders as render } from '../../../test-utils';
import { WorkoutDetailsDialog } from './WorkoutDetailsDialog';
import { WorkoutType } from '../../../types/tracker';

describe('WorkoutDetailsDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  const mockWorkout = {
    id: '1',
    date: new Date(2025, 11, 10),
    startHour: 6,
    startMinute: 30,
    endHour: 7,
    endMinute: 45,
    type: WorkoutType.RUN,
    calendarId: '1',
  };

  it('should render dialog when open with workout', () => {
    render(
      <WorkoutDetailsDialog
        open
        onClose={mockOnClose}
        workout={mockWorkout}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/workout details/i)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <WorkoutDetailsDialog
        open={false}
        onClose={mockOnClose}
        workout={mockWorkout}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should not render when workout is null', () => {
    render(
      <WorkoutDetailsDialog
        open
        onClose={mockOnClose}
        workout={null}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should display workout date', () => {
    render(
      <WorkoutDetailsDialog
        open
        onClose={mockOnClose}
        workout={mockWorkout}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText(/date/i)).toBeInTheDocument();
    expect(screen.getByText(/december/i)).toBeInTheDocument();
  });

  it('should display workout type', () => {
    render(
      <WorkoutDetailsDialog
        open
        onClose={mockOnClose}
        workout={mockWorkout}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText(/workout type/i)).toBeInTheDocument();
    expect(screen.getByText(/run/i)).toBeInTheDocument();
  });

  it('should display workout time range', () => {
    render(
      <WorkoutDetailsDialog
        open
        onClose={mockOnClose}
        workout={mockWorkout}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText(/time/i)).toBeInTheDocument();
    expect(screen.getByText(/06:30 - 07:45/i)).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    render(
      <WorkoutDetailsDialog
        open
        onClose={mockOnClose}
        workout={mockWorkout}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockWorkout);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <WorkoutDetailsDialog
        open
        onClose={mockOnClose}
        workout={mockWorkout}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockWorkout.id);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onClose when close icon is clicked', () => {
    render(
      <WorkoutDetailsDialog
        open
        onClose={mockOnClose}
        workout={mockWorkout}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    const closeButton = screen.getByLabelText(/close/i);
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display different workout types correctly', () => {
    const gymWorkout = { ...mockWorkout, type: WorkoutType.GYM };

    render(
      <WorkoutDetailsDialog
        open
        onClose={mockOnClose}
        workout={gymWorkout}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText(/gym/i)).toBeInTheDocument();
  });
});
