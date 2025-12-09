import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders as render } from '../../../test-utils';
import { CalendarHeader } from './CalendarHeader';

describe('CalendarHeader', () => {
  const mockOnPreviousMonth = vi.fn();
  const mockOnNextMonth = vi.fn();
  const currentMonth = new Date(2025, 11, 1); // December 2025

  it('should render month and year', () => {
    render(
      <CalendarHeader
        currentMonth={currentMonth}
        onPreviousMonth={mockOnPreviousMonth}
        onNextMonth={mockOnNextMonth}
      />,
    );

    // Month name should be visible (localized)
    expect(screen.getByText(/december/i)).toBeInTheDocument();
    expect(screen.getByText(/2025/i)).toBeInTheDocument();
  });

  it('should call onPreviousMonth when left arrow is clicked', () => {
    render(
      <CalendarHeader
        currentMonth={currentMonth}
        onPreviousMonth={mockOnPreviousMonth}
        onNextMonth={mockOnNextMonth}
      />,
    );

    const previousButton = screen.getByLabelText(/previous month/i);
    fireEvent.click(previousButton);

    expect(mockOnPreviousMonth).toHaveBeenCalledTimes(1);
  });

  it('should call onNextMonth when right arrow is clicked', () => {
    render(
      <CalendarHeader
        currentMonth={currentMonth}
        onPreviousMonth={mockOnPreviousMonth}
        onNextMonth={mockOnNextMonth}
      />,
    );

    const nextButton = screen.getByLabelText(/next month/i);
    fireEvent.click(nextButton);

    expect(mockOnNextMonth).toHaveBeenCalledTimes(1);
  });

  it('should have proper navigation icons', () => {
    render(
      <CalendarHeader
        currentMonth={currentMonth}
        onPreviousMonth={mockOnPreviousMonth}
        onNextMonth={mockOnNextMonth}
      />,
    );

    expect(screen.getByLabelText(/previous month/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/next month/i)).toBeInTheDocument();
  });
});
