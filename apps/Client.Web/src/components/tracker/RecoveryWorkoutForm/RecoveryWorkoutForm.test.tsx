import { screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders as render } from '../../../test-utils';
import { RecoveryWorkoutForm } from './RecoveryWorkoutForm';
import {
  RecoveryActivityType,
  IntensityLevel,
  RecoveryFocusArea,
} from '../../../types/tracker';

describe('RecoveryWorkoutForm', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all form fields', () => {
    render(<RecoveryWorkoutForm value={undefined} onChange={mockOnChange} />);

    expect(
      screen.getByLabelText(/Recovery Activity Type/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Intensity Level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Focus Areas/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Heart Rate \(bpm\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Notes/i)).toBeInTheDocument();
  });

  it('should initialize with default values when value is undefined', () => {
    render(<RecoveryWorkoutForm value={undefined} onChange={mockOnChange} />);

    // Activity type should default to STRETCHING
    const activityTypeSelect = screen.getByLabelText(/Recovery Activity Type/i);
    expect(activityTypeSelect).toHaveTextContent('Stretching');

    // Intensity should default to LOW
    const intensitySelect = screen.getByLabelText(/Intensity Level/i);
    expect(intensitySelect).toHaveTextContent('Low');
  });

  it('should populate form with existing values', () => {
    const existingValue = {
      activityType: RecoveryActivityType.YOGA,
      intensity: IntensityLevel.MODERATE,
      focusAreas: [RecoveryFocusArea.FULL_BODY],
      heartRate: 65,
      notes: 'Test recovery notes',
    };

    render(
      <RecoveryWorkoutForm value={existingValue} onChange={mockOnChange} />,
    );

    // Check activity type
    const activityTypeSelect = screen.getByLabelText(/Recovery Activity Type/i);
    expect(activityTypeSelect).toHaveTextContent('Yoga');

    // Check intensity
    const intensitySelect = screen.getByLabelText(/Intensity Level/i);
    expect(intensitySelect).toHaveTextContent('Moderate');

    // Check heart rate
    const heartRateInput = screen.getByLabelText(/Heart Rate \(bpm\)/i);
    expect(heartRateInput).toHaveValue(65);

    // Check notes
    const notesInput = screen.getByLabelText(/Notes/i);
    expect(notesInput).toHaveValue('Test recovery notes');
  });

  it('should call onChange when activity type changes', () => {
    render(<RecoveryWorkoutForm value={undefined} onChange={mockOnChange} />);

    const activityTypeSelect = screen.getByLabelText(/Recovery Activity Type/i);
    fireEvent.mouseDown(activityTypeSelect);

    const listbox = within(screen.getByRole('listbox'));
    fireEvent.click(listbox.getByText('Foam Rolling'));

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        activityType: RecoveryActivityType.FOAM_ROLLING,
      }),
    );
  });

  it('should call onChange when intensity changes', () => {
    render(<RecoveryWorkoutForm value={undefined} onChange={mockOnChange} />);

    const intensitySelect = screen.getByLabelText(/Intensity Level/i);
    fireEvent.mouseDown(intensitySelect);

    const listbox = within(screen.getByRole('listbox'));
    fireEvent.click(listbox.getByText('High'));

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        intensity: IntensityLevel.HIGH,
      }),
    );
  });

  it('should call onChange when heart rate changes', () => {
    render(<RecoveryWorkoutForm value={undefined} onChange={mockOnChange} />);

    const heartRateInput = screen.getByLabelText(/Heart Rate \(bpm\)/i);
    fireEvent.change(heartRateInput, { target: { value: '75' } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        heartRate: 75,
      }),
    );
  });

  it('should call onChange when notes change', () => {
    render(<RecoveryWorkoutForm value={undefined} onChange={mockOnChange} />);

    const notesInput = screen.getByLabelText(/Notes/i);
    fireEvent.change(notesInput, {
      target: { value: 'New recovery session notes' },
    });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        notes: 'New recovery session notes',
      }),
    );
  });

  it('should handle empty heart rate value', () => {
    const existingValue = {
      activityType: RecoveryActivityType.STRETCHING,
      intensity: IntensityLevel.LOW,
      focusAreas: [],
      heartRate: 70,
    };

    render(
      <RecoveryWorkoutForm value={existingValue} onChange={mockOnChange} />,
    );

    const heartRateInput = screen.getByLabelText(/Heart Rate \(bpm\)/i);
    fireEvent.change(heartRateInput, { target: { value: '' } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        heartRate: undefined,
      }),
    );
  });
});
