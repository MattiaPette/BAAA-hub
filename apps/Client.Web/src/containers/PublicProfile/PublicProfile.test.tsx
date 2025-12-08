import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { UserRole, PrivacyLevel, MfaType } from '@baaa-hub/shared-types';
import { SnackbarProvider } from 'notistack';
import { renderWithProviders as render } from '../../test-utils';
import { PublicProfile } from './PublicProfile';
import * as socialService from '../../services/socialService';
import { BreadcrumProvider } from '../../providers/BreadcrumProvider/BreadcrumProvider';

// Mock the social service
vi.mock('../../services/socialService', () => ({
  getPublicUserProfile: vi.fn(),
  followUser: vi.fn(),
  unfollowUser: vi.fn(),
}));

// Mock the user service
vi.mock('../../services/userService', () => ({
  getUserImageUrl: vi.fn((key?: string) => key || ''),
}));

// Mock react-router
const mockNavigate = vi.fn();
const mockParams = { userId: 'user-123' };
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  };
});

// Mock auth provider
vi.mock('../../providers/AuthProvider/AuthProvider', async () => {
  const actual = await vi.importActual<
    typeof import('../../providers/AuthProvider/AuthProvider')
  >('../../providers/AuthProvider/AuthProvider');
  return {
    ...actual,
    useAuth: () => ({
      token: {
        accessToken: 'mock-token',
      },
      isAuthenticated: true,
    }),
  };
});

// Mock current user hook
vi.mock('../../hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({
    data: {
      id: 'current-user-id',
      name: 'Current',
      surname: 'User',
    },
  }),
}));

// Mock lingui
vi.mock('@lingui/react', async () => {
  const actual = await vi.importActual('@lingui/react');
  return {
    ...actual,
    useLingui: () => ({
      i18n: {
        _: (id: string) => id,
        locale: 'en',
      },
    }),
  };
});

describe('PublicProfile', () => {
  const mockProfile = {
    user: {
      id: 'user-123',
      nickname: 'john_doe',
      name: 'John',
      surname: 'Doe',
      email: 'john@example.com',
      dateOfBirth: '1990-01-01',
      sportTypes: [],
      authId: 'auth-123',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      isBlocked: false,
      isEmailVerified: true,
      mfaEnabled: false,
      mfaType: MfaType.NONE,
      roles: [UserRole.MEMBER],
      privacySettings: {
        email: PrivacyLevel.PUBLIC,
        dateOfBirth: PrivacyLevel.PUBLIC,
        sportTypes: PrivacyLevel.PUBLIC,
        socialLinks: PrivacyLevel.PUBLIC,
      },
    },
    followStats: {
      followersCount: 10,
      followingCount: 5,
    },
    isFollowing: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <BreadcrumProvider>
        <SnackbarProvider>
          <PublicProfile />
        </SnackbarProvider>
      </BreadcrumProvider>,
    );

  it('should render loading state initially', () => {
    vi.spyOn(socialService, 'getPublicUserProfile').mockReturnValue(
      new Promise(() => {}), // Never resolves
    );

    renderComponent();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render user profile data when loaded', async () => {
    vi.spyOn(socialService, 'getPublicUserProfile').mockResolvedValue(
      mockProfile,
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('@john_doe')).toBeInTheDocument();
  });

  it('should display follow stats', async () => {
    vi.spyOn(socialService, 'getPublicUserProfile').mockResolvedValue(
      mockProfile,
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/10/)).toBeInTheDocument(); // followers
      expect(screen.getByText(/5/)).toBeInTheDocument(); // following
    });
  });

  it('should show follow button when not following', async () => {
    vi.spyOn(socialService, 'getPublicUserProfile').mockResolvedValue(
      mockProfile,
    );

    renderComponent();

    await waitFor(() => {
      const followButton = screen.getByRole('button', { name: /follow/i });
      expect(followButton).toBeInTheDocument();
    });
  });

  it('should show unfollow button when already following', async () => {
    vi.spyOn(socialService, 'getPublicUserProfile').mockResolvedValue({
      ...mockProfile,
      isFollowing: true,
    });

    renderComponent();

    await waitFor(() => {
      const unfollowButton = screen.getByRole('button', { name: /unfollow/i });
      expect(unfollowButton).toBeInTheDocument();
    });
  });

  it('should handle follow action', async () => {
    const user = userEvent.setup();

    vi.spyOn(socialService, 'getPublicUserProfile').mockResolvedValue(
      mockProfile,
    );
    vi.spyOn(socialService, 'followUser').mockResolvedValue({
      follow: {
        id: 'follow-1',
        followerId: 'current-user-id',
        followingId: 'user-123',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const followButton = screen.getByRole('button', { name: /follow/i });
    await user.click(followButton);

    expect(socialService.followUser).toHaveBeenCalledWith(
      'user-123',
      'mock-token',
    );

    // Button should change to unfollow
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /unfollow/i }),
      ).toBeInTheDocument();
    });
  });

  it('should handle unfollow action', async () => {
    const user = userEvent.setup();

    vi.spyOn(socialService, 'getPublicUserProfile').mockResolvedValue({
      ...mockProfile,
      isFollowing: true,
    });
    vi.spyOn(socialService, 'unfollowUser').mockResolvedValue({
      success: true,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const unfollowButton = screen.getByRole('button', { name: /unfollow/i });
    await user.click(unfollowButton);

    expect(socialService.unfollowUser).toHaveBeenCalledWith(
      'user-123',
      'mock-token',
    );

    // Button should change to follow
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /follow/i }),
      ).toBeInTheDocument();
    });
  });

  it('should navigate to dashboard when profile fails to load', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    vi.spyOn(socialService, 'getPublicUserProfile').mockRejectedValue(
      new Error('Failed to load profile'),
    );

    renderComponent();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    consoleErrorSpy.mockRestore();
  });

  it('should not show follow button when viewing own profile', async () => {
    // Mock current user to match the profile being viewed
    const useCurrentUserMock = vi.hoisted(() => vi.fn());
    vi.doMock('../../hooks/useCurrentUser', () => ({
      useCurrentUser: useCurrentUserMock,
    }));

    useCurrentUserMock.mockReturnValue({
      data: {
        id: 'user-123', // Same as the profile being viewed
        name: 'John',
        surname: 'Doe',
      },
    });

    vi.spyOn(socialService, 'getPublicUserProfile').mockResolvedValue(
      mockProfile,
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Follow button should not be present
    const followButton = screen.queryByRole('button', { name: /follow/i });
    expect(followButton).not.toBeInTheDocument();
  });
});
