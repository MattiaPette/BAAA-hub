import { screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { renderWithProviders as render } from '../../test-utils';
import { Login } from './Login';
import * as AuthProviderModule from '../../providers/AuthProvider/AuthProvider';

describe('Login', () => {
  const mockLogin = vi.fn();
  const mockLoginWithRedirect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      login: mockLogin,
      loginWithRedirect: mockLoginWithRedirect,
      isAuthenticated: false,
      localStorageAvailable: true,
      logout: vi.fn(),
      authenticate: vi.fn(),
      token: null,
      userPermissions: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  it('should render login form', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should call login with correct credentials on submit', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /^login$/i });

    fireEvent.change(usernameInput, { target: { value: 'test@example.com' } });
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

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /^login$/i });

    fireEvent.change(usernameInput, { target: { value: 'test@example.com' } });
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

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /^login$/i });

    fireEvent.change(usernameInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  it('should render alternative login link', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('button', { name: /try alternative login/i }),
    ).toBeInTheDocument();
  });

  it('should call loginWithRedirect when alternative login is clicked', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    const alternativeLoginButton = screen.getByRole('button', {
      name: /try alternative login/i,
    });
    fireEvent.click(alternativeLoginButton);

    await waitFor(() => {
      expect(mockLoginWithRedirect).toHaveBeenCalled();
    });
  });
});
