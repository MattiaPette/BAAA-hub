import { screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { SnackbarProvider } from 'notistack';
import { renderWithProviders as render } from '../../test-utils';
import { ProfileSetup } from './ProfileSetup';
import * as AuthProviderModule from '../../providers/AuthProvider/AuthProvider';

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

    expect(screen.getByText('Complete Your Profile')).toBeInTheDocument();
  });

  it('should pre-fill email from token', () => {
    renderWithSnackbar(<ProfileSetup />);

    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('should pre-fill name from token', () => {
    renderWithSnackbar(<ProfileSetup />);

    const firstNameInput = screen.getByLabelText('First Name');
    expect(firstNameInput).toHaveValue('John');
  });

  it('should pre-fill surname from token when full name is provided', () => {
    renderWithSnackbar(<ProfileSetup />);

    const lastNameInput = screen.getByLabelText('Last Name');
    expect(lastNameInput).toHaveValue('Doe');
  });

  it('should have disabled email field when email is pre-filled', () => {
    renderWithSnackbar(<ProfileSetup />);

    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toBeDisabled();
  });

  it('should render form with all required fields', () => {
    renderWithSnackbar(<ProfileSetup />);

    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Nickname')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Date of Birth')).toBeInTheDocument();
    expect(screen.getByLabelText('Sport Types')).toBeInTheDocument();
  });

  it('should render optional social link fields', () => {
    renderWithSnackbar(<ProfileSetup />);

    expect(screen.getByLabelText('Strava Profile')).toBeInTheDocument();
    expect(screen.getByLabelText('Instagram Profile')).toBeInTheDocument();
  });

  it('should have empty nickname field initially', () => {
    renderWithSnackbar(<ProfileSetup />);

    const nicknameInput = screen.getByLabelText('Nickname');
    expect(nicknameInput).toHaveValue('');
  });

  it('should show complete setup button', () => {
    renderWithSnackbar(<ProfileSetup />);

    expect(
      screen.getByRole('button', { name: /complete setup/i }),
    ).toBeInTheDocument();
  });

  it('should render with no token provided', () => {
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
      setLoading: mockSetLoading,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    renderWithSnackbar(<ProfileSetup />);

    // Form should still render
    expect(screen.getByText('Complete Your Profile')).toBeInTheDocument();
    // Email should not be pre-filled or disabled
    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toHaveValue('');
    expect(emailInput).not.toBeDisabled();
  });

  it('should render with partial token (only email)', () => {
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      token: {
        idToken: 'test-id-token',
        idTokenPayload: {
          email: 'only@email.com',
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

    renderWithSnackbar(<ProfileSetup />);

    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toHaveValue('only@email.com');

    const firstNameInput = screen.getByLabelText('First Name');
    expect(firstNameInput).toHaveValue('');
  });

  it('should allow entering nickname', async () => {
    renderWithSnackbar(<ProfileSetup />);

    const nicknameInput = screen.getByLabelText('Nickname');
    fireEvent.change(nicknameInput, { target: { value: 'testuser' } });

    expect(nicknameInput).toHaveValue('testuser');
  });

  it('should allow entering date of birth', async () => {
    renderWithSnackbar(<ProfileSetup />);

    const dateInput = screen.getByLabelText('Date of Birth');
    fireEvent.change(dateInput, { target: { value: '1990-05-15' } });

    expect(dateInput).toHaveValue('1990-05-15');
  });

  it('should open sport types dropdown when clicked', async () => {
    renderWithSnackbar(<ProfileSetup />);

    const sportTypesSelect = screen.getByLabelText('Sport Types');
    fireEvent.mouseDown(sportTypesSelect);

    await waitFor(() => {
      expect(screen.getByText('Running')).toBeInTheDocument();
      expect(screen.getByText('Cycling')).toBeInTheDocument();
    });
  });

  it('should display form header and subtitle', () => {
    renderWithSnackbar(<ProfileSetup />);

    expect(screen.getByText('Complete Your Profile')).toBeInTheDocument();
    expect(
      screen.getByText('Set up your profile to get started'),
    ).toBeInTheDocument();
  });

  it('should display social links section label', () => {
    renderWithSnackbar(<ProfileSetup />);

    expect(screen.getByText('Social Links (Optional)')).toBeInTheDocument();
  });
});
