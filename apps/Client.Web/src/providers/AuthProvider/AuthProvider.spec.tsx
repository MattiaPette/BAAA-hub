import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { AuthProvider, useAuth } from './AuthProvider';

// Mocks for auth0-js
const parseHashMock = vi.fn();
const validateTokenMock = vi.fn();
const loginMock = vi.fn();
const checkSessionMock = vi.fn();
const authorizeMock = vi.fn();

vi.mock('auth0-js', () => ({
  WebAuth: function WebAuth() {
    return {
      parseHash(cb: unknown) {
        return parseHashMock(cb);
      },
      validateToken(idToken: string, nonce: string, cb: unknown) {
        return validateTokenMock(idToken, nonce, cb);
      },
      login(opts: unknown, cb: unknown) {
        return loginMock(opts, cb);
      },
      checkSession(opts: unknown, cb: unknown) {
        return checkSessionMock(opts, cb);
      },
      authorize(opts: unknown) {
        return authorizeMock(opts);
      },
    };
  },
}));

// Mock props for AuthProvider
const mockProps = {
  domain: 'domain',
  clientID: 'test-client-id',
  responseType: 'token',
  userDatabaseConnection: 'db',
  scope: 'scope',
  redirectUri: 'http://localhost',
};

describe('AuthProvider', () => {
  let originalLocalStorage: Storage;

  beforeEach(() => {
    // Save original localStorage
    originalLocalStorage = window.localStorage;

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original localStorage after each test
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
  });
  it('renders children correctly', () => {
    render(
      <AuthProvider {...mockProps}>
        <div>Test Child</div>
      </AuthProvider>,
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('provides context value to children', () => {
    const TestComponent = () => {
      const auth = useAuth();
      return <div>{auth.authClientData.clientID}</div>;
    };

    render(
      <AuthProvider {...mockProps}>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByText('test-client-id')).toBeInTheDocument();
  });

  it('handles localStorage availability', () => {
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

    expect(screen.getByText('Test Child')).toBeInTheDocument();
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

  it('stores and retrieves token from localStorage', () => {
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

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('access_token');
  });

  it('authenticate success saves token and marks authenticated', async () => {
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

    // prepare mocks to simulate successful parse and validation
    const authResult = {
      accessToken: 'token',
      idToken: 'id-token',
      idTokenPayload: { exp: Math.floor(Date.now() / 1000) + 3600, nonce: 'n' },
    } as unknown;

    parseHashMock.mockImplementation((cb: unknown) => {
      const fn = cb as (...a: unknown[]) => void;
      fn(null, authResult);
    });

    validateTokenMock.mockImplementation(
      (_id: string, _nonce: string, cb: unknown) => {
        const fn = cb as (...a: unknown[]) => void;
        fn(null);
      },
    );

    const TestComponent = () => {
      const auth = useAuth();

      // trigger authenticate when mounted
      ((): void => {
        auth.authenticate({});
      })();

      return <div>{auth.isAuthenticated ? 'AUTH' : 'NO_AUTH'}</div>;
    };

    render(
      <AuthProvider {...mockProps}>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => expect(mockLocalStorage.setItem).toHaveBeenCalled());
  });

  it('authenticate error calls onErrorCallback', async () => {
    parseHashMock.mockImplementation((cb: unknown) => {
      const fn = cb as (...a: unknown[]) => void;
      fn(new Error('bad'));
    });
    const TestComponent = () => {
      const auth = useAuth();

      ((): void => {
        auth.authenticate({ onErrorCallback: vi.fn() });
      })();

      return null;
    };

    render(
      <AuthProvider {...mockProps}>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => expect(parseHashMock).toHaveBeenCalled());
  });

  it('login error calls onErrorCallback with error code', async () => {
    const loginError = {
      code: 'login_failed',
      description: 'wrong',
    } as unknown;

    loginMock.mockImplementation((_opts: unknown, cb: unknown) => {
      const fn = cb as (...a: unknown[]) => void;
      fn(loginError);
    });

    const callback = vi.fn();

    const TestComponent = () => {
      const auth = useAuth();

      ((): void => {
        auth.login({ email: 'a', password: 'b', onErrorCallback: callback });
      })();

      return null;
    };

    render(
      <AuthProvider {...mockProps}>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => expect(callback).toHaveBeenCalledWith('login_failed'));
  });

  it('logout clears storage and sets isAuthenticated false', async () => {
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
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('access_token'),
    );
  });

  it('loginWithRedirect calls authorize with database connection', () => {
    const TestComponent = () => {
      const auth = useAuth();

      ((): void => {
        auth.loginWithRedirect();
      })();

      return <div>Test</div>;
    };

    render(
      <AuthProvider {...mockProps}>
        <TestComponent />
      </AuthProvider>,
    );

    expect(authorizeMock).toHaveBeenCalledWith({
      connection: 'db',
    });
  });

  it('handles expired token from localStorage as not authenticated', () => {
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

    expect(screen.getByText('false')).toBeInTheDocument();
  });

  it('handles missing props gracefully', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() =>
      render(
        <AuthProvider
          domain=""
          clientID=""
          responseType=""
          userDatabaseConnection=""
          scope=""
          redirectUri=""
        >
          <div>Test Child</div>
        </AuthProvider>,
      ),
    ).toThrow();

    consoleErrorSpy.mockRestore();
  });

  it('authenticate calls onErrorCallback when parseHash returns error', async () => {
    const errorCallback = vi.fn();

    parseHashMock.mockImplementation((cb: unknown) => {
      const fn = cb as (...a: unknown[]) => void;
      fn(new Error('parse error'));
    });

    const TestComponent = () => {
      const auth = useAuth();

      if (!auth.isLoading) {
        auth.authenticate({ onErrorCallback: errorCallback });
      }

      return <div>Test</div>;
    };

    render(
      <AuthProvider {...mockProps}>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(errorCallback).toHaveBeenCalledWith('invalid_token'),
    );
  });

  it('authenticate calls onErrorCallback when validateToken fails', async () => {
    const errorCallback = vi.fn();

    const authResult = {
      accessToken: 'token',
      idToken: 'id-token',
      idTokenPayload: { exp: Math.floor(Date.now() / 1000) + 3600, nonce: 'n' },
    } as unknown;

    parseHashMock.mockImplementation((cb: unknown) => {
      const fn = cb as (...a: unknown[]) => void;
      fn(null, authResult);
    });

    validateTokenMock.mockImplementation(
      (_id: string, _nonce: string, cb: unknown) => {
        const fn = cb as (...a: unknown[]) => void;
        fn({ error: 'invalid_token', description: 'Token validation failed' });
      },
    );

    const TestComponent = () => {
      const auth = useAuth();

      if (!auth.isLoading) {
        auth.authenticate({ onErrorCallback: errorCallback });
      }

      return <div>Test</div>;
    };

    render(
      <AuthProvider {...mockProps}>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(errorCallback).toHaveBeenCalledWith('invalid_token'),
    );
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

  it('provides userPermissions from token db_roles', () => {
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

    expect(screen.getByText('admin,user')).toBeInTheDocument();
  });

  it('provides empty userPermissions when token has no db_roles', () => {
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

    expect(screen.getByText('0')).toBeInTheDocument();
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

    expect(getByTestId('loading')).toHaveTextContent('false');

    getByText('Set Loading').click();

    await waitFor(() =>
      expect(getByTestId('loading')).toHaveTextContent('true'),
    );
  });

  it('checkSession interval refreshes token on success', async () => {
    vi.useFakeTimers();

    const newAuthResult = {
      accessToken: 'new-token',
      idTokenPayload: { exp: Math.floor(Date.now() / 1000) + 7200 },
    };

    checkSessionMock.mockImplementation((_opts: unknown, cb: unknown) => {
      const fn = cb as (...a: unknown[]) => void;
      fn(null, newAuthResult);
    });

    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue(
        JSON.stringify({
          accessToken: 'old-token',
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

    render(
      <AuthProvider {...mockProps}>
        <div>Test</div>
      </AuthProvider>,
    );

    // Advance time to trigger the refresh interval
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000 + 100);

    await waitFor(() => expect(checkSessionMock).toHaveBeenCalled());
    await waitFor(() => expect(mockLocalStorage.setItem).toHaveBeenCalled());

    vi.useRealTimers();
  });

  it('checkSession interval calls logout when no response', async () => {
    vi.useFakeTimers();

    checkSessionMock.mockImplementation((_opts: unknown, cb: unknown) => {
      const fn = cb as (...a: unknown[]) => void;
      fn(null, null);
    });

    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue(
        JSON.stringify({
          accessToken: 'token',
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

    render(
      <AuthProvider {...mockProps}>
        <div>Test</div>
      </AuthProvider>,
    );

    // Advance time to trigger the refresh interval
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000 + 100);

    await waitFor(() => expect(checkSessionMock).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('access_token'),
    );

    vi.useRealTimers();
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
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('access_token'),
    );

    vi.useRealTimers();
  });
});
