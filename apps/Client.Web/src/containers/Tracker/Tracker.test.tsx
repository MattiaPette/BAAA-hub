import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { renderWithProviders as render } from '../../test-utils';
import { Tracker } from './Tracker';

describe('Tracker', () => {
  it('should render the tracker calendar', () => {
    render(<Tracker />);

    // Check that calendar navigation exists
    expect(screen.getByLabelText(/previous month/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/next month/i)).toBeInTheDocument();
  });

  it('should display week day headers', () => {
    render(<Tracker />);

    // Check for day headers (at least some of them)
    expect(screen.getByText(/mon/i)).toBeInTheDocument();
    expect(screen.getByText(/fri/i)).toBeInTheDocument();
  });

  it('should display calendar selector', () => {
    render(<Tracker />);

    // Should show calendar selector with default calendar
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText(/my activities calendar/i)).toBeInTheDocument();
  });
});
