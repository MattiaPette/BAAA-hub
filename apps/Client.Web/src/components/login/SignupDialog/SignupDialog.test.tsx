import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders as render } from '../../../test-utils';
import { SignupDialog } from './SignupDialog';

describe('SignupDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSwitchToLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render signup dialog when open', () => {
    render(
      <SignupDialog
        open
        onClose={mockOnClose}
        onSwitchToLogin={mockOnSwitchToLogin}
      />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeInTheDocument();
  });

  it('should not render dialog when closed', () => {
    render(
      <SignupDialog
        open={false}
        onClose={mockOnClose}
        onSwitchToLogin={mockOnSwitchToLogin}
      />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should close dialog when close button is clicked', () => {
    render(
      <SignupDialog
        open
        onClose={mockOnClose}
        onSwitchToLogin={mockOnSwitchToLogin}
      />,
    );

    const closeButton = screen.getByLabelText(/close/i);
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not close dialog when close button is clicked during loading', async () => {
    render(
      <SignupDialog
        open
        onClose={mockOnClose}
        onSwitchToLogin={mockOnSwitchToLogin}
      />,
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // During loading, the close button should be disabled
    await waitFor(() => {
      const closeButton = screen.getByLabelText(/close/i);
      expect(closeButton).toBeDisabled();
    });

    // Try to click the close button
    const closeButton = screen.getByLabelText(/close/i);
    fireEvent.click(closeButton);

    // Dialog should not close during loading
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should disable form fields during loading', async () => {
    render(
      <SignupDialog
        open
        onClose={mockOnClose}
        onSwitchToLogin={mockOnSwitchToLogin}
      />,
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Check that fields are disabled during loading
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeDisabled();
      expect(screen.getByLabelText(/password/i)).toBeDisabled();
      expect(
        screen.getByRole('button', { name: /create account/i }),
      ).toBeDisabled();
    });
  });

  it('should switch to login dialog when login link is clicked', () => {
    render(
      <SignupDialog
        open
        onClose={mockOnClose}
        onSwitchToLogin={mockOnSwitchToLogin}
      />,
    );

    const loginButton = screen.getByRole('button', { name: /^login$/i });
    fireEvent.click(loginButton);

    expect(mockOnSwitchToLogin).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display validation errors for invalid email', async () => {
    render(
      <SignupDialog
        open
        onClose={mockOnClose}
        onSwitchToLogin={mockOnSwitchToLogin}
      />,
    );

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });

    fireEvent.change(emailInput, { target: { value: 'invalidemail' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  it('should display validation error when password is too short', async () => {
    render(
      <SignupDialog
        open
        onClose={mockOnClose}
        onSwitchToLogin={mockOnSwitchToLogin}
      />,
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/password must be at least 8 characters/i),
      ).toBeInTheDocument();
    });
  });
});
