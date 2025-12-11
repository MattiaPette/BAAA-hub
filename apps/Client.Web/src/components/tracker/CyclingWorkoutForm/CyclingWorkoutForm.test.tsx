import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CyclingWorkoutForm } from './CyclingWorkoutForm';
import { CyclingWorkoutDetails } from '../../../types/tracker';

describe('CyclingWorkoutForm', () => {
  it('renders all cycling input fields', () => {
    const mockOnChange = vi.fn();

    render(<CyclingWorkoutForm value={undefined} onChange={mockOnChange} />);

    // Check that all required fields are rendered
    expect(
      screen.getByLabelText(/distance.*km/i, { exact: false }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/average speed.*km\/h/i, { exact: false }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/elevation gain.*m/i, { exact: false }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/average heart rate.*bpm/i, { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });

  it('displays pre-filled values when provided', () => {
    const mockOnChange = vi.fn();
    const mockValue: CyclingWorkoutDetails = {
      distance: 25.5,
      averageSpeed: 28.5,
      elevationGain: 450,
      averageHeartRate: 145,
      notes: 'Great ride!',
    };

    render(<CyclingWorkoutForm value={mockValue} onChange={mockOnChange} />);

    // Check that fields are populated with values
    expect(
      screen.getByLabelText(/distance.*km/i, { exact: false }),
    ).toHaveValue(25.5);
    expect(
      screen.getByLabelText(/average speed.*km\/h/i, { exact: false }),
    ).toHaveValue(28.5);
    expect(
      screen.getByLabelText(/elevation gain.*m/i, { exact: false }),
    ).toHaveValue(450);
    expect(
      screen.getByLabelText(/average heart rate.*bpm/i, { exact: false }),
    ).toHaveValue(145);
    expect(screen.getByLabelText(/notes/i)).toHaveValue('Great ride!');
  });

  it('calls onChange when distance is updated', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(<CyclingWorkoutForm value={undefined} onChange={mockOnChange} />);

    const distanceInput = screen.getByLabelText(/distance.*km/i, {
      exact: false,
    });
    await user.clear(distanceInput);
    await user.type(distanceInput, '30');

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('calls onChange when notes are updated', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(<CyclingWorkoutForm value={undefined} onChange={mockOnChange} />);

    const notesInput = screen.getByLabelText(/notes/i);
    await user.type(notesInput, 'Test note');

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('handles undefined values correctly', () => {
    const mockOnChange = vi.fn();

    render(<CyclingWorkoutForm value={undefined} onChange={mockOnChange} />);

    // All fields should be empty when value is undefined
    expect(
      screen.getByLabelText(/distance.*km/i, { exact: false }),
    ).toHaveValue(null);
    expect(
      screen.getByLabelText(/average speed.*km\/h/i, { exact: false }),
    ).toHaveValue(null);
    expect(
      screen.getByLabelText(/elevation gain.*m/i, { exact: false }),
    ).toHaveValue(null);
    expect(
      screen.getByLabelText(/average heart rate.*bpm/i, { exact: false }),
    ).toHaveValue(null);
    expect(screen.getByLabelText(/notes/i)).toHaveValue('');
  });
});
