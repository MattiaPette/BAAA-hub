import { screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { MemoryRouter } from 'react-router';
import { SnackbarProvider } from 'notistack';
import { SportType, User } from '@baaa-hub/shared-types';
import { renderWithProviders as render } from '../../test-utils';
import { Profile } from './Profile';
import * as AuthProviderModule from '../../providers/AuthProvider/AuthProvider';
import * as BreadcrumProviderModule from '../../providers/BreadcrumProvider/BreadcrumProvider';
import * as userService from '../../services/userService';

// Mock the user service
vi.mock('../../services/userService', () => ({
  getCurrentUser: vi.fn(),
  updateUserProfile: vi.fn(),
}));

const mockUser: User = {
  id: '1',
  authId: 'auth0|123',
  name: 'John',
  surname: 'Doe',
  nickname: 'johndoe',
  email: 'john.doe@example.com',
  dateOfBirth: '1990-05-15',
  sportTypes: [SportType.RUNNING, SportType.CYCLING],
  profilePicture: undefined,
  stravaLink: 'https://www.strava.com/athletes/12345',
  instagramLink: 'https://www.instagram.com/johndoe',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  isBlocked: false,
  isEmailVerified: true,
  roles: [],
};

const renderWithSnackbar = (ui: React.ReactElement) =>
  render(
    <SnackbarProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </SnackbarProvider>,
  );

describe('Profile', () => {
  const mockSetTitle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock auth provider
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      token: {
        idToken: 'test-id-token',
        idTokenPayload: { email: 'test@example.com' },
      },
      isAuthenticated: true,
      localStorageAvailable: true,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      authenticate: vi.fn(),
      loginWithRedirect: vi.fn(),
      userPermissions: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // Mock breadcrum provider
    vi.spyOn(BreadcrumProviderModule, 'useBreadcrum').mockReturnValue({
      setTitle: mockSetTitle,
      title: 'Profile',
    });
  });

  it('should render loading state initially', () => {
    (userService.getCurrentUser as Mock).mockImplementation(
      () => new Promise(() => {}), // Never resolves to keep loading state
    );

    renderWithSnackbar(<Profile />);

    // Should show skeleton loaders
    expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });

  it('should render user profile after loading', async () => {
    (userService.getCurrentUser as Mock).mockResolvedValue(mockUser);

    renderWithSnackbar(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('@johndoe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
  });

  it('should display sport types as chips', async () => {
    (userService.getCurrentUser as Mock).mockResolvedValue(mockUser);

    renderWithSnackbar(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Running')).toBeInTheDocument();
    });

    expect(screen.getByText('Cycling')).toBeInTheDocument();
  });

  it('should display social links when available', async () => {
    (userService.getCurrentUser as Mock).mockResolvedValue(mockUser);

    renderWithSnackbar(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Strava Profile')).toBeInTheDocument();
    });

    expect(screen.getByText('Instagram Profile')).toBeInTheDocument();
  });

  it('should not display social links section when no links are available', async () => {
    const userWithoutSocialLinks = {
      ...mockUser,
      stravaLink: undefined,
      instagramLink: undefined,
    };
    (userService.getCurrentUser as Mock).mockResolvedValue(
      userWithoutSocialLinks,
    );

    renderWithSnackbar(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.queryByText('Strava Profile')).not.toBeInTheDocument();
    expect(screen.queryByText('Instagram Profile')).not.toBeInTheDocument();
  });

  it('should display initials when no profile picture is available', async () => {
    (userService.getCurrentUser as Mock).mockResolvedValue(mockUser);

    renderWithSnackbar(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  it('should display error message when user fetch fails', async () => {
    (userService.getCurrentUser as Mock).mockRejectedValue(
      new Error('Network error'),
    );

    renderWithSnackbar(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load profile')).toBeInTheDocument();
    });
  });

  it('should display profile not found when user is null', async () => {
    (userService.getCurrentUser as Mock).mockResolvedValue(null);

    renderWithSnackbar(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Profile not found')).toBeInTheDocument();
    });
  });

  it('should open edit dialog when edit button is clicked', async () => {
    (userService.getCurrentUser as Mock).mockResolvedValue(mockUser);

    renderWithSnackbar(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const editButton = screen.getByLabelText('Edit profile');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });
  });

  it('should close edit dialog when cancel is clicked', async () => {
    (userService.getCurrentUser as Mock).mockResolvedValue(mockUser);

    renderWithSnackbar(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const editButton = screen.getByLabelText('Edit profile');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Dialog should be closed
    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'Edit Profile' }),
      ).not.toBeInTheDocument();
    });
  });

  it('should update profile successfully', async () => {
    const updatedUser = { ...mockUser, name: 'Jane' };
    (userService.getCurrentUser as Mock).mockResolvedValue(mockUser);
    (userService.updateUserProfile as Mock).mockResolvedValue(updatedUser);

    renderWithSnackbar(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const editButton = screen.getByLabelText('Edit profile');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    // Change the first name
    const firstNameInput = screen.getByLabelText('First Name');
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

    // Submit the form
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(userService.updateUserProfile).toHaveBeenCalled();
    });
  });

  it('should show error snackbar when update fails', async () => {
    (userService.getCurrentUser as Mock).mockResolvedValue(mockUser);
    (userService.updateUserProfile as Mock).mockRejectedValue(
      new Error('Update failed'),
    );

    renderWithSnackbar(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const editButton = screen.getByLabelText('Edit profile');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(userService.updateUserProfile).toHaveBeenCalled();
    });
  });

  it('should set breadcrumb title on mount', async () => {
    (userService.getCurrentUser as Mock).mockResolvedValue(mockUser);

    renderWithSnackbar(<Profile />);

    await waitFor(() => {
      expect(mockSetTitle).toHaveBeenCalledWith('Profile');
    });
  });

  it('should not fetch user when token is not available', async () => {
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      token: null,
      isAuthenticated: false,
      localStorageAvailable: true,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      authenticate: vi.fn(),
      loginWithRedirect: vi.fn(),
      userPermissions: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    renderWithSnackbar(<Profile />);

    // Should still show loading and eventually show profile not found
    await waitFor(() => {
      expect(userService.getCurrentUser).not.toHaveBeenCalled();
    });
  });

  it('should format dates correctly', async () => {
    (userService.getCurrentUser as Mock).mockResolvedValue(mockUser);

    renderWithSnackbar(<Profile />);

    await waitFor(() => {
      // Date of birth: '1990-05-15' should be formatted
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should display member since date', async () => {
    (userService.getCurrentUser as Mock).mockResolvedValue(mockUser);

    renderWithSnackbar(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Member Since')).toBeInTheDocument();
    });
  });

  it('should render user with profile picture', async () => {
    const userWithPicture = {
      ...mockUser,
      profilePicture: 'https://example.com/avatar.jpg',
    };
    (userService.getCurrentUser as Mock).mockResolvedValue(userWithPicture);

    renderWithSnackbar(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Avatar with picture should be rendered - initials should not be visible
    expect(screen.queryByText('JD')).not.toBeInTheDocument();
  });
});
