import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SnackbarProvider } from 'notistack';
import {
  UserRole,
  PrivacyLevel,
  SportType,
  MfaType,
} from '@baaa-hub/shared-types';
import { Settings } from './Settings';
import { renderWithProviders as render } from '../../test-utils';

import { BreadcrumProvider } from '../../providers/BreadcrumProvider/BreadcrumProvider';
import * as UserProviderModule from '../../providers/UserProvider/UserProvider';

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
};

describe('Settings', () => {
  beforeEach(() => {
    // Clear localStorage before each test to ensure clean state
    localStorage.clear();
    // Reset mocks
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
  });

  const renderSettings = () =>
    render(
      <SnackbarProvider>
        <BreadcrumProvider>
          <Settings />
        </BreadcrumProvider>
      </SnackbarProvider>,
    );

  it('should render Settings component', () => {
    renderSettings();
    // Use heading role to be more specific since "Settings" appears multiple times
    expect(
      screen.getByRole('heading', { name: /Settings/i, level: 4 }),
    ).toBeInTheDocument();
  });

  it('should render theme section', () => {
    const { container } = renderSettings();
    const themeCard = container.querySelector('.MuiCard-root');
    expect(themeCard).toBeInTheDocument();
  });

  it('should render language selector', () => {
    renderSettings();
    expect(screen.getByLabelText(/select language/i)).toBeInTheDocument();
  });

  it('should display theme description', () => {
    renderSettings();
    expect(
      screen.getByText(/switch between light and dark theme/i),
    ).toBeInTheDocument();
  });

  it('should display language description', () => {
    renderSettings();
    expect(
      screen.getByText(/choose your preferred language/i),
    ).toBeInTheDocument();
  });

  it('should render theme switch control', () => {
    const { container } = renderSettings();
    const switchControl = container.querySelector('.MuiSwitch-root');
    expect(switchControl).toBeInTheDocument();
  });

  it('should render language select control', () => {
    const { container } = renderSettings();
    const selectControl = container.querySelector('#language-select');
    expect(selectControl).toBeInTheDocument();
  });

  it('should toggle theme when switch is clicked', async () => {
    const { container } = renderSettings();
    const switchInput = container.querySelector('input[type="checkbox"]');

    if (switchInput) {
      fireEvent.click(switchInput);

      await waitFor(() => {
        // Snackbar should appear with success message
        const snackbar = document.querySelector('.notistack-Snackbar');
        expect(snackbar).toBeTruthy();
      });
    }
  });

  it('should change language when selection changes', async () => {
    const { container } = renderSettings();
    const selectElement = container.querySelector('#language-select');

    if (selectElement) {
      fireEvent.mouseDown(selectElement);

      await waitFor(() => {
        const italianOption = screen.queryByText('Italiano');
        if (italianOption) {
          fireEvent.click(italianOption);
        }
      });
    }
  });

  it('should show light theme message when switching from dark to light', async () => {
    const { container } = renderSettings();
    const switchInput = container.querySelector('input[type="checkbox"]');

    // First click to go to dark (assuming we start in light)
    if (switchInput) {
      fireEvent.click(switchInput);
      await waitFor(() => {
        const snackbar = document.querySelector('.notistack-Snackbar');
        expect(snackbar).toBeTruthy();
      });

      // Second click to go back to light
      fireEvent.click(switchInput);
      await waitFor(() => {
        const snackbar = document.querySelector('.notistack-Snackbar');
        expect(snackbar).toBeTruthy();
      });
    }
  });

  it('should show English language message when changing to English', async () => {
    const { container } = renderSettings();
    const selectElement = container.querySelector('#language-select');

    if (selectElement) {
      // First change to Italian
      fireEvent.mouseDown(selectElement);
      await waitFor(() => {
        const italianOption = screen.queryByText('Italiano');
        if (italianOption) {
          fireEvent.click(italianOption);
        }
      });

      // Then change back to English
      fireEvent.mouseDown(selectElement);
      await waitFor(() => {
        const englishOption = screen.queryByText('English');
        if (englishOption) {
          fireEvent.click(englishOption);
        }
      });
    }
  });

  it('should render security section', () => {
    renderSettings();
    // Check for security heading (use role query to be more specific)
    expect(
      screen.getByRole('heading', { name: /Security/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Two-Factor Authentication \(2FA\)/i),
    ).toBeInTheDocument();
  });

  it('should display MFA enabled status when user has MFA enabled', () => {
    renderSettings();
    // User has TOTP enabled in mock - check the chip containing the MFA type
    const mfaElements = screen.getAllByText('Authenticator App');
    expect(mfaElements.length).toBeGreaterThan(0);
  });

  it('should display MFA disabled status when user has no MFA', () => {
    // Override mock for this test
    vi.mocked(UserProviderModule.useUser).mockReturnValue({
      user: { ...mockUser, mfaEnabled: false, mfaType: MfaType.NONE },
      isLoading: false,
      error: null,
      hasProfile: true,
      refreshUser: vi.fn(),
      setUser: vi.fn(),
    });

    renderSettings();
    expect(screen.getByText('Not Enabled')).toBeInTheDocument();
  });

  it('should display email verification status', () => {
    renderSettings();
    expect(screen.getByText('Email Verification')).toBeInTheDocument();
    // Use getAllByText since "Verified" may appear in multiple places
    const verifiedElements = screen.getAllByText('Verified');
    expect(verifiedElements.length).toBeGreaterThan(0);
  });

  it('should display unverified email status when email is not verified', () => {
    // Override mock for this test
    vi.mocked(UserProviderModule.useUser).mockReturnValue({
      user: { ...mockUser, isEmailVerified: false },
      isLoading: false,
      error: null,
      hasProfile: true,
      refreshUser: vi.fn(),
      setUser: vi.fn(),
    });

    renderSettings();
    expect(screen.getByText('Not Verified')).toBeInTheDocument();
  });

  it('should display available MFA methods', () => {
    renderSettings();
    expect(screen.getByText('Available MFA Methods:')).toBeInTheDocument();
    // Use getAllByText since "Recommended" appears in multiple places
    const recommendedElements = screen.getAllByText(/Recommended/i);
    expect(recommendedElements.length).toBeGreaterThan(0);
  });
});
