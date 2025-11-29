import { screen, waitFor, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { MemoryRouter } from 'react-router';
import { SnackbarProvider } from 'notistack';
import { SportType, User, PrivacyLevel, MfaType } from '@baaa-hub/shared-types';
import { renderWithProviders as render } from '../../test-utils';
import { Profile } from './Profile';
import * as AuthProviderModule from '../../providers/AuthProvider/AuthProvider';
import * as BreadcrumProviderModule from '../../providers/BreadcrumProvider/BreadcrumProvider';
import * as userService from '../../services/userService';
import * as useCurrentUserModule from '../../hooks/useCurrentUser';

// Mock the user service
vi.mock('../../services/userService', () => ({
  updateUserProfile: vi.fn(),
}));

// Mock the useCurrentUser hook
vi.mock('../../hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}));

// Mock useQueryClient
const mockInvalidateQueries = vi.fn();
vi.mock('@tanstack/react-query', async importOriginal => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries: mockInvalidateQueries,
    }),
  };
});

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
  mfaEnabled: false,
  mfaType: MfaType.NONE,
  roles: [],
  privacySettings: {
    email: PrivacyLevel.PUBLIC,
    dateOfBirth: PrivacyLevel.PUBLIC,
    sportTypes: PrivacyLevel.PUBLIC,
    socialLinks: PrivacyLevel.PUBLIC,
  },
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
    (useCurrentUserModule.useCurrentUser as Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    renderWithSnackbar(<Profile />);

    // Should show skeleton loaders
    expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });

  it('should render user profile after loading', async () => {
    (useCurrentUserModule.useCurrentUser as Mock).mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    renderWithSnackbar(<Profile />);

    // Should show user info
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('@johndoe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument(); // Avatar initials
  });

  it('should display sport types as chips', async () => {
    (useCurrentUserModule.useCurrentUser as Mock).mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    renderWithSnackbar(<Profile />);

    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getByText('Cycling')).toBeInTheDocument();
  });

  it('should display social links when available', async () => {
    (useCurrentUserModule.useCurrentUser as Mock).mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    renderWithSnackbar(<Profile />);

    expect(screen.getByRole('link', { name: /strava/i })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /instagram/i }),
    ).toBeInTheDocument();
  });

  it('should not display social links section when no links are available', async () => {
    const userWithoutSocialLinks = {
      ...mockUser,
      stravaLink: undefined,
      instagramLink: undefined,
    };
    (useCurrentUserModule.useCurrentUser as Mock).mockReturnValue({
      data: userWithoutSocialLinks,
      isLoading: false,
      error: null,
    });

    renderWithSnackbar(<Profile />);

    expect(
      screen.queryByRole('link', { name: /strava/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /instagram/i }),
    ).not.toBeInTheDocument();
  });

  it('should display error message when user fetch fails', async () => {
    (useCurrentUserModule.useCurrentUser as Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
    });

    renderWithSnackbar(<Profile />);

    expect(screen.getByText('Profile not found')).toBeInTheDocument();
  });

  it('should display profile not found when user is null', async () => {
    (useCurrentUserModule.useCurrentUser as Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    renderWithSnackbar(<Profile />);

    expect(screen.getByText('Profile not found')).toBeInTheDocument();
  });

  it('should open edit dialog when edit button is clicked', async () => {
    (useCurrentUserModule.useCurrentUser as Mock).mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    renderWithSnackbar(<Profile />);

    const editButton = screen.getByRole('button', { name: /edit profile/i });
    fireEvent.click(editButton);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Check for title within dialog to avoid ambiguity with the button text
    const dialogTitle = within(dialog).getByText('Edit Profile');
    expect(dialogTitle).toBeInTheDocument();

    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
  });

  it('should close edit dialog when cancel is clicked', async () => {
    (useCurrentUserModule.useCurrentUser as Mock).mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    renderWithSnackbar(<Profile />);

    // Open dialog
    fireEvent.click(screen.getByRole('button', { name: /edit profile/i }));

    // Click cancel
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should update profile successfully', async () => {
    (useCurrentUserModule.useCurrentUser as Mock).mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    (userService.updateUserProfile as Mock).mockResolvedValue({
      ...mockUser,
      name: 'Johnny',
    });

    renderWithSnackbar(<Profile />);

    // Open dialog
    fireEvent.click(screen.getByRole('button', { name: /edit profile/i }));

    // Change name
    const nameInput = screen.getByLabelText('First Name');
    fireEvent.change(nameInput, { target: { value: 'Johnny' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      // updateUserProfile is called with token, not userId
      expect(userService.updateUserProfile).toHaveBeenCalledWith(
        'test-id-token',
        expect.objectContaining({
          name: 'Johnny',
        }),
      );
    });

    // Should close dialog
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Should invalidate queries
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['currentUser'],
    });
  });

  it('should close edit dialog when cancel is clicked', async () => {
    (useCurrentUserModule.useCurrentUser as Mock).mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    renderWithSnackbar(<Profile />);

    // Open dialog
    fireEvent.click(screen.getByRole('button', { name: /edit profile/i }));

    // Click cancel
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should update profile successfully', async () => {
    (useCurrentUserModule.useCurrentUser as Mock).mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    (userService.updateUserProfile as Mock).mockResolvedValue({
      ...mockUser,
      name: 'Johnny',
    });

    renderWithSnackbar(<Profile />);

    // Open dialog
    fireEvent.click(screen.getByRole('button', { name: /edit profile/i }));

    // Change name
    const nameInput = screen.getByLabelText('First Name');
    fireEvent.change(nameInput, { target: { value: 'Johnny' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(userService.updateUserProfile).toHaveBeenCalledWith(
        'test-id-token',
        expect.objectContaining({
          name: 'Johnny',
        }),
      );
    });

    // Should close dialog
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Should invalidate queries
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['currentUser'],
    });
  });

  it('should show error snackbar when update fails', async () => {
    (useCurrentUserModule.useCurrentUser as Mock).mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    (userService.updateUserProfile as Mock).mockRejectedValue(
      new Error('Update failed'),
    );

    renderWithSnackbar(<Profile />);

    // Open dialog
    fireEvent.click(screen.getByRole('button', { name: /edit profile/i }));

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Failed to update profile. Please try again.'),
      ).toBeInTheDocument();
    });

    // Dialog should remain open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should format dates correctly', async () => {
    (useCurrentUserModule.useCurrentUser as Mock).mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    renderWithSnackbar(<Profile />);

    // Date of birth: '1990-05-15' should be formatted
    // The exact format depends on the locale, but let's check for the year
    expect(screen.getByText(/1990/)).toBeInTheDocument();
  });

  it('should display member since date', async () => {
    (useCurrentUserModule.useCurrentUser as Mock).mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    renderWithSnackbar(<Profile />);

    expect(screen.getByText(/Joined/)).toBeInTheDocument();
    expect(screen.getByText(/2024/)).toBeInTheDocument();
  });

  it('should render user with profile picture', async () => {
    const userWithPic = {
      ...mockUser,
      profilePicture: 'https://example.com/pic.jpg',
    };
    (useCurrentUserModule.useCurrentUser as Mock).mockReturnValue({
      data: userWithPic,
      isLoading: false,
      error: null,
    });

    renderWithSnackbar(<Profile />);

    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('src', 'https://example.com/pic.jpg');
  });
});
