import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders as render } from '../../../test-utils';
import { RunWorkoutForm } from './RunWorkoutForm';
import { HeartRateZone } from '../../../types/tracker';

describe('RunWorkoutForm', () => {
  const mockOnChange = vi.fn();

  it('should render all form fields', () => {
    render(<RunWorkoutForm value={undefined} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/distance goal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pace goal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/heart rate zone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });

  it('should call onChange when distance goal is updated', () => {
    render(<RunWorkoutForm value={undefined} onChange={mockOnChange} />);

    const distanceInput = screen.getByLabelText(/distance goal/i);
    fireEvent.change(distanceInput, { target: { value: '10' } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        distanceGoal: 10,
      }),
    );
  });

  it('should call onChange when pace goal is updated', () => {
    render(<RunWorkoutForm value={undefined} onChange={mockOnChange} />);

    const paceInput = screen.getByLabelText(/pace goal/i);
    fireEvent.change(paceInput, { target: { value: '5.5' } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        paceGoal: 5.5,
      }),
    );
  });

  it('should call onChange when notes are updated', () => {
    render(<RunWorkoutForm value={undefined} onChange={mockOnChange} />);

    const notesInput = screen.getByLabelText(/notes/i);
    fireEvent.change(notesInput, { target: { value: 'Test notes' } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        notes: 'Test notes',
      }),
    );
  });

  it('should show custom heart rate fields when CUSTOM zone is selected', () => {
    render(<RunWorkoutForm value={undefined} onChange={mockOnChange} />);

    // Initially, custom fields should not be visible
    expect(screen.queryByLabelText(/min bpm/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/max bpm/i)).not.toBeInTheDocument();

    // Select custom zone
    const zoneSelect = screen.getByLabelText(/heart rate zone/i);
    fireEvent.mouseDown(zoneSelect);

    const customOption = screen.getByText(/custom range/i);
    fireEvent.click(customOption);

    // Now custom fields should be visible
    expect(screen.getByLabelText(/min bpm/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/max bpm/i)).toBeInTheDocument();
  });

  it('should pre-populate form with existing values', () => {
    const existingValue = {
      distanceGoal: 5,
      paceGoal: 6.0,
      heartRateZone: HeartRateZone.Z3,
      notes: 'Morning run',
    };

    render(<RunWorkoutForm value={existingValue} onChange={mockOnChange} />);

    const distanceInput = screen.getByLabelText(
      /distance goal/i,
    ) as HTMLInputElement;
    const paceInput = screen.getByLabelText(/pace goal/i) as HTMLInputElement;
    const notesInput = screen.getByLabelText(/notes/i) as HTMLInputElement;

    expect(distanceInput.value).toBe('5');
    expect(paceInput.value).toBe('6');
    expect(notesInput.value).toBe('Morning run');
  });

  it('should clear custom heart rate values when switching from CUSTOM to another zone', () => {
    const mockOnChangeLocal = vi.fn();
    const existingValue = {
      heartRateZone: HeartRateZone.CUSTOM,
      customHeartRateMin: 120,
      customHeartRateMax: 160,
    };

    render(
      <RunWorkoutForm value={existingValue} onChange={mockOnChangeLocal} />,
    );

    // Select a different zone
    const zoneSelect = screen.getByLabelText(/heart rate zone/i);
    fireEvent.mouseDown(zoneSelect);

    const z2Option = screen.getByText(/zone 2/i);
    fireEvent.click(z2Option);

    // onChange should be called with custom values cleared
    expect(mockOnChangeLocal).toHaveBeenCalledWith(
      expect.objectContaining({
        heartRateZone: HeartRateZone.Z2,
        customHeartRateMin: undefined,
        customHeartRateMax: undefined,
      }),
    );
  });
});
