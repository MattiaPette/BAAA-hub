import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LongRunWorkoutForm } from './LongRunWorkoutForm';
import { LongRunWorkoutDetails } from '../../../types/tracker';

describe('LongRunWorkoutForm', () => {
  it('should render all form fields', () => {
    const mockOnChange = vi.fn();

    render(<LongRunWorkoutForm value={undefined} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/^Distance Goal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Pace\/Tempo Goal/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Hydration\/Refueling Notes/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Average Heart Rate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Peak Heart Rate/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Additional notes about your long run/i),
    ).toBeInTheDocument();
  });

  it('should call onChange when distance goal is changed', () => {
    const mockOnChange = vi.fn();

    render(<LongRunWorkoutForm value={undefined} onChange={mockOnChange} />);

    const distanceInput = screen.getByLabelText(/^Distance Goal/i);
    fireEvent.change(distanceInput, { target: { value: '21.1' } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        distanceGoal: 21.1,
      }),
    );
  });

  it('should call onChange when pace goal is changed', () => {
    const mockOnChange = vi.fn();

    render(<LongRunWorkoutForm value={undefined} onChange={mockOnChange} />);

    const paceInput = screen.getByLabelText(/Pace\/Tempo Goal/i);
    fireEvent.change(paceInput, { target: { value: '5.5' } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        paceGoal: 5.5,
      }),
    );
  });

  it('should call onChange when hydration notes are changed', () => {
    const mockOnChange = vi.fn();

    render(<LongRunWorkoutForm value={undefined} onChange={mockOnChange} />);

    const hydrationInput = screen.getByLabelText(/Hydration\/Refueling Notes/i);
    fireEvent.change(hydrationInput, { target: { value: 'Water every 5km' } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        hydrationNotes: 'Water every 5km',
      }),
    );
  });

  it('should call onChange when heart rates are changed', () => {
    const mockOnChange = vi.fn();

    render(<LongRunWorkoutForm value={undefined} onChange={mockOnChange} />);

    const avgHeartRateInput = screen.getByLabelText(/Average Heart Rate/i);
    fireEvent.change(avgHeartRateInput, { target: { value: '150' } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        averageHeartRate: 150,
      }),
    );

    const peakHeartRateInput = screen.getByLabelText(/Peak Heart Rate/i);
    fireEvent.change(peakHeartRateInput, { target: { value: '180' } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        peakHeartRate: 180,
      }),
    );
  });

  it('should populate form with existing values', () => {
    const mockOnChange = vi.fn();
    const existingDetails: LongRunWorkoutDetails = {
      distanceGoal: 21.1,
      paceGoal: 5.5,
      hydrationNotes: 'Water every 5km',
      averageHeartRate: 150,
      peakHeartRate: 180,
      notes: 'Great run!',
    };

    render(
      <LongRunWorkoutForm value={existingDetails} onChange={mockOnChange} />,
    );

    expect(screen.getByLabelText(/^Distance Goal/i)).toHaveValue(21.1);
    expect(screen.getByLabelText(/Pace\/Tempo Goal/i)).toHaveValue(5.5);
    expect(screen.getByLabelText(/Hydration\/Refueling Notes/i)).toHaveValue(
      'Water every 5km',
    );
    expect(screen.getByLabelText(/Average Heart Rate/i)).toHaveValue(150);
    expect(screen.getByLabelText(/Peak Heart Rate/i)).toHaveValue(180);
    expect(
      screen.getByPlaceholderText(/Additional notes about your long run/i),
    ).toHaveValue('Great run!');
  });
});
