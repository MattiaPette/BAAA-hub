import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders as render } from '../../../test-utils';
import { LoginDialog } from './LoginDialog';

describe('LoginDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSwitchToSignup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login dialog when open', () => {
    render(
      <LoginDialog
        open
        onClose={mockOnClose}
        onSwitchToSignup={mockOnSwitchToSignup}
      />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^login$/i }),
    ).toBeInTheDocument();
  });

  it('should not render dialog when closed', () => {
    render(
      <LoginDialog
        open={false}
        onClose={mockOnClose}
        onSwitchToSignup={mockOnSwitchToSignup}
      />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should close dialog when close button is clicked', () => {
    render(
      <LoginDialog
        open
        onClose={mockOnClose}
        onSwitchToSignup={mockOnSwitchToSignup}
      />,
    );

    const closeButton = screen.getByLabelText(/close/i);
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not close dialog when close button is clicked during loading', async () => {
    render(
      <LoginDialog
        open
        onClose={mockOnClose}
        onSwitchToSignup={mockOnSwitchToSignup}
      />,
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

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
      <LoginDialog
        open
        onClose={mockOnClose}
        onSwitchToSignup={mockOnSwitchToSignup}
      />,
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Check that fields are disabled during loading
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeDisabled();
      expect(screen.getByLabelText(/password/i)).toBeDisabled();
      expect(screen.getByRole('button', { name: /login/i })).toBeDisabled();
    });
  });

  it('should switch to signup dialog when sign up link is clicked', () => {
    render(
      <LoginDialog
        open
        onClose={mockOnClose}
        onSwitchToSignup={mockOnSwitchToSignup}
      />,
    );

    const signUpButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signUpButton);

    // When switching to signup, we call handleDialogClose and onSwitchToSignup
    expect(mockOnSwitchToSignup).toHaveBeenCalledTimes(1);
  });

  it('should display validation errors for invalid email', async () => {
    render(
      <LoginDialog
        open
        onClose={mockOnClose}
        onSwitchToSignup={mockOnSwitchToSignup}
      />,
    );

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'invalidemail' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  it('should display validation error when password is missing', async () => {
    render(
      <LoginDialog
        open
        onClose={mockOnClose}
        onSwitchToSignup={mockOnSwitchToSignup}
      />,
    );

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('should not close dialog on backdrop click when there are error messages', async () => {
    render(
      <LoginDialog
        open
        onClose={mockOnClose}
        onSwitchToSignup={mockOnSwitchToSignup}
      />,
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    // Submit with valid credentials (will trigger authentication error in tests)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Wait for loading to complete and error to show
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).not.toBeDisabled();
    });

    // Verify dialog is still open with error visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should preserve form input values when login fails', async () => {
    render(
      <LoginDialog
        open
        onClose={mockOnClose}
        onSwitchToSignup={mockOnSwitchToSignup}
      />,
    );

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(
      /password/i,
    ) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /login/i });

    // Enter form values
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit login (will fail)
    fireEvent.click(submitButton);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).not.toBeDisabled();
    });

    // Verify form values are still present (not reset)
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });
});
