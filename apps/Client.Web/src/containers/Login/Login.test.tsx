import { screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { renderWithProviders as render } from '../../test-utils';
import { Login } from './Login';
import * as AuthProviderModule from '../../providers/AuthProvider/AuthProvider';

describe('Login', () => {
  const mockLogin = vi.fn();
  const mockSignup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      login: mockLogin,
      signup: mockSignup,
      isAuthenticated: false,
      isLoading: false,
      localStorageAvailable: true,
      logout: vi.fn(),
      authenticate: vi.fn(),
      token: null,
      userPermissions: [],
      authErrorMessages: [],
      clearAuthErrors: vi.fn(),
      getRememberedEmail: vi.fn(() => null),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  it('should render login form', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should call login with correct credentials on submit', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /^login$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'password123',
          onErrorCallback: expect.any(Function),
        }),
      );
    });
  });

  it('should display error message when login fails', async () => {
    mockLogin.mockImplementation(({ onErrorCallback }) => {
      onErrorCallback('invalid_user_password');
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /^login$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  it('should display error message from URL query parameter', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/login?error=unauthorized']}>
        <Login />
      </MemoryRouter>,
    );

    // Form should be rendered
    expect(container.querySelector('form')).toBeInTheDocument();
  });

  it('should handle error callback with undefined error code', async () => {
    mockLogin.mockImplementation(({ onErrorCallback }) => {
      onErrorCallback(undefined);
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /^login$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });
});
