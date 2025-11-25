import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders as render } from '../../../../test-utils';
import { RootErrorFallback } from './RootErrorFallback';

describe('RootErrorFallback', () => {
  const mockError = new Error('Test error message');
  mockError.stack = 'Error stack trace';
  const mockResetErrorBoundary = vi.fn();

  it('should render error message', () => {
    render(
      <RootErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetErrorBoundary}
      />,
    );

    expect(
      screen.getByText(/oh no! something went wrong/i),
    ).toBeInTheDocument();
  });

  it('should render copyright text', () => {
    render(
      <RootErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetErrorBoundary}
      />,
    );

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`©${currentYear} COPYRIGHT`, 'i')),
    ).toBeInTheDocument();
  });

  it('should render replay icon button', () => {
    const { container } = render(
      <RootErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetErrorBoundary}
      />,
    );

    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
  });

  it('should call resetErrorBoundary when replay button is clicked', () => {
    const { container } = render(
      <RootErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetErrorBoundary}
      />,
    );

    const button = container.querySelector('button');
    if (button) {
      fireEvent.click(button);
      expect(mockResetErrorBoundary).toHaveBeenCalledTimes(1);
    }
  });

  it('should log error to console', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <RootErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetErrorBoundary}
      />,
    );

    expect(consoleSpy).toHaveBeenCalledWith(mockError);
    consoleSpy.mockRestore();
  });
});
