import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders as render } from '../../../test-utils';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('should render login form with all fields', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should display error when username is required and not provided', async () => {
    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    });
  });

  it('should display error when password is required and not provided', async () => {
    render(<LoginForm />);

    const usernameInput = screen.getByLabelText(/username/i);
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('should display error when username exceeds max length', async () => {
    render(<LoginForm />);

    const usernameInput = screen.getByLabelText(/username/i);
    const longUsername = 'a'.repeat(41);
    fireEvent.change(usernameInput, { target: { value: longUsername } });

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/too many characters/i)).toBeInTheDocument();
    });
  });

  it('should call onSubmit with form data when form is valid', async () => {
    const mockOnSubmit = vi.fn();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        user: 'testuser',
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

  it('should show error state on username and password fields when error messages are present', async () => {
    const errorMessages = ['Invalid credentials'];
    render(<LoginForm errorMessages={errorMessages} />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await waitFor(() => {
      expect(usernameInput).toHaveAttribute('aria-invalid', 'true');
      expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('should render alternative login button when onLoginWithRedirect is provided', () => {
    const mockLoginWithRedirect = vi.fn();
    render(<LoginForm onLoginWithRedirect={mockLoginWithRedirect} />);

    expect(
      screen.getByRole('button', { name: /try alternative login/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/having trouble signing in\?/i),
    ).toBeInTheDocument();
  });

  it('should not render alternative login button when onLoginWithRedirect is not provided', () => {
    render(<LoginForm />);

    expect(
      screen.queryByRole('button', { name: /try alternative login/i }),
    ).not.toBeInTheDocument();
  });

  it('should call onLoginWithRedirect when alternative login button is clicked', async () => {
    const mockLoginWithRedirect = vi.fn();
    render(<LoginForm onLoginWithRedirect={mockLoginWithRedirect} />);

    const alternativeLoginButton = screen.getByRole('button', {
      name: /try alternative login/i,
    });
    fireEvent.click(alternativeLoginButton);

    await waitFor(() => {
      expect(mockLoginWithRedirect).toHaveBeenCalled();
    });
  });
});
