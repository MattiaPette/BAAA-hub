import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../test-utils';
import { IntervalTrainingForm } from './IntervalTrainingForm';
import { IntensityLevel } from '../../../types/tracker';

describe('IntervalTrainingForm', () => {
  const mockOnChange = vi.fn();

  const defaultProps = {
    value: undefined,
    onChange: mockOnChange,
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render the form with all fields', () => {
    render(<IntervalTrainingForm {...defaultProps} />);

    expect(screen.getByLabelText(/number of rounds/i)).toBeInTheDocument();
    expect(screen.getByText(/interval structure/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /add work interval/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /add rest interval/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/intensity level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });

  it('should display default values when no value is provided', () => {
    render(<IntervalTrainingForm {...defaultProps} />);

    const roundsInput = screen.getByLabelText(/number of rounds/i);
    expect(roundsInput).toHaveValue(1);
  });

  it('should display provided values', () => {
    const value = {
      intervals: [
        {
          id: '1',
          type: 'work' as const,
          durationMinutes: 5,
          durationSeconds: 30,
          distance: 1.5,
          targetPace: '05:30',
        },
      ],
      rounds: 3,
      intensity: IntensityLevel.HIGH,
      notes: 'Test notes',
    };

    render(<IntervalTrainingForm value={value} onChange={mockOnChange} />);

    const roundsInput = screen.getByLabelText(/number of rounds/i);
    expect(roundsInput).toHaveValue(3);

    // Check that interval values are displayed
    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('30')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1.5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('05:30')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test notes')).toBeInTheDocument();

    // Check that the table is rendered with the interval
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should call onChange when rounds are updated', () => {
    render(<IntervalTrainingForm {...defaultProps} />);

    const roundsInput = screen.getByLabelText(/number of rounds/i);
    fireEvent.change(roundsInput, { target: { value: '5' } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        rounds: 5,
      }),
    );
  });

  it('should add a work interval when Add Work Interval button is clicked', () => {
    render(<IntervalTrainingForm {...defaultProps} />);

    const addWorkButton = screen.getByRole('button', {
      name: /add work interval/i,
    });
    fireEvent.click(addWorkButton);

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        intervals: expect.arrayContaining([
          expect.objectContaining({
            type: 'work',
            durationMinutes: 5,
            durationSeconds: 0,
          }),
        ]),
      }),
    );
  });

  it('should add a rest interval when Add Rest Interval button is clicked', () => {
    render(<IntervalTrainingForm {...defaultProps} />);

    const addRestButton = screen.getByRole('button', {
      name: /add rest interval/i,
    });
    fireEvent.click(addRestButton);

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        intervals: expect.arrayContaining([
          expect.objectContaining({
            type: 'rest',
            durationMinutes: 1,
            durationSeconds: 0,
          }),
        ]),
      }),
    );
  });

  it('should display message when no intervals are added', () => {
    render(<IntervalTrainingForm {...defaultProps} />);

    expect(screen.getByText(/no intervals added yet/i)).toBeInTheDocument();
  });

  it('should display interval table when intervals exist', () => {
    const value = {
      intervals: [
        {
          id: '1',
          type: 'work' as const,
          durationMinutes: 5,
          durationSeconds: 0,
        },
      ],
      rounds: 1,
      intensity: IntensityLevel.MODERATE,
    };

    render(<IntervalTrainingForm value={value} onChange={mockOnChange} />);

    expect(screen.getByText(/type/i)).toBeInTheDocument();
    expect(screen.getByText(/duration \(min\)/i)).toBeInTheDocument();
    expect(screen.getByText(/duration \(sec\)/i)).toBeInTheDocument();
    expect(screen.getByText(/distance \(km\)/i)).toBeInTheDocument();
    expect(screen.getByText(/target pace/i)).toBeInTheDocument();
    expect(screen.getByText(/actions/i)).toBeInTheDocument();
  });

  it('should call onChange when intensity is updated', () => {
    render(<IntervalTrainingForm {...defaultProps} />);

    const intensitySelect = screen.getByLabelText(/intensity level/i);
    fireEvent.mouseDown(intensitySelect);

    const highOption = screen.getByRole('option', { name: 'High' });
    fireEvent.click(highOption);

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        intensity: IntensityLevel.HIGH,
      }),
    );
  });

  it('should call onChange when notes are updated', () => {
    render(<IntervalTrainingForm {...defaultProps} />);

    const notesInput = screen.getByLabelText(/notes/i);
    fireEvent.change(notesInput, { target: { value: 'New notes' } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        notes: 'New notes',
      }),
    );
  });
});
