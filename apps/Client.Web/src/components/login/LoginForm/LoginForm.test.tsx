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

  it('should display success message when provided', () => {
    render(<LoginForm successMessage="Account created successfully!" />);

    expect(
      screen.getByText(/account created successfully!/i),
    ).toBeInTheDocument();
  });

  it('should disable form when isLoading is true', () => {
    render(<LoginForm isLoading />);

    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/password/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /login/i })).toBeDisabled();
  });

  it('should show loading spinner when isLoading is true', () => {
    render(<LoginForm isLoading />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
