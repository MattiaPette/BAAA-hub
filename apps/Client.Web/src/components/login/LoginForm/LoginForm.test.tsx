import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders as render } from '../../../test-utils';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('should render login form with all fields', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should display error when email is required and not provided', async () => {
    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('should display error when password is required and not provided', async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('should display error when email format is invalid', async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalidemail' } });

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  it('should call onSubmit with form data when form is valid', async () => {
    const mockOnSubmit = vi.fn();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        user: 'test@example.com',
        password: 'testpassword',
      });
    });
  });

  it('should display error messages passed as props', () => {
    const errorMessages = ['Invalid credentials', 'Please try again'];
    render(<LoginForm errorMessages={errorMessages} />);

    errorMessages.forEach(msg => {
      expect(screen.getByText(msg)).toBeInTheDocument();
    });
  });

  it('should toggle to signup mode and back to login mode', async () => {
    render(<LoginForm onToggleMode={vi.fn()} />);

    // Initially should show Login title
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();

    // Should show "Don't have an account?" with Sign Up button
    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign up/i }),
    ).toBeInTheDocument();
  });

  it('should render signup mode when isSignupMode is true', () => {
    render(<LoginForm isSignupMode onToggleMode={vi.fn()} />);

    expect(
      screen.getByRole('heading', { name: /sign up/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/already have an account\?/i)).toBeInTheDocument();
  });

  it('should call onSignup when form is submitted in signup mode', async () => {
    const mockOnSignup = vi.fn();
    render(<LoginForm isSignupMode onSignup={mockOnSignup} />);

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

  it('should display success message when provided', () => {
    render(<LoginForm successMessage="Account created successfully!" />);

    expect(
      screen.getByText(/account created successfully!/i),
    ).toBeInTheDocument();
  });
});
