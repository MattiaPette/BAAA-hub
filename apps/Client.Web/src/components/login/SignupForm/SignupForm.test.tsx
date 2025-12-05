import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders as render } from '../../../test-utils';
import { SignupForm } from './SignupForm';

describe('SignupForm', () => {
  it('should render signup form with all fields', () => {
    render(<SignupForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeInTheDocument();
  });

  it('should display Sign Up title', () => {
    render(<SignupForm />);

    expect(
      screen.getByRole('heading', { name: /sign up/i }),
    ).toBeInTheDocument();
  });

  it('should display error when email is required and not provided', async () => {
    render(<SignupForm />);

    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('should display error when password is required and not provided', async () => {
    render(<SignupForm />);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('should display error when email format is invalid', async () => {
    render(<SignupForm />);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalidemail' } });

    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  it('should display error when password is too short', async () => {
    render(<SignupForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'short' } });

    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/password must be at least 8 characters/i),
      ).toBeInTheDocument();
    });
  });

  it('should display error when email is too long', async () => {
    render(<SignupForm />);

    const emailInput = screen.getByLabelText(/email/i);
    // Create a string longer than 100 characters
    const longEmail = `${'a'.repeat(95)}@test.com`;
    fireEvent.change(emailInput, { target: { value: longEmail } });

    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/too many characters/i)).toBeInTheDocument();
    });
  });

  it('should call onSignup with form data when form is valid', async () => {
    const mockOnSignup = vi.fn();
    render(<SignupForm onSignup={mockOnSignup} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'testpassword123' } });

    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSignup).toHaveBeenCalledWith({
        user: 'test@example.com',
        password: 'testpassword123',
      });
    });
  });

  it('should display error messages passed as props', () => {
    const errorMessages = ['User already exists', 'Please try again'];
    render(<SignupForm errorMessages={errorMessages} />);

    errorMessages.forEach(msg => {
      expect(screen.getByText(msg)).toBeInTheDocument();
    });
  });

  it('should display success message when provided', () => {
    render(<SignupForm successMessage="Account created successfully!" />);

    expect(
      screen.getByText(/account created successfully!/i),
    ).toBeInTheDocument();
  });

  it('should disable form when isLoading is true', () => {
    render(<SignupForm isLoading />);

    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/password/i)).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeDisabled();
  });

  it('should show loading spinner when isLoading is true', () => {
    render(<SignupForm isLoading />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should not call onSignup when form is invalid', async () => {
    const mockOnSignup = vi.fn();
    render(<SignupForm onSignup={mockOnSignup} />);

    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });

    expect(mockOnSignup).not.toHaveBeenCalled();
  });

  it('should not show error alert when no error messages', () => {
    render(<SignupForm />);

    // The alert should not be present when there are no error messages
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should show error alert when error messages are present', () => {
    render(<SignupForm errorMessages={['Error occurred']} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should render logo image', () => {
    render(<SignupForm />);

    expect(screen.getByRole('img', { name: /logo/i })).toBeInTheDocument();
  });

  it('should handle empty onSignup callback gracefully', async () => {
    // Render without onSignup callback
    render(<SignupForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'testpassword123' } });

    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });

    // Should not throw when clicking submit with no callback
    expect(() => fireEvent.click(submitButton)).not.toThrow();
  });
});
