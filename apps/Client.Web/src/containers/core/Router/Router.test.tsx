import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { renderWithProviders as render } from '../../../test-utils';
import { Router } from './Router';
import { BreadcrumProvider } from '../../../providers/BreadcrumProvider/BreadcrumProvider';
import * as AuthProviderModule from '../../../providers/AuthProvider/AuthProvider';
import * as UserProviderModule from '../../../providers/UserProvider/UserProvider';

// Mock the UserProvider module
vi.mock('../../../providers/UserProvider/UserProvider', () => ({
  useUser: vi.fn(),
  UserProvider: ({ children }: Readonly<{ children: React.ReactNode }>) =>
    children,
}));

describe('Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for useUser - user has profile
    vi.mocked(UserProviderModule.useUser).mockReturnValue({
      user: null,
      hasProfile: true,
      isLoading: false,
      error: null,
      refreshUser: vi.fn(),
      setUser: vi.fn(),
    });
  });

  it('should render Loader when localStorage is not available', () => {
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      localStorageAvailable: false,
      login: vi.fn(),
      logout: vi.fn(),
      authenticate: vi.fn(),
      token: null,
      userPermissions: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as unknown as any);

    const { container } = render(
      <MemoryRouter>
        <Router />
      </MemoryRouter>,
    );

    // Loader should be visible
    expect(
      container.querySelector('.MuiCircularProgress-root'),
    ).toBeInTheDocument();
  });

  it('should render unauthenticated routes when not authenticated', async () => {
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      localStorageAvailable: true,
      login: vi.fn(),
      logout: vi.fn(),
      authenticate: vi.fn(),
      token: null,
      userPermissions: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(
      <MemoryRouter initialEntries={['/']}>
        <Router />
      </MemoryRouter>,
    );

    // Should redirect to login
    await waitFor(() => {
      expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument();
    });
  });

  it('should redirect to login for unknown routes when not authenticated', async () => {
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      localStorageAvailable: true,
      login: vi.fn(),
      logout: vi.fn(),
      authenticate: vi.fn(),
      token: null,
      userPermissions: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(
      <MemoryRouter initialEntries={['/unknown-route']}>
        <Router />
      </MemoryRouter>,
    );

    // Should redirect to login page
    await waitFor(() => {
      expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument();
    });
  });

  it('should render authenticated routes when authenticated', async () => {
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      localStorageAvailable: true,
      login: vi.fn(),
      logout: vi.fn(),
      authenticate: vi.fn(),
      token: {
        idTokenPayload: {
          name: 'Test User',
          email: 'test@example.com',
        },
      },
      userPermissions: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    vi.mocked(UserProviderModule.useUser).mockReturnValue({
      user: null,
      hasProfile: true,
      isLoading: false,
      error: null,
      refreshUser: vi.fn(),
      setUser: vi.fn(),
    });

    const { container } = render(
      <BreadcrumProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Router />
        </MemoryRouter>
      </BreadcrumProvider>,
    );

    // Should render authenticated content
    await waitFor(() => {
      expect(container.textContent).toMatch(/dashboard/i);
    });
  });

  it('should redirect to dashboard for unknown routes when authenticated', async () => {
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      localStorageAvailable: true,
      login: vi.fn(),
      logout: vi.fn(),
      authenticate: vi.fn(),
      token: {
        idTokenPayload: {
          name: 'Test User',
          email: 'test@example.com',
        },
      },
      userPermissions: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    vi.mocked(UserProviderModule.useUser).mockReturnValue({
      user: null,
      hasProfile: true,
      isLoading: false,
      error: null,
      refreshUser: vi.fn(),
      setUser: vi.fn(),
    });

    const { container } = render(
      <BreadcrumProvider>
        <MemoryRouter initialEntries={['/unknown']}>
          <Router />
        </MemoryRouter>
      </BreadcrumProvider>,
    );

    // Should redirect to dashboard
    await waitFor(() => {
      expect(container.textContent).toMatch(/dashboard/i);
    });
  });

  it('should allow navigation to settings when authenticated', async () => {
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      localStorageAvailable: true,
      login: vi.fn(),
      logout: vi.fn(),
      authenticate: vi.fn(),
      token: {
        idTokenPayload: {
          name: 'Test User',
          email: 'test@example.com',
        },
      },
      userPermissions: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    vi.mocked(UserProviderModule.useUser).mockReturnValue({
      user: null,
      hasProfile: true,
      isLoading: false,
      error: null,
      refreshUser: vi.fn(),
      setUser: vi.fn(),
    });

    const { container } = render(
      <BreadcrumProvider>
        <MemoryRouter initialEntries={['/settings']}>
          <Router />
        </MemoryRouter>
      </BreadcrumProvider>,
    );

    await waitFor(() => {
      expect(container.textContent).toMatch(/settings/i);
    });
  });

  it('should redirect to profile setup when authenticated but no profile', async () => {
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      localStorageAvailable: true,
      login: vi.fn(),
      logout: vi.fn(),
      authenticate: vi.fn(),
      token: {
        idTokenPayload: {
          name: 'Test User',
          email: 'test@example.com',
        },
      },
      userPermissions: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    vi.mocked(UserProviderModule.useUser).mockReturnValue({
      user: null,
      hasProfile: false,
      isLoading: false,
      error: null,
      refreshUser: vi.fn(),
      setUser: vi.fn(),
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Router />
      </MemoryRouter>,
    );

    // Should show profile setup
    await waitFor(() => {
      expect(container.textContent).toMatch(/complete your profile/i);
    });
  });
});
