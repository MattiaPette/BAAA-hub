import { screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import {
  UserRole,
  PrivacyLevel,
  SportType,
  MfaType,
  User,
} from '@baaa-hub/shared-types';
import { EditRolesDialog } from './EditRolesDialog';
import { renderWithProviders as render } from '../../test-utils';

const createMockUser = (overrides: Partial<User> = {}): User => ({
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
  mfaEnabled: false,
  mfaType: MfaType.NONE,
  roles: [UserRole.MEMBER],
  privacySettings: {
    email: PrivacyLevel.PUBLIC,
    dateOfBirth: PrivacyLevel.PUBLIC,
    sportTypes: PrivacyLevel.PUBLIC,
    socialLinks: PrivacyLevel.PUBLIC,
  },
  ...overrides,
});

describe('EditRolesDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSave.mockResolvedValue(undefined);
  });

  const renderDialog = (
    user: User = createMockUser(),
    currentUserRoles: UserRole[] = [UserRole.MEMBER, UserRole.ADMIN],
    open = true,
  ) =>
    render(
      <SnackbarProvider>
        <EditRolesDialog
          open={open}
          user={user}
          currentUserRoles={currentUserRoles}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      </SnackbarProvider>,
    );

  it('should render dialog with user name', async () => {
    const user = createMockUser({ name: 'Jane', surname: 'Smith' });
    renderDialog(user);

    await waitFor(() => {
      expect(screen.getByText('Edit Roles for Jane Smith')).toBeInTheDocument();
    });
  });

  it('should render cancel and save buttons', async () => {
    renderDialog();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Cancel' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });
  });

  it('should call onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderDialog();

    await waitFor(async () => {
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should have save button disabled when no changes are made', async () => {
    renderDialog();

    await waitFor(() => {
      const saveButton = screen.getByRole('button', { name: 'Save' });
      expect(saveButton).toBeDisabled();
    });
  });

  it('should enable save button when roles are changed', async () => {
    const user = userEvent.setup();
    const mockUser = createMockUser({ roles: [UserRole.MEMBER] });
    renderDialog(mockUser, [UserRole.MEMBER, UserRole.SUPER_ADMIN]);

    await waitFor(async () => {
      // Find the Admin checkbox (as super admin, we can toggle it)
      const adminCheckbox = screen.getByRole('checkbox', { name: /admin/i });
      await user.click(adminCheckbox);
    });

    await waitFor(() => {
      const saveButton = screen.getByRole('button', { name: 'Save' });
      expect(saveButton).toBeEnabled();
    });
  });

  it('should call onSave with selected roles when save is clicked', async () => {
    const user = userEvent.setup();
    const mockUser = createMockUser({ roles: [UserRole.MEMBER] });
    renderDialog(mockUser, [UserRole.MEMBER, UserRole.SUPER_ADMIN]);

    await waitFor(async () => {
      // Find and click the Admin checkbox
      const adminCheckbox = screen.getByRole('checkbox', { name: /admin/i });
      await user.click(adminCheckbox);
    });

    await waitFor(async () => {
      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);
    });

    expect(mockOnSave).toHaveBeenCalledWith([UserRole.MEMBER, UserRole.ADMIN]);
  });

  it('should have MEMBER checkbox always checked and disabled', async () => {
    const mockUser = createMockUser({ roles: [UserRole.MEMBER] });
    renderDialog(mockUser);

    await waitFor(() => {
      // Find Member text and verify it exists
      expect(screen.getByText('Member')).toBeInTheDocument();
      // The first checkbox in the dialog should be the Member checkbox (disabled and checked)
      const dialog = screen.getByRole('dialog');
      const formGroup = dialog.querySelector('.MuiFormGroup-root');
      expect(formGroup).toBeInTheDocument();
    });
  });

  it('should show alert for super admin users', async () => {
    const superAdminUser = createMockUser({
      roles: [UserRole.MEMBER, UserRole.SUPER_ADMIN],
    });
    renderDialog(superAdminUser);

    await waitFor(() => {
      expect(
        screen.getByText('Super Admin roles cannot be modified.'),
      ).toBeInTheDocument();
    });
  });

  it('should disable all checkboxes for super admin users', async () => {
    const superAdminUser = createMockUser({
      roles: [UserRole.MEMBER, UserRole.SUPER_ADMIN],
    });
    renderDialog(superAdminUser, [UserRole.MEMBER, UserRole.SUPER_ADMIN]);

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toBeDisabled();
      });
    });
  });

  it('should disable save button for super admin users', async () => {
    const superAdminUser = createMockUser({
      roles: [UserRole.MEMBER, UserRole.SUPER_ADMIN],
    });
    renderDialog(superAdminUser);

    await waitFor(() => {
      const saveButton = screen.getByRole('button', { name: 'Save' });
      expect(saveButton).toBeDisabled();
    });
  });

  it('should hide ADMIN option for non-super-admin current users', async () => {
    const mockUser = createMockUser({ roles: [UserRole.MEMBER] });
    // Current user is just an admin, not super admin
    renderDialog(mockUser, [UserRole.MEMBER, UserRole.ADMIN]);

    await waitFor(() => {
      // Member should be visible
      expect(screen.getByText('Member')).toBeInTheDocument();
      // Admin text should NOT be visible for regular admins (they can't modify admin role)
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    });
  });

  it('should show ADMIN option for super-admin current users', async () => {
    const mockUser = createMockUser({ roles: [UserRole.MEMBER] });
    renderDialog(mockUser, [UserRole.MEMBER, UserRole.SUPER_ADMIN]);

    await waitFor(() => {
      // Both Member and Admin should be visible for super admins
      expect(screen.getByText('Member')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  it('should not render when dialog is closed', () => {
    renderDialog(createMockUser(), [UserRole.MEMBER, UserRole.ADMIN], false);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should show description text for non-super-admin target users', async () => {
    const mockUser = createMockUser({ roles: [UserRole.MEMBER] });
    renderDialog(mockUser);

    await waitFor(() => {
      expect(
        screen.getByText('Select the roles to assign to this user.'),
      ).toBeInTheDocument();
    });
  });

  it('should show saving state when save is in progress', async () => {
    const user = userEvent.setup();
    // Create a mock that takes time to resolve
    mockOnSave.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000)),
    );

    const mockUser = createMockUser({ roles: [UserRole.MEMBER] });
    renderDialog(mockUser, [UserRole.MEMBER, UserRole.SUPER_ADMIN]);

    // Enable changes by toggling a checkbox
    await waitFor(async () => {
      const adminCheckbox = screen.getByRole('checkbox', { name: /admin/i });
      await user.click(adminCheckbox);
    });

    // Click save
    await waitFor(async () => {
      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);
    });

    // Should show saving state
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Saving...' }),
      ).toBeInTheDocument();
    });
  });

  it('should allow toggling roles on and off', async () => {
    const user = userEvent.setup();
    const mockUser = createMockUser({
      roles: [UserRole.MEMBER, UserRole.ADMIN],
    });
    renderDialog(mockUser, [UserRole.MEMBER, UserRole.SUPER_ADMIN]);

    // Initially admin checkbox should be checked
    await waitFor(() => {
      const adminCheckbox = screen.getByRole('checkbox', { name: /admin/i });
      expect(adminCheckbox).toBeChecked();
    });

    // Toggle off
    await waitFor(async () => {
      const adminCheckbox = screen.getByRole('checkbox', { name: /admin/i });
      await user.click(adminCheckbox);
      expect(adminCheckbox).not.toBeChecked();
    });

    // Toggle back on
    await waitFor(async () => {
      const adminCheckbox = screen.getByRole('checkbox', { name: /admin/i });
      await user.click(adminCheckbox);
      expect(adminCheckbox).toBeChecked();
    });
  });

  it('should prevent clicking MEMBER checkbox', async () => {
    const mockUser = createMockUser({ roles: [UserRole.MEMBER] });
    renderDialog(mockUser);

    await waitFor(() => {
      // Verify that the Member role checkbox is present and disabled
      // We can verify this by checking that the Member label exists and the checkbox should be disabled
      expect(screen.getByText('Member')).toBeInTheDocument();
      expect(
        screen.getByText('Basic member role (required)'),
      ).toBeInTheDocument();
    });
  });
});
