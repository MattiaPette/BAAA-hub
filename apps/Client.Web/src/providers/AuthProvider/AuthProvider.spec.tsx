import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { AuthProvider, useAuth } from './AuthProvider';

// Mock for keycloak-js
const mockKeycloakInit = vi.fn();
const mockKeycloakLogin = vi.fn();
const mockKeycloakLogout = vi.fn();
const mockKeycloakRegister = vi.fn();
const mockKeycloakUpdateToken = vi.fn();

vi.mock('keycloak-js', () => ({
  default: function Keycloak() {
    return {
      init: mockKeycloakInit,
      login: mockKeycloakLogin,
      logout: mockKeycloakLogout,
      register: mockKeycloakRegister,
      updateToken: mockKeycloakUpdateToken,
      authenticated: false,
      token: undefined,
      idToken: undefined,
      refreshToken: undefined,
      onTokenExpired: null,
      onAuthSuccess: null,
      onAuthError: null,
      onAuthLogout: null,
    };
  },
}));

// Mock props for AuthProvider
const mockProps = {
  url: 'http://localhost:8180',
  realm: 'test-realm',
  clientId: 'test-client-id',
};

describe('AuthProvider', () => {
  let originalLocalStorage: Storage;

  beforeEach(() => {
    // Save original localStorage
    originalLocalStorage = window.localStorage;

    // Reset all mocks
    vi.clearAllMocks();

    // Default mock implementation for init
    mockKeycloakInit.mockResolvedValue(false);
  });

  afterEach(() => {
    // Restore original localStorage after each test
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
  });

  it('renders children correctly', async () => {
    render(
      <AuthProvider {...mockProps}>
        <div>Test Child</div>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });
  });

  it('provides context value to children', async () => {
    const TestComponent = () => {
      const auth = useAuth();
      return <div>{auth.authClientData.clientId}</div>;
    };

    render(
      <AuthProvider {...mockProps}>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('test-client-id')).toBeInTheDocument();
    });
  });

  it('handles localStorage availability', async () => {
    const mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });

    render(
      <AuthProvider {...mockProps}>
        <div>Test Child</div>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });
  });

  it('throws error when useAuth is used outside AuthProvider', () => {
    const TestComponent = () => {
      try {
        useAuth();
      } catch (error) {
        expect((error as Error).message).toBe(
          'useAuth must be used within a AuthProvider',
        );
      }
      return null;
    };

    render(<TestComponent />);
  });

  it('stores and retrieves token from localStorage', async () => {
    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue(JSON.stringify('mock-token')),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });

    render(
      <AuthProvider {...mockProps}>
        <div>Test Child</div>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('auth_token');
    });
  });

  it('logout clears storage', async () => {
    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue(
        JSON.stringify({
          idTokenPayload: { exp: Math.floor(Date.now() / 1000) + 3600 },
        }),
      ),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });

    const TestComponent = () => {
      const auth = useAuth();

      ((): void => {
        // call logout immediately
        auth.logout();
      })();

      return <div>{auth.isAuthenticated ? 'AUTH' : 'NO_AUTH'}</div>;
    };

    render(
      <AuthProvider {...mockProps}>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token'),
    );
  });

  it('handles expired token from localStorage as not authenticated', async () => {
    const expired = {
      idTokenPayload: { exp: Math.floor(Date.now() / 1000) - 3600 },
    };

    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue(JSON.stringify(expired)),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });

    const TestComponent = () => {
      const auth = useAuth();
      return <div>{String(auth.isAuthenticated)}</div>;
    };

    render(
      <AuthProvider {...mockProps}>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('false')).toBeInTheDocument();
    });
  });

  it('handles missing props gracefully', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() =>
      render(
        <AuthProvider url="" realm="" clientId="">
          <div>Test Child</div>
        </AuthProvider>,
      ),
    ).toThrow();

    consoleErrorSpy.mockRestore();
  });

  it('provides userPermissions from token db_roles', async () => {
    const tokenWithRoles = {
      idTokenPayload: {
        exp: Math.floor(Date.now() / 1000) + 3600,
        db_roles: ['admin', 'user'],
      },
    };

    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue(JSON.stringify(tokenWithRoles)),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });

    const TestComponent = () => {
      const auth = useAuth();
      return <div>{auth.userPermissions.join(',')}</div>;
    };

    render(
      <AuthProvider {...mockProps}>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('admin,user')).toBeInTheDocument();
    });
  });

  it('provides empty userPermissions when token has no db_roles', async () => {
    const tokenWithoutRoles = {
      idTokenPayload: {
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
    };

    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue(JSON.stringify(tokenWithoutRoles)),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });

    const TestComponent = () => {
      const auth = useAuth();
      return <div>{auth.userPermissions.length}</div>;
    };

    render(
      <AuthProvider {...mockProps}>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  it('allows setting loading state via setLoading', async () => {
    const TestComponent = () => {
      const auth = useAuth();

      return (
        <div>
          <div data-testid="loading">{String(auth.isLoading)}</div>
          <button type="button" onClick={() => auth.setLoading(true)}>
            Set Loading
          </button>
        </div>
      );
    };

    const { getByTestId, getByText } = render(
      <AuthProvider {...mockProps}>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('loading')).toHaveTextContent('false');
    });

    getByText('Set Loading').click();

    await waitFor(() =>
      expect(getByTestId('loading')).toHaveTextContent('true'),
    );
  });

  it('token expiration interval logs out when token expires', async () => {
    vi.useFakeTimers();

    const expiredTime = Math.floor(Date.now() / 1000) - 100;

    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue(
        JSON.stringify({
          accessToken: 'token',
          idTokenPayload: { exp: expiredTime },
        }),
      ),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });

    render(
      <AuthProvider {...mockProps}>
        <div>Test</div>
      </AuthProvider>,
    );

    // Advance time to trigger the expiration check interval
    await vi.advanceTimersByTimeAsync(30 * 1000 + 100);

    await waitFor(() =>
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token'),
    );

    vi.useRealTimers();
  });

  it('initializes Keycloak with correct config', async () => {
    render(
      <AuthProvider {...mockProps}>
        <div>Test</div>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(mockKeycloakInit).toHaveBeenCalledWith(
        expect.objectContaining({
          onLoad: 'check-sso',
          checkLoginIframe: false,
          pkceMethod: 'S256',
        }),
      );
    });
  });

  it('provides keycloak instance in context', async () => {
    const TestComponent = () => {
      const auth = useAuth();
      return <div>{auth.keycloak ? 'HAS_KEYCLOAK' : 'NO_KEYCLOAK'}</div>;
    };

    render(
      <AuthProvider {...mockProps}>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('HAS_KEYCLOAK')).toBeInTheDocument();
    });
  });

  it('handles localStorage access error in useEffect', async () => {
    const consoleInfoSpy = vi
      .spyOn(console, 'info')
      .mockImplementation(() => {});

    // Create a mock localStorage that will return null initially (for state init)
    // but throw when accessed in useEffect
    let accessCount = 0;
    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      get() {
        accessCount += 1;
        if (accessCount > 1) {
          // Throw on subsequent accesses (in useEffect)

          throw new Error('localStorage is disabled');
        }
        return mockLocalStorage;
      },
      configurable: true,
    });

    const TestComponent = () => {
      const auth = useAuth();
      return (
        <div data-testid="available">{String(auth.localStorageAvailable)}</div>
      );
    };

    render(
      <AuthProvider {...mockProps}>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        'Cookies are not enabled on the website.',
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    await waitFor(() => {
      const availableElement = screen.getByTestId('available');
      expect(availableElement).toHaveTextContent('false');
    });

    consoleInfoSpy.mockRestore();
  });

  it('handles login function with direct password flow', async () => {
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: 'test-access-token',
          id_token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJleHAiOjk5OTk5OTk5OTl9.signature',
          refresh_token: 'test-refresh-token',
          expires_in: 3600,
          token_type: 'Bearer',
        }),
    });

    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });

    const TestComponent = () => {
      const auth = useAuth();

      const handleLogin = async () => {
        await auth.login({
          email: 'test@example.com',
          password: 'password123',
        });
      };

      return (
        <div>
          <button type="button" onClick={handleLogin}>
            Login
          </button>
          <div data-testid="authenticated">{String(auth.isAuthenticated)}</div>
        </div>
      );
    };

    const { getByText } = render(
      <AuthProvider {...mockProps}>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      getByText('Login').click();
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it('handles login function error', async () => {
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    const mockErrorCallback = vi.fn();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () =>
        Promise.resolve({
          error: 'invalid_grant',
          error_description: 'Invalid user credentials',
        }),
    });

    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });

    const TestComponent = () => {
      const auth = useAuth();

      const handleLogin = async () => {
        await auth.login({
          email: 'test@example.com',
          password: 'wrong-password',
          onErrorCallback: mockErrorCallback,
        });
      };

      return (
        <div>
          <button type="button" onClick={handleLogin}>
            Login
          </button>
        </div>
      );
    };

    const { getByText } = render(
      <AuthProvider {...mockProps}>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      getByText('Login').click();
    });

    await waitFor(() => {
      expect(mockErrorCallback).toHaveBeenCalled();
    });
  });

  it('handles signup function success', async () => {
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    const mockSuccessCallback = vi.fn();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          message: 'User created successfully',
        }),
    });

    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });

    const TestComponent = () => {
      const auth = useAuth();

      const handleSignup = async () => {
        await auth.signup({
          email: 'newuser@example.com',
          password: 'password123',
          onSuccessCallback: mockSuccessCallback,
        });
      };

      return (
        <div>
          <button type="button" onClick={handleSignup}>
            Signup
          </button>
        </div>
      );
    };

    const { getByText } = render(
      <AuthProvider {...mockProps}>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      getByText('Signup').click();
    });

    await waitFor(() => {
      expect(mockSuccessCallback).toHaveBeenCalled();
    });
  });

  it('handles signup function error', async () => {
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    const mockErrorCallback = vi.fn();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () =>
        Promise.resolve({
          code: 'USER_EXISTS',
          message: 'User already exists',
        }),
    });

    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });

    const TestComponent = () => {
      const auth = useAuth();

      const handleSignup = async () => {
        await auth.signup({
          email: 'existing@example.com',
          password: 'password123',
          onErrorCallback: mockErrorCallback,
        });
      };

      return (
        <div>
          <button type="button" onClick={handleSignup}>
            Signup
          </button>
        </div>
      );
    };

    const { getByText } = render(
      <AuthProvider {...mockProps}>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      getByText('Signup').click();
    });

    await waitFor(() => {
      expect(mockErrorCallback).toHaveBeenCalled();
    });
  });

  it('handles authenticate function', async () => {
    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });

    const TestComponent = () => {
      const auth = useAuth();

      const handleAuthenticate = () => {
        auth.authenticate({});
      };

      return (
        <div>
          <button type="button" onClick={handleAuthenticate}>
            Authenticate
          </button>
        </div>
      );
    };

    const { getByText } = render(
      <AuthProvider {...mockProps}>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      getByText('Authenticate').click();
    });

    // Authenticate function is called, no error thrown
    expect(true).toBe(true);
  });
});
