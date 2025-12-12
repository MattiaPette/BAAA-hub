import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders as render } from '../../../test-utils';
import { SwimmingWorkoutForm } from './SwimmingWorkoutForm';
import { SwimType, IntensityLevel } from '../../../types/tracker';

describe('SwimmingWorkoutForm', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all form fields', () => {
    render(<SwimmingWorkoutForm onChange={mockOnChange} />);

    expect(screen.getByLabelText(/distance goal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/lap count/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time per lap/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/type of swim/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/intensity level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/heart rate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });

  it('should render with default values when no value is provided', () => {
    render(<SwimmingWorkoutForm onChange={mockOnChange} />);

    const distanceInput = screen.getByLabelText(
      /distance goal/i,
    ) as HTMLInputElement;
    const lapCountInput = screen.getByLabelText(
      /lap count/i,
    ) as HTMLInputElement;
    const timePerLapInput = screen.getByLabelText(
      /time per lap/i,
    ) as HTMLInputElement;

    expect(distanceInput.value).toBe('1000');
    expect(lapCountInput.value).toBe('20');
    expect(timePerLapInput.value).toBe('60');
  });

  it('should render with provided values', () => {
    const mockValue = {
      distanceGoal: 2000,
      lapCount: 40,
      timePerLap: 45,
      swimType: SwimType.BACKSTROKE,
      intensity: IntensityLevel.HIGH,
      heartRate: 150,
      notes: 'Test notes',
    };

    render(<SwimmingWorkoutForm value={mockValue} onChange={mockOnChange} />);

    const distanceInput = screen.getByLabelText(
      /distance goal/i,
    ) as HTMLInputElement;
    const lapCountInput = screen.getByLabelText(
      /lap count/i,
    ) as HTMLInputElement;
    const timePerLapInput = screen.getByLabelText(
      /time per lap/i,
    ) as HTMLInputElement;
    const heartRateInput = screen.getByLabelText(
      /heart rate/i,
    ) as HTMLInputElement;
    const notesInput = screen.getByLabelText(/notes/i) as HTMLInputElement;

    expect(distanceInput.value).toBe('2000');
    expect(lapCountInput.value).toBe('40');
    expect(timePerLapInput.value).toBe('45');
    expect(heartRateInput.value).toBe('150');
    expect(notesInput.value).toBe('Test notes');
  });

  it('should call onChange when distance goal is updated', () => {
    render(<SwimmingWorkoutForm onChange={mockOnChange} />);

    const distanceInput = screen.getByLabelText(/distance goal/i);
    fireEvent.change(distanceInput, { target: { value: '1500' } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        distanceGoal: 1500,
      }),
    );
  });

  it('should call onChange when lap count is updated', () => {
    render(<SwimmingWorkoutForm onChange={mockOnChange} />);

    const lapCountInput = screen.getByLabelText(/lap count/i);
    fireEvent.change(lapCountInput, { target: { value: '30' } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        lapCount: 30,
      }),
    );
  });

  it('should call onChange when time per lap is updated', () => {
    render(<SwimmingWorkoutForm onChange={mockOnChange} />);

    const timePerLapInput = screen.getByLabelText(/time per lap/i);
    fireEvent.change(timePerLapInput, { target: { value: '50' } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        timePerLap: 50,
      }),
    );
  });

  it('should call onChange when heart rate is updated', () => {
    render(<SwimmingWorkoutForm onChange={mockOnChange} />);

    const heartRateInput = screen.getByLabelText(/heart rate/i);
    fireEvent.change(heartRateInput, { target: { value: '140' } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        heartRate: 140,
      }),
    );
  });

  it('should call onChange when notes are updated', () => {
    render(<SwimmingWorkoutForm onChange={mockOnChange} />);

    const notesInput = screen.getByLabelText(/notes/i);
    fireEvent.change(notesInput, {
      target: { value: 'Good swimming session' },
    });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        notes: 'Good swimming session',
      }),
    );
  });
});
