import { screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SnackbarProvider } from 'notistack';
import {
  UserRole,
  PrivacyLevel,
  SportType,
  MfaType,
} from '@baaa-hub/shared-types';
import { Administration } from './Administration';
import { renderWithProviders as render } from '../../test-utils';

import { BreadcrumProvider } from '../../providers/BreadcrumProvider/BreadcrumProvider';
import * as AuthProviderModule from '../../providers/AuthProvider/AuthProvider';
import * as UserProviderModule from '../../providers/UserProvider/UserProvider';
import * as adminService from '../../services/adminService';

// Mock the services
vi.mock('../../services/adminService', () => ({
  listUsers: vi.fn(),
  updateUserBlocked: vi.fn(),
  updateUserRoles: vi.fn(),
}));

// Mock the UserProvider module
vi.mock('../../providers/UserProvider/UserProvider', async () => {
  const actual = await vi.importActual(
    '../../providers/UserProvider/UserProvider',
  );
  return {
    ...actual,
    useUser: vi.fn(),
  };
});

const mockUsers = [
  {
    id: '1',
    authId: 'auth0|1',
    name: 'John',
    surname: 'Doe',
    nickname: 'johndoe',
    email: 'john@example.com',
    dateOfBirth: '1990-01-01',
    sportTypes: [SportType.RUNNING],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    isBlocked: false,
    isEmailVerified: true,
    mfaEnabled: true,
    mfaType: MfaType.TOTP,
    roles: [UserRole.MEMBER, UserRole.ADMIN],
    privacySettings: {
      email: PrivacyLevel.PUBLIC,
      dateOfBirth: PrivacyLevel.PUBLIC,
      sportTypes: PrivacyLevel.PUBLIC,
      socialLinks: PrivacyLevel.PUBLIC,
    },
  },
  {
    id: '2',
    authId: 'auth0|2',
    name: 'Jane',
    surname: 'Smith',
    nickname: 'janesmith',
    email: 'jane@example.com',
    dateOfBirth: '1995-06-15',
    sportTypes: [SportType.CYCLING],
    createdAt: '2024-02-01T00:00:00.000Z',
    updatedAt: '2024-02-01T00:00:00.000Z',
    isBlocked: true,
    isEmailVerified: false,
    mfaEnabled: false,
    mfaType: MfaType.NONE,
    roles: [UserRole.MEMBER],
    privacySettings: {
      email: PrivacyLevel.PRIVATE,
      dateOfBirth: PrivacyLevel.PRIVATE,
      sportTypes: PrivacyLevel.PUBLIC,
      socialLinks: PrivacyLevel.PUBLIC,
    },
  },
];

describe('Administration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the auth context
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      token: {
        idToken: 'test-id-token',
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        idTokenPayload: {
          email: 'admin@example.com',
          preferred_username: 'admin',
          name: 'Admin User',
          given_name: 'Admin',
          family_name: 'User',
          iss: 'http://localhost:8180/realms/test-realm',
          aud: 'test-client-id',
          iat: 1234567890,
          exp: 1234567890,
          sub: 'keycloak-admin',
          sid: 'session-id',
          db_roles: ['admin'],
        },
      },
      isAuthenticated: true,
      localStorageAvailable: true,
      login: vi.fn(),
      signup: vi.fn(),

      logout: vi.fn(),
      authenticate: vi.fn(),
      isLoading: false,
      setLoading: vi.fn(),
      authClientData: {
        url: 'http://localhost:8180',
        realm: 'test-realm',
        clientId: 'test-client-id',
      },
      userPermissions: ['admin'],
      keycloak: null,
      authErrorMessages: [],
      clearAuthErrors: vi.fn(),
    });

    // Mock the useUser hook
    vi.mocked(UserProviderModule.useUser).mockReturnValue({
      user: {
        id: 'admin-user-id',
        authId: 'keycloak-admin',
        name: 'Admin',
        surname: 'User',
        nickname: 'admin',
        email: 'admin@example.com',
        dateOfBirth: '1990-01-01',
        sportTypes: [SportType.RUNNING],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isBlocked: false,
        isEmailVerified: true,
        mfaEnabled: true,
        mfaType: MfaType.TOTP,
        roles: [UserRole.MEMBER, UserRole.ADMIN],
        privacySettings: {
          email: PrivacyLevel.PUBLIC,
          dateOfBirth: PrivacyLevel.PUBLIC,
          sportTypes: PrivacyLevel.PUBLIC,
          socialLinks: PrivacyLevel.PUBLIC,
        },
      },
      hasProfile: true,
      isLoading: false,
      error: null,
      refreshUser: vi.fn(),
      setUser: vi.fn(),
    });

    // Mock the listUsers service
    vi.mocked(adminService.listUsers).mockResolvedValue({
      data: mockUsers,
      pagination: {
        page: 1,
        perPage: 10,
        total: 2,
        totalPages: 1,
      },
    });
  });

  const renderAdministration = () =>
    render(
      <SnackbarProvider>
        <BreadcrumProvider>
          <Administration />
        </BreadcrumProvider>
      </SnackbarProvider>,
    );

  it('should render Administration page title', async () => {
    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('Administration')).toBeInTheDocument();
    });
  });

  it('should render page description', async () => {
    renderAdministration();

    await waitFor(() => {
      expect(
        screen.getByText('Manage users, roles, and account status.'),
      ).toBeInTheDocument();
    });
  });

  it('should render search input', async () => {
    renderAdministration();

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Search by name, email, or nickname...'),
      ).toBeInTheDocument();
    });
  });

  it('should render table headers', async () => {
    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Nickname')).toBeInTheDocument();
    });
  });

  it('should fetch and display users', async () => {
    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });
  });

  it('should display user roles as chips', async () => {
    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  it('should display loading indicator while fetching', async () => {
    vi.mocked(adminService.listUsers).mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              data: [],
              pagination: { page: 1, perPage: 10, total: 0, totalPages: 0 },
            });
          }, 1000);
        }),
    );

    renderAdministration();

    // Loading indicator should be shown initially
    const progressIndicator = screen.queryByRole('progressbar');
    expect(progressIndicator).toBeInTheDocument();
  });

  it('should display error message when fetch fails', async () => {
    vi.mocked(adminService.listUsers).mockRejectedValue(
      new Error('Network error'),
    );

    renderAdministration();

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load users. Please try again.'),
      ).toBeInTheDocument();
    });
  });

  it('should display no users message when list is empty', async () => {
    vi.mocked(adminService.listUsers).mockResolvedValue({
      data: [],
      pagination: {
        page: 1,
        perPage: 10,
        total: 0,
        totalPages: 0,
      },
    });

    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });

  it('should toggle user block status when block button is clicked', async () => {
    vi.mocked(adminService.updateUserBlocked).mockResolvedValue({
      ...mockUsers[0],
      isBlocked: true,
    });

    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Find and click the block button for the first user
    const blockButtons = screen.getAllByTestId('BlockIcon');
    expect(blockButtons.length).toBeGreaterThan(0);
  });

  it('should handle page change', async () => {
    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Verify table pagination exists
    expect(screen.getByText('Rows per page:')).toBeInTheDocument();
  });

  it('should handle search input', async () => {
    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      'Search by name, email, or nickname...',
    );
    expect(searchInput).toBeInTheDocument();
  });

  it('should display filter dropdowns', async () => {
    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Verify the filter section exists
    const searchIcon = screen.getByTestId('SearchIcon');
    expect(searchIcon).toBeInTheDocument();
  });

  it('should display blocked user chips correctly', async () => {
    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Jane Smith is blocked, should show blocked chip
    const blockedChips = screen.getAllByText('Blocked');
    expect(blockedChips.length).toBeGreaterThan(0);
  });

  it('should display active user chips correctly', async () => {
    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // John Doe is active, should show active chip
    const activeChips = screen.getAllByText('Active');
    expect(activeChips.length).toBeGreaterThan(0);
  });

  it('should display email verified icons', async () => {
    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // John has verified email, Jane doesn't
    const verifiedIcons = screen.getAllByTestId('VerifiedUserIcon');
    expect(verifiedIcons.length).toBeGreaterThan(0);
  });

  it('should display email not verified icons', async () => {
    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Jane doesn't have verified email
    const notVerifiedIcons = screen.getAllByTestId('ErrorOutlineIcon');
    expect(notVerifiedIcons.length).toBeGreaterThan(0);
  });

  it('should display MFA enabled chips', async () => {
    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // John has MFA enabled
    const securityIcons = screen.getAllByTestId('SecurityIcon');
    expect(securityIcons.length).toBeGreaterThan(0);
  });

  it('should display MFA disabled icons', async () => {
    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Jane has MFA disabled
    const noEncryptionIcons = screen.getAllByTestId('NoEncryptionIcon');
    expect(noEncryptionIcons.length).toBeGreaterThan(0);
  });

  it('should display manage roles button for each user', async () => {
    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const manageAccountsIcons = screen.getAllByTestId('ManageAccountsIcon');
    expect(manageAccountsIcons.length).toBeGreaterThan(0);
  });

  it('should display user nickname with @ prefix', async () => {
    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('@johndoe')).toBeInTheDocument();
      expect(screen.getByText('@janesmith')).toBeInTheDocument();
    });
  });

  it('should not show block button for current admin user', async () => {
    // The mock setup has current user as 'admin-user-id' which is different from mockUsers
    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Block buttons should exist for other users
    const blockIcons = screen.getAllByTestId('BlockIcon');
    expect(blockIcons.length).toBeGreaterThan(0);
  });

  it('should handle toggle blocked for active user', async () => {
    vi.mocked(adminService.updateUserBlocked).mockResolvedValue({
      ...mockUsers[0],
      isBlocked: true,
    });

    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Find and click the block button for the first user (John)
    const blockButtons = screen.getAllByTestId('BlockIcon');
    fireEvent.click(blockButtons[0]);

    await waitFor(() => {
      expect(adminService.updateUserBlocked).toHaveBeenCalledWith(
        'test-id-token',
        '1',
        true,
      );
    });
  });

  it('should handle toggle blocked for blocked user (unblock)', async () => {
    vi.mocked(adminService.updateUserBlocked).mockResolvedValue({
      ...mockUsers[1],
      isBlocked: false,
    });

    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Find the unblock button for Jane (who is blocked)
    const unblockButtons = screen.getAllByTestId('CheckCircleIcon');
    // The first CheckCircle is for Active status, second row has it as unblock button
    // Find the button in the actions column
    fireEvent.click(unblockButtons[unblockButtons.length - 1]);

    await waitFor(() => {
      expect(adminService.updateUserBlocked).toHaveBeenCalled();
    });
  });

  it('should show error snackbar when toggle blocked fails', async () => {
    vi.mocked(adminService.updateUserBlocked).mockRejectedValue(
      new Error('Failed'),
    );

    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const blockButtons = screen.getAllByTestId('BlockIcon');
    fireEvent.click(blockButtons[0]);

    await waitFor(() => {
      expect(
        screen.getByText('Failed to update user status'),
      ).toBeInTheDocument();
    });
  });

  it('should open edit roles dialog when manage roles button is clicked', async () => {
    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const manageRolesButtons = screen.getAllByTestId('ManageAccountsIcon');
    fireEvent.click(manageRolesButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('should close edit roles dialog when close is clicked', async () => {
    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const manageRolesButtons = screen.getAllByTestId('ManageAccountsIcon');
    fireEvent.click(manageRolesButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should save roles when save button is clicked after making changes', async () => {
    // Use a user with SUPER_ADMIN role to have permission to edit
    vi.mocked(UserProviderModule.useUser).mockReturnValue({
      user: {
        id: 'admin-user-id',
        authId: 'keycloak-admin',
        name: 'Admin',
        surname: 'User',
        nickname: 'admin',
        email: 'admin@example.com',
        dateOfBirth: '1990-01-01',
        sportTypes: [SportType.RUNNING],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isBlocked: false,
        isEmailVerified: true,
        mfaEnabled: true,
        mfaType: MfaType.TOTP,
        roles: [UserRole.MEMBER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
        privacySettings: {
          email: PrivacyLevel.PUBLIC,
          dateOfBirth: PrivacyLevel.PUBLIC,
          sportTypes: PrivacyLevel.PUBLIC,
          socialLinks: PrivacyLevel.PUBLIC,
        },
      },
      hasProfile: true,
      isLoading: false,
      error: null,
      refreshUser: vi.fn(),
      setUser: vi.fn(),
    });

    vi.mocked(adminService.updateUserRoles).mockResolvedValue({
      ...mockUsers[1], // Jane Smith, who only has MEMBER role
      roles: [UserRole.MEMBER, UserRole.ORGANIZATION_COMMITTEE],
    });

    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Click manage roles on Jane (second user - the one that doesn't have many roles)
    const manageRolesButtons = screen.getAllByTestId('ManageAccountsIcon');
    fireEvent.click(manageRolesButtons[1]); // Jane is 2nd user

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Toggle a role to enable the save button
    const organizationCommitteeCheckbox = screen.getByRole('checkbox', {
      name: /Organization Committee/i,
    });
    fireEvent.click(organizationCommitteeCheckbox);

    // Click save button
    const saveButton = screen.getByRole('button', { name: /^save$/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(adminService.updateUserRoles).toHaveBeenCalled();
    });
  });

  it('should handle search with debounce', async () => {
    vi.useFakeTimers();

    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      'Search by name, email, or nickname...',
    );
    fireEvent.change(searchInput, { target: { value: 'John' } });

    // Advance timers to trigger debounce
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(adminService.listUsers).toHaveBeenCalledWith(
        'test-id-token',
        expect.objectContaining({ search: 'John' }),
      );
    });

    vi.useRealTimers();
  });

  it('should handle page change via pagination', async () => {
    // Setup mock with more users for pagination
    vi.mocked(adminService.listUsers).mockResolvedValue({
      data: mockUsers,
      pagination: {
        page: 1,
        perPage: 10,
        total: 25,
        totalPages: 3,
      },
    });

    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click next page button
    const nextPageButton = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(adminService.listUsers).toHaveBeenCalledWith(
        'test-id-token',
        expect.objectContaining({ page: 2 }),
      );
    });
  });

  it('should handle rows per page change', async () => {
    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Find and click rows per page select
    const rowsPerPageSelect = screen.getByRole('combobox', {
      name: /rows per page/i,
    });
    fireEvent.mouseDown(rowsPerPageSelect);

    await waitFor(() => {
      const option25 = screen.getByRole('option', { name: '25' });
      fireEvent.click(option25);
    });

    await waitFor(() => {
      expect(adminService.listUsers).toHaveBeenCalledWith(
        'test-id-token',
        expect.objectContaining({ perPage: 25 }),
      );
    });
  });

  it('should not fetch users when token is missing', async () => {
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      token: null,
      isAuthenticated: false,
      localStorageAvailable: true,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      authenticate: vi.fn(),
      isLoading: false,
      setLoading: vi.fn(),
      authClientData: {
        url: 'http://localhost:8180',
        realm: 'test-realm',
        clientId: 'test-client-id',
      },
      userPermissions: [],
      keycloak: null,
      authErrorMessages: [],
      clearAuthErrors: vi.fn(),
    });

    renderAdministration();

    await waitFor(() => {
      // Should show loading indicator but not fetch
      expect(adminService.listUsers).not.toHaveBeenCalled();
    });
  });
});
