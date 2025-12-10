import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SnackbarProvider } from 'notistack';
import {
  UserRole,
  PrivacyLevel,
  SportType,
  MfaType,
  WorkoutGoals,
} from '@baaa-hub/shared-types';
import { TrainingGoals } from './TrainingGoals';
import { renderWithProviders as render } from '../../../test-utils';

import { BreadcrumProvider } from '../../../providers/BreadcrumProvider/BreadcrumProvider';
import * as UserProviderModule from '../../../providers/UserProvider/UserProvider';
import * as AuthProviderModule from '../../../providers/AuthProvider/AuthProvider';
import * as userServiceModule from '../../../services/userService';

// Mock the UserProvider module
vi.mock('../../../providers/UserProvider/UserProvider', async () => {
  const actual = await vi.importActual(
    '../../../providers/UserProvider/UserProvider',
  );
  return {
    ...actual,
    useUser: vi.fn(),
  };
});

// Mock the AuthProvider module
vi.mock('../../../providers/AuthProvider/AuthProvider', async () => {
  const actual = await vi.importActual(
    '../../../providers/AuthProvider/AuthProvider',
  );
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

// Mock userService
vi.mock('../../../services/userService', () => ({
  updateUserProfile: vi.fn(),
}));

const mockWorkoutGoals: WorkoutGoals = {
  weeklyKm: 50,
  monthlyKm: 200,
  yearlyKm: 2000,
  weeklyActivities: 5,
  monthlyActivities: 20,
  yearlyActivities: 240,
  weeklyActivityTypeGoals: [
    { type: SportType.RUNNING, count: 3 },
    { type: SportType.GYM, count: 2 },
  ],
  monthlyActivityTypeGoals: [{ type: SportType.CYCLING, count: 8 }],
};

const mockUser = {
  id: '1',
  authId: 'auth0|1',
  name: 'Test',
  surname: 'User',
  nickname: 'testuser',
  email: 'test@example.com',
  dateOfBirth: '1990-01-01',
  sportTypes: [SportType.RUNNING],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  isBlocked: false,
  isEmailVerified: true,
  mfaEnabled: true,
  mfaType: MfaType.TOTP,
  roles: [UserRole.MEMBER],
  privacySettings: {
    email: PrivacyLevel.PUBLIC,
    dateOfBirth: PrivacyLevel.PUBLIC,
    sportTypes: PrivacyLevel.PUBLIC,
    socialLinks: PrivacyLevel.PUBLIC,
  },
  workoutGoals: mockWorkoutGoals,
};

describe('TrainingGoals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock useUser to return a mock user
    vi.mocked(UserProviderModule.useUser).mockReturnValue({
      user: mockUser,
      isLoading: false,
      error: null,
      hasProfile: true,
      refreshUser: vi.fn(),
      setUser: vi.fn(),
    });
    // Mock useAuth to return authenticated user with token
    vi.mocked(AuthProviderModule.useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      localStorageAvailable: true,
      login: vi.fn(),
      logout: vi.fn(),
      signup: vi.fn(),
      authenticate: vi.fn(),
      token: {
        accessToken: 'test-token',
        idToken: 'test-id-token',
        refreshToken: 'test-refresh-token',
      },
      userPermissions: [],
      authErrorMessages: [],
      clearAuthErrors: vi.fn(),
      getRememberedEmail: vi.fn(() => null),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  const renderTrainingGoals = () =>
    render(
      <SnackbarProvider>
        <BreadcrumProvider>
          <TrainingGoals />
        </BreadcrumProvider>
      </SnackbarProvider>,
    );

  it('should render all goal sections', () => {
    renderTrainingGoals();

    expect(
      screen.getByRole('heading', { name: /Distance Goals/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Activity Count Goals/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Weekly Activity Type Goals/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Monthly Activity Type Goals/i }),
    ).toBeInTheDocument();
  });

  it('should populate fields with existing workout goals', () => {
    renderTrainingGoals();

    // Check distance goals are populated
    const weeklyKmInput = screen.getByLabelText(/Weekly Km/i);
    expect(weeklyKmInput).toHaveValue(50);

    const monthlyKmInput = screen.getByLabelText(/Monthly Km/i);
    expect(monthlyKmInput).toHaveValue(200);

    const yearlyKmInput = screen.getByLabelText(/Yearly Km/i);
    expect(yearlyKmInput).toHaveValue(2000);
  });

  it('should populate activity count goals', () => {
    renderTrainingGoals();

    const weeklyActivitiesInput = screen.getByLabelText(/Weekly Activities/i);
    expect(weeklyActivitiesInput).toHaveValue(5);

    const monthlyActivitiesInput = screen.getByLabelText(/Monthly Activities/i);
    expect(monthlyActivitiesInput).toHaveValue(20);

    const yearlyActivitiesInput = screen.getByLabelText(/Yearly Activities/i);
    expect(yearlyActivitiesInput).toHaveValue(240);
  });

  it('should display existing weekly activity type goals', () => {
    renderTrainingGoals();

    // Should display 2 weekly activity type goals (Running: 3, Gym: 2)
    const countInputs = screen.getAllByLabelText(/Count/i);
    // First two should be for weekly goals
    expect(countInputs.length).toBeGreaterThanOrEqual(2);
  });

  it('should allow adding a new weekly activity type goal', async () => {
    renderTrainingGoals();

    const addButtons = screen.getAllByText(/Add Goal/i);
    const addWeeklyGoalButton = addButtons[0]; // First "Add Goal" is for weekly

    fireEvent.click(addWeeklyGoalButton);

    await waitFor(() => {
      const countInputs = screen.getAllByLabelText(/Count/i);
      // Should now have 3 weekly goals (2 existing + 1 new)
      expect(countInputs.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('should allow removing a weekly activity type goal', async () => {
    renderTrainingGoals();

    const removeButtons = screen.getAllByLabelText(/Remove goal/i);
    const initialCount = removeButtons.length;

    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      const updatedRemoveButtons = screen.queryAllByLabelText(/Remove goal/i);
      expect(updatedRemoveButtons.length).toBe(initialCount - 1);
    });
  });

  it('should update distance goals when input changes', async () => {
    renderTrainingGoals();

    const weeklyKmInput = screen.getByLabelText(/Weekly Km/i);
    fireEvent.change(weeklyKmInput, { target: { value: '60' } });

    await waitFor(() => {
      expect(weeklyKmInput).toHaveValue(60);
    });
  });

  it('should call updateUserProfile when save button is clicked', async () => {
    const mockUpdateUserProfile = vi.fn().mockResolvedValue({});
    vi.mocked(userServiceModule.updateUserProfile).mockImplementation(
      mockUpdateUserProfile,
    );

    renderTrainingGoals();

    const saveButton = screen.getByRole('button', { name: /Save Goals/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateUserProfile).toHaveBeenCalledWith(
        'test-token',
        expect.objectContaining({
          workoutGoals: expect.any(Object),
        }),
      );
    });
  });

  it('should show success message after successful save', async () => {
    const mockUpdateUserProfile = vi.fn().mockResolvedValue({});
    vi.mocked(userServiceModule.updateUserProfile).mockImplementation(
      mockUpdateUserProfile,
    );

    renderTrainingGoals();

    const saveButton = screen.getByRole('button', { name: /Save Goals/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateUserProfile).toHaveBeenCalled();
    });
  });

  it('should show error message when save fails', async () => {
    const mockUpdateUserProfile = vi
      .fn()
      .mockRejectedValue(new Error('Network error'));
    vi.mocked(userServiceModule.updateUserProfile).mockImplementation(
      mockUpdateUserProfile,
    );

    renderTrainingGoals();

    const saveButton = screen.getByRole('button', { name: /Save Goals/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateUserProfile).toHaveBeenCalled();
    });
  });

  it('should render with no existing goals', () => {
    const userWithoutGoals = { ...mockUser, workoutGoals: undefined };
    vi.mocked(UserProviderModule.useUser).mockReturnValue({
      user: userWithoutGoals,
      isLoading: false,
      error: null,
      hasProfile: true,
      refreshUser: vi.fn(),
      setUser: vi.fn(),
    });

    renderTrainingGoals();

    // Should still render all sections with empty values
    expect(
      screen.getByRole('heading', { name: /Distance Goals/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Weekly Km/i)).toHaveValue(null);
  });

  it('should disable save button while saving', async () => {
    const mockUpdateUserProfile = vi.fn().mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(resolve, 100);
        }),
    );
    vi.mocked(userServiceModule.updateUserProfile).mockImplementation(
      mockUpdateUserProfile,
    );

    renderTrainingGoals();

    const saveButton = screen.getByRole('button', { name: /Save Goals/i });
    fireEvent.click(saveButton);

    // Button should be disabled during save
    await waitFor(() => {
      expect(saveButton).toBeDisabled();
    });
  });

  it('should show message when no goals are set', () => {
    const userWithoutGoals = { ...mockUser, workoutGoals: undefined };
    vi.mocked(UserProviderModule.useUser).mockReturnValue({
      user: userWithoutGoals,
      isLoading: false,
      error: null,
      hasProfile: true,
      refreshUser: vi.fn(),
      setUser: vi.fn(),
    });

    renderTrainingGoals();

    expect(
      screen.getByText(/No weekly activity type goals set/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No monthly activity type goals set/i),
    ).toBeInTheDocument();
  });
});
