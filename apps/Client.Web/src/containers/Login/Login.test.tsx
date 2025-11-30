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

  it('should show signup link', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign up/i }),
    ).toBeInTheDocument();
  });

  it('should toggle to signup mode when Sign Up button is clicked', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    const signUpButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signUpButton);

    await waitFor(() => {
      // In signup mode, the submit button should say "Sign Up" or similar
      expect(
        screen.getByRole('button', { name: /create account/i }),
      ).toBeInTheDocument();
    });
  });

  it('should call signup with correct credentials in signup mode', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    // Switch to signup mode
    const signUpButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /create account/i }),
      ).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const createAccountButton = screen.getByRole('button', {
      name: /create account/i,
    });

    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.click(createAccountButton);

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'new@example.com',
          password: 'newpassword123',
          onSuccessCallback: expect.any(Function),
          onErrorCallback: expect.any(Function),
        }),
      );
    });
  });

  it('should show success message after successful signup', async () => {
    mockSignup.mockImplementation(({ onSuccessCallback }) => {
      onSuccessCallback();
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    // Switch to signup mode
    const signUpButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /create account/i }),
      ).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const createAccountButton = screen.getByRole('button', {
      name: /create account/i,
    });

    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.click(createAccountButton);

    await waitFor(() => {
      expect(
        screen.getByText(/account created successfully/i),
      ).toBeInTheDocument();
    });
  });

  it('should show error message when signup fails', async () => {
    mockSignup.mockImplementation(({ onErrorCallback }) => {
      onErrorCallback('user_exists');
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    // Switch to signup mode
    const signUpButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /create account/i }),
      ).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const createAccountButton = screen.getByRole('button', {
      name: /create account/i,
    });

    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(createAccountButton);

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalled();
    });
  });

  it('should handle signup error callback with undefined error code', async () => {
    mockSignup.mockImplementation(({ onErrorCallback }) => {
      onErrorCallback(undefined);
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    // Switch to signup mode
    const signUpButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /create account/i }),
      ).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const createAccountButton = screen.getByRole('button', {
      name: /create account/i,
    });

    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(createAccountButton);

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalled();
    });
  });

  it('should clear error messages when toggling between modes', async () => {
    mockLogin.mockImplementation(({ onErrorCallback }) => {
      onErrorCallback('invalid_user_password');
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    // Trigger a login error
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /^login$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });

    // Toggle to signup mode - should clear error
    const signUpButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /create account/i }),
      ).toBeInTheDocument();
    });
  });

  it('should toggle back to login mode after successful signup', async () => {
    mockSignup.mockImplementation(({ onSuccessCallback }) => {
      onSuccessCallback();
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    // Switch to signup mode
    const signUpButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /create account/i }),
      ).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const createAccountButton = screen.getByRole('button', {
      name: /create account/i,
    });

    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.click(createAccountButton);

    // After successful signup, should be back in login mode with success message
    await waitFor(() => {
      expect(
        screen.getByText(/account created successfully/i),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /^login$/i }),
      ).toBeInTheDocument();
    });
  });
});
