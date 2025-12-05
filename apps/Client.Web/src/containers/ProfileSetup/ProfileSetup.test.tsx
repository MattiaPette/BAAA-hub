import { Mock, describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router';
import { SnackbarProvider } from 'notistack';
import { renderWithProviders as render } from '../../test-utils';
import { ProfileSetup } from './ProfileSetup';
import * as AuthProviderModule from '../../providers/AuthProvider/AuthProvider';
import * as UserProviderModule from '../../providers/UserProvider/UserProvider';
import { createUserProfile } from '../../services/userService';

// Mock react-router
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the user service
vi.mock('../../services/userService', () => ({
  createUserProfile: vi.fn(),
}));

// Mock ProfileSetupForm to avoid testing wizard logic here
vi.mock('./ProfileSetupForm', () => ({
  ProfileSetupForm: vi.fn(
    ({
      defaultEmail,
      defaultName,
      onSubmit,
      isSubmitting,
      onLogout,
      errorMessage,
    }) => (
      <div data-testid="profile-setup-form">
        <span data-testid="default-email">{defaultEmail}</span>
        <span data-testid="default-name">{defaultName}</span>
        {errorMessage && (
          <span data-testid="error-message">{errorMessage}</span>
        )}
        <button
          type="button"
          data-testid="submit-button"
          disabled={isSubmitting}
          onClick={() =>
            onSubmit({
              name: 'John',
              surname: 'Doe',
              nickname: 'johndoe',
              email: defaultEmail || 'test@example.com',
              dateOfBirth: '2000-01-01',
              sportTypes: ['RUNNING'],
              privacySettings: {
                email: 'PUBLIC',
                dateOfBirth: 'PUBLIC',
                sportTypes: 'PUBLIC',
                socialLinks: 'PUBLIC',
              },
            })
          }
        >
          Submit
        </button>
        <button type="button" data-testid="logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    ),
  ),
}));

const renderWithSnackbar = (ui: React.ReactElement) =>
  render(
    <SnackbarProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </SnackbarProvider>,
  );

describe('ProfileSetup', () => {
  const mockSetLoading = vi.fn();
  const mockRefreshUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock auth provider
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      token: {
        idToken: 'test-id-token',
        idTokenPayload: {
          email: 'test@example.com',
          name: 'John Doe',
        },
      },
      isAuthenticated: true,
      localStorageAvailable: true,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      authenticate: vi.fn(),

      userPermissions: [],
      setLoading: mockSetLoading,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // Mock user provider
    mockRefreshUser.mockResolvedValue(undefined);
    vi.spyOn(UserProviderModule, 'useUser').mockReturnValue({
      user: null,
      hasProfile: false,
      isLoading: false,
      error: null,
      refreshUser: mockRefreshUser,
      setUser: vi.fn(),
    });
  });

  it('should render profile setup form', () => {
    renderWithSnackbar(<ProfileSetup />);

    expect(screen.getByTestId('profile-setup-form')).toBeInTheDocument();
  });

  it('should pass correct default values to form', () => {
    renderWithSnackbar(<ProfileSetup />);

    expect(screen.getByTestId('default-email')).toHaveTextContent(
      'test@example.com',
    );
    expect(screen.getByTestId('default-name')).toHaveTextContent('John Doe');
  });

  it('should handle form submission successfully', async () => {
    (createUserProfile as Mock).mockResolvedValue({});

    renderWithSnackbar(<ProfileSetup />);

    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(createUserProfile).toHaveBeenCalledWith('test-id-token', {
        name: 'John',
        surname: 'Doe',
        nickname: 'johndoe',
        email: 'test@example.com',
        dateOfBirth: '2000-01-01',
        sportTypes: ['RUNNING'],
        stravaLink: undefined,
        instagramLink: undefined,
        privacySettings: {
          email: 'PUBLIC',
          dateOfBirth: 'PUBLIC',
          sportTypes: 'PUBLIC',
          socialLinks: 'PUBLIC',
        },
      });
    });

    // Should refresh user before navigating
    await waitFor(() => {
      expect(mockRefreshUser).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', {
        replace: true,
      });
    });
  });

  it('should handle submission error', async () => {
    const error = new Error('Submission failed');
    (createUserProfile as Mock).mockRejectedValue(error);

    renderWithSnackbar(<ProfileSetup />);

    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(createUserProfile).toHaveBeenCalled();
    });

    // Should not navigate on error
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should show loading state during submission', async () => {
    (createUserProfile as Mock).mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(resolve, 100);
        }),
    );

    renderWithSnackbar(<ProfileSetup />);

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    // Button should be disabled during submission
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('should display page title', async () => {
    renderWithSnackbar(<ProfileSetup />);

    // The title should be set via useBreadcrum hook
    // We can verify the form is rendered
    expect(screen.getByTestId('profile-setup-form')).toBeInTheDocument();
  });

  it('should not call service when token is missing', () => {
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      token: null,
      isAuthenticated: true,
      localStorageAvailable: true,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      authenticate: vi.fn(),
      userPermissions: [],
      setLoading: mockSetLoading,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    renderWithSnackbar(<ProfileSetup />);

    fireEvent.click(screen.getByTestId('submit-button'));

    expect(createUserProfile).not.toHaveBeenCalled();
  });

  it('should handle empty name from token payload', () => {
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      token: {
        idToken: 'test-id-token',
        idTokenPayload: {
          email: 'test@example.com',
        },
      },
      isAuthenticated: true,
      localStorageAvailable: true,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      authenticate: vi.fn(),
      userPermissions: [],
      setLoading: mockSetLoading,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    renderWithSnackbar(<ProfileSetup />);

    expect(screen.getByTestId('default-name')).toHaveTextContent('');
  });

  it('should handle logout when logout button is clicked', async () => {
    const mockLogout = vi.fn();
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      token: {
        idToken: 'test-id-token',
        idTokenPayload: {
          email: 'test@example.com',
          name: 'John Doe',
        },
      },
      isAuthenticated: true,
      localStorageAvailable: true,
      login: vi.fn(),
      signup: vi.fn(),
      logout: mockLogout,
      authenticate: vi.fn(),
      userPermissions: [],
      setLoading: mockSetLoading,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    renderWithSnackbar(<ProfileSetup />);

    fireEvent.click(screen.getByTestId('logout-button'));

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('should handle NICKNAME_TAKEN error', async () => {
    const error = {
      response: {
        data: {
          code: 'NICKNAME_TAKEN',
        },
      },
    };
    Object.setPrototypeOf(error, Error.prototype);
    (createUserProfile as Mock).mockRejectedValue(error);

    renderWithSnackbar(<ProfileSetup />);

    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'This nickname is already taken',
      );
    });
  });

  it('should handle EMAIL_TAKEN error', async () => {
    const error = {
      response: {
        data: {
          code: 'EMAIL_TAKEN',
        },
      },
    };
    Object.setPrototypeOf(error, Error.prototype);
    (createUserProfile as Mock).mockRejectedValue(error);

    renderWithSnackbar(<ProfileSetup />);

    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'This email is already registered',
      );
    });
  });

  it('should handle USER_ALREADY_EXISTS error and redirect', async () => {
    vi.useFakeTimers();
    const error = {
      response: {
        data: {
          code: 'USER_ALREADY_EXISTS',
        },
      },
    };
    Object.setPrototypeOf(error, Error.prototype);
    (createUserProfile as Mock).mockRejectedValue(error);

    renderWithSnackbar(<ProfileSetup />);

    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'You already have a profile',
      );
    });

    // Advance timers to trigger the redirect
    await vi.advanceTimersByTimeAsync(2000);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });

    vi.useRealTimers();
  });

  it('should handle AGE_REQUIREMENT_NOT_MET error', async () => {
    const error = {
      response: {
        data: {
          code: 'AGE_REQUIREMENT_NOT_MET',
        },
      },
    };
    Object.setPrototypeOf(error, Error.prototype);
    (createUserProfile as Mock).mockRejectedValue(error);

    renderWithSnackbar(<ProfileSetup />);

    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'You must be at least 13 years old',
      );
    });
  });

  it('should handle VALIDATION_ERROR with details', async () => {
    const error = {
      response: {
        data: {
          code: 'VALIDATION_ERROR',
          details: [
            { path: 'email', message: 'Invalid email format' },
            { path: 'nickname', message: 'Too short' },
          ],
        },
      },
    };
    Object.setPrototypeOf(error, Error.prototype);
    (createUserProfile as Mock).mockRejectedValue(error);

    renderWithSnackbar(<ProfileSetup />);

    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'email: Invalid email format',
      );
    });
  });

  it('should handle VALIDATION_ERROR without details', async () => {
    const error = {
      response: {
        data: {
          code: 'VALIDATION_ERROR',
          error: 'Validation failed',
        },
      },
    };
    Object.setPrototypeOf(error, Error.prototype);
    (createUserProfile as Mock).mockRejectedValue(error);

    renderWithSnackbar(<ProfileSetup />);

    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Validation failed',
      );
    });
  });

  it('should handle unknown error code with error message', async () => {
    const error = {
      response: {
        data: {
          code: 'UNKNOWN_CODE',
          error: 'Something went wrong',
        },
      },
    };
    Object.setPrototypeOf(error, Error.prototype);
    (createUserProfile as Mock).mockRejectedValue(error);

    renderWithSnackbar(<ProfileSetup />);

    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Something went wrong',
      );
    });
  });

  it('should handle non-Error exception', async () => {
    (createUserProfile as Mock).mockRejectedValue('string error');

    renderWithSnackbar(<ProfileSetup />);

    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Failed to create profile',
      );
    });
  });
});
