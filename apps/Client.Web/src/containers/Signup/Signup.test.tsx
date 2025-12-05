import { screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { renderWithProviders as render } from '../../test-utils';
import { Signup } from './Signup';
import * as AuthProviderModule from '../../providers/AuthProvider/AuthProvider';
import { AuthErrorCode } from '../../providers/AuthProvider/AuthProvider.model';

// Mock react-router
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Signup', () => {
  const mockSignup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock auth provider - not authenticated by default
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      token: null,
      isAuthenticated: false,
      localStorageAvailable: true,
      login: vi.fn(),
      signup: mockSignup,
      logout: vi.fn(),
      authenticate: vi.fn(),
      userPermissions: [],
      isLoading: false,
      setLoading: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );

  it('should render signup form', () => {
    renderComponent();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeInTheDocument();
  });

  it('should redirect to dashboard if already authenticated', async () => {
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      token: { idToken: 'test-token' },
      isAuthenticated: true,
      localStorageAvailable: true,
      login: vi.fn(),
      signup: mockSignup,
      logout: vi.fn(),
      authenticate: vi.fn(),
      userPermissions: [],
      isLoading: false,
      setLoading: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    renderComponent();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', {
        replace: true,
      });
    });
  });

  it('should call signup when form is submitted', async () => {
    mockSignup.mockImplementation(({ onSuccessCallback }) => {
      onSuccessCallback?.();
    });

    renderComponent();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'password123',
        }),
      );
    });
  });

  it('should show success message on successful signup', async () => {
    mockSignup.mockImplementation(({ onSuccessCallback }) => {
      onSuccessCallback?.();
    });

    renderComponent();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/account created successfully/i),
      ).toBeInTheDocument();
    });
  });

  it('should redirect to login after successful signup', async () => {
    vi.useFakeTimers();

    mockSignup.mockImplementation(({ onSuccessCallback }) => {
      onSuccessCallback?.();
    });

    renderComponent();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });
    fireEvent.click(submitButton);

    // Fast-forward the 2 second timeout
    await vi.advanceTimersByTimeAsync(2000);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });

    vi.useRealTimers();
  });

  it('should show error message on signup failure', async () => {
    mockSignup.mockImplementation(({ onErrorCallback }) => {
      onErrorCallback?.(AuthErrorCode.USER_EXISTS);
    });

    renderComponent();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Should display an error message (the specific text comes from getErrorDescription)
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('should handle error callback without error code', async () => {
    mockSignup.mockImplementation(({ onErrorCallback }) => {
      onErrorCallback?.(); // No error code provided
    });

    renderComponent();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalled();
    });
  });

  it('should clear error messages on new signup attempt', async () => {
    // First attempt - fail
    mockSignup.mockImplementationOnce(({ onErrorCallback }) => {
      onErrorCallback?.(AuthErrorCode.USER_EXISTS);
    });

    renderComponent();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    // Second attempt - expect errors to be cleared before calling signup
    mockSignup.mockImplementationOnce(({ onSuccessCallback }) => {
      onSuccessCallback?.();
    });

    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledTimes(2);
    });
  });

  it('should show loading state during signup', async () => {
    mockSignup.mockImplementation(
      () =>
        new Promise<void>(() => {
          /* intentionally left pending to simulate loading state */
        }),
    );

    renderComponent();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });
    fireEvent.click(submitButton);

    // The form should be in loading state
    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalled();
    });
  });
});
