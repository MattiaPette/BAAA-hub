import { Mock, describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router';
import { SnackbarProvider } from 'notistack';
import { renderWithProviders as render } from '../../test-utils';
import { ProfileSetup } from './ProfileSetup';
import * as AuthProviderModule from '../../providers/AuthProvider/AuthProvider';
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
    ({ defaultEmail, defaultName, onSubmit, isSubmitting }) => (
      <div data-testid="profile-setup-form">
        <span data-testid="default-email">{defaultEmail}</span>
        <span data-testid="default-name">{defaultName}</span>
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
      loginWithRedirect: vi.fn(),
      userPermissions: [],
      setLoading: mockSetLoading,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
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
});
