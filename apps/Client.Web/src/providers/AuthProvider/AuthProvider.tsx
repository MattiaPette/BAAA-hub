import {
  FunctionComponent,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react';

import Keycloak from 'keycloak-js';
import {
  AuthClient,
  AuthContextValue,
  AuthErrorCode,
  AuthProviderProps,
  AuthToken,
  TokenPayload,
} from './AuthProvider.model';

const AUTH_TOKEN_FIELD = 'auth_token';
const REFRESH_TOKEN_INTERVAL = 60 * 1000; // Refresh every 60 seconds (Keycloak handles timing)
const CHECK_TOKEN_EXPIRATION_INTERVAL = 30 * 1000;

// Init
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

/**
 * Parse JWT token to extract payload
 */
const parseJwt = (token: string): TokenPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    );
    return JSON.parse(jsonPayload) as TokenPayload;
  } catch {
    return null;
  }
};

/**
 * AuthProvider — creates and provides an authentication context to descendants.
 *
 * Builds a Keycloak client from the provided props, exposes helpers
 * (authenticate, login, logout), persists tokens to localStorage when
 * available and keeps track of loading state, the current token, user
 * permissions and token expiration. The component itself is synchronous
 * (a React component) but triggers asynchronous auth operations inside the
 * provided helpers (e.g. `authenticate`, `login`).
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Child components wrapped by the provider.
 * @param {string} props.url - Keycloak server URL (e.g., https://keycloak.example.com)
 * @param {string} props.realm - Keycloak realm name
 * @param {string} props.clientId - Keycloak client identifier
 *
 * @throws {Error} If any required prop is missing the component will throw during render.
 *
 * @returns {JSX.Element} A React provider element that supplies authentication state and methods to its children.
 *
 * Notes:
 * - The component reads and writes tokens to `window.localStorage` when available.
 * - It starts background timers to refresh the session and to check token expiration.
 * - Consumers should render this provider at the top-level of the app to
 *   make `useAuth()` available to descendants.
 *
 * @example
 * // Wrap your application with the provider:
 * // <AuthProvider
 * //   url="https://keycloak.example.com"
 * //   realm="baaa-hub"
 * //   clientId="baaa-hub-client"
 * // >
 * //   <App />
 * // </AuthProvider>
 */

export const AuthProvider: FunctionComponent<AuthProviderProps> = ({
  children,
  url,
  realm,
  clientId,
}) => {
  if (!url || !realm || !clientId) {
    // eslint-disable-next-line functional/no-throw-statements
    throw new Error('AuthProvider requires all props to be provided.');
  }

  const keycloakRef = useRef<Keycloak | null>(null);
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [initialized, setInitialized] = useState(false);

  const [localStorageAvailable, setLocalStorageAvailable] =
    useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(true);

  const [token, setToken] = useState<AuthToken | null>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(AUTH_TOKEN_FIELD);
        return stored ? (JSON.parse(stored) as AuthToken) : null;
      }
    } catch {
      // Ignore errors
    }
    return null;
  });

  const userPermissions = useMemo<string[]>(() => {
    if (token) {
      return token.idTokenPayload?.db_roles || [];
    }
    return [];
  }, [token]);

  /**
   * Save the auth token and update local authentication state.
   */
  const saveAuthToken = useCallback(
    (authToken: AuthToken | null) => {
      if (localStorageAvailable) {
        if (authToken) {
          window.localStorage.setItem(
            AUTH_TOKEN_FIELD,
            JSON.stringify(authToken),
          );
        } else {
          window.localStorage.removeItem(AUTH_TOKEN_FIELD);
        }
        setToken(authToken);
      }
      setLoading(false);
    },
    [localStorageAvailable],
  );

  /**
   * Update token state from Keycloak instance
   */
  const updateTokenFromKeycloak = useCallback(
    (kc: Keycloak) => {
      if (kc.authenticated && kc.token && kc.idToken) {
        const idTokenPayload = parseJwt(kc.idToken);
        const authToken: AuthToken = {
          accessToken: kc.token,
          idToken: kc.idToken,
          refreshToken: kc.refreshToken,
          idTokenPayload: idTokenPayload || undefined,
        };
        saveAuthToken(authToken);
      } else {
        saveAuthToken(null);
      }
    },
    [saveAuthToken],
  );

  /**
   * Initialize Keycloak
   */
  useEffect(() => {
    if (keycloakRef.current || initialized) {
      return;
    }

    const kc = new Keycloak({
      url,
      realm,
      clientId,
    });

    // eslint-disable-next-line functional/immutable-data
    keycloakRef.current = kc;

    // Handle token refresh events
    // eslint-disable-next-line functional/immutable-data
    kc.onTokenExpired = () => {
      kc.updateToken(30)
        .then(refreshed => {
          if (refreshed) {
            updateTokenFromKeycloak(kc);
          }
        })
        .catch(() => {
          // Token refresh failed, clear auth
          saveAuthToken(null);
        });
    };

    // eslint-disable-next-line functional/immutable-data
    kc.onAuthSuccess = () => {
      updateTokenFromKeycloak(kc);
    };

    // eslint-disable-next-line functional/immutable-data
    kc.onAuthError = () => {
      saveAuthToken(null);
    };

    // eslint-disable-next-line functional/immutable-data
    kc.onAuthLogout = () => {
      saveAuthToken(null);
    };

    // Initialize Keycloak - check if user is already logged in
    kc.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
      checkLoginIframe: false,
      pkceMethod: 'S256',
    })
      .then(authenticated => {
        setKeycloak(kc);
        setInitialized(true);
        if (authenticated) {
          updateTokenFromKeycloak(kc);
        } else {
          setLoading(false);
        }
      })
      .catch(error => {
        console.error('Keycloak initialization error:', error);
        setKeycloak(kc);
        setInitialized(true);
        setLoading(false);
      });
  }, [
    url,
    realm,
    clientId,
    initialized,
    updateTokenFromKeycloak,
    saveAuthToken,
  ]);

  /**
   * Authenticate - process callback URL or check existing session
   */
  const authenticate = useCallback<AuthContextValue['authenticate']>(
    ({ onErrorCallback }) => {
      if (!keycloak) {
        onErrorCallback?.(AuthErrorCode.INVALID_CONFIGURATION);
        return;
      }

      setLoading(true);

      // Check if we're on a callback URL
      const urlParams = new URLSearchParams(window.location.search);
      const hasCode = urlParams.has('code');
      const hasError = urlParams.has('error');

      if (hasError) {
        const error = urlParams.get('error');
        console.error('Authentication error:', error);
        setLoading(false);
        onErrorCallback?.(error as AuthErrorCode);
        // Clean up URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
        return;
      }

      if (hasCode) {
        // Let Keycloak process the callback - it's already done in init
        // Just update the state
        if (keycloak.authenticated) {
          updateTokenFromKeycloak(keycloak);
          // Clean up URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        } else {
          setLoading(false);
          onErrorCallback?.(AuthErrorCode.INVALID_TOKEN);
        }
      } else if (keycloak.authenticated) {
        // No code in URL, just check current state
        updateTokenFromKeycloak(keycloak);
      } else {
        setLoading(false);
      }
    },
    [keycloak, updateTokenFromKeycloak],
  );

  /**
   * Login — perform authentication via Keycloak redirect.
   *
   * Note: With Keycloak, we use the redirect flow. Email/password
   * are handled by Keycloak's login page, not directly.
   */
  const login = useCallback<AuthContextValue['login']>(
    ({ email, onErrorCallback }) => {
      if (!keycloak) {
        onErrorCallback?.(AuthErrorCode.INVALID_CONFIGURATION);
        return;
      }

      // Redirect to Keycloak login page with email hint
      keycloak.login({
        loginHint: email,
        redirectUri: `${window.location.origin}/login/callback`,
      });
    },
    [keycloak],
  );

  /**
   * Signup — redirect to Keycloak registration page.
   *
   * With Keycloak, registration is handled via the Keycloak registration page.
   */
  const signup = useCallback<AuthContextValue['signup']>(
    ({ email, onErrorCallback }) => {
      if (!keycloak) {
        onErrorCallback?.(AuthErrorCode.INVALID_CONFIGURATION);
        return;
      }

      // Redirect to Keycloak registration page
      keycloak.register({
        loginHint: email,
        redirectUri: `${window.location.origin}/login/callback`,
      });
    },
    [keycloak],
  );

  /**
   * Logs the user out by removing the access token and redirecting to Keycloak logout.
   */
  const logout = useCallback<AuthContextValue['logout']>(() => {
    if (localStorageAvailable) {
      window.localStorage.removeItem(AUTH_TOKEN_FIELD);
      setToken(null);
    }

    if (keycloak && keycloak.authenticated) {
      keycloak.logout({
        redirectUri: window.location.origin,
      });
    }

    setLoading(false);
  }, [localStorageAvailable, keycloak]);

  /**
   * Effect hook that checks for the availability of localStorage in the browser.
   */
  useEffect(() => {
    try {
      if (window.localStorage) {
        setLocalStorageAvailable(true);
      }
    } catch (e) {
      console.info('Cookies are not enabled on the website.');
      console.info(e);
      setLocalStorageAvailable(false);
    }
  }, []);

  /**
   * Effect hook that periodically refreshes the authentication session.
   */
  useEffect(() => {
    if (!keycloak || !keycloak.authenticated) {
      return undefined;
    }

    const interval = setInterval(() => {
      keycloak
        .updateToken(30)
        .then(refreshed => {
          if (refreshed) {
            updateTokenFromKeycloak(keycloak);
          }
        })
        .catch(() => {
          // Token refresh failed, log out
          logout();
        });
    }, REFRESH_TOKEN_INTERVAL);

    return () => clearInterval(interval);
  }, [keycloak, logout, updateTokenFromKeycloak]);

  /**
   * Effect hook that periodically checks token expiration.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (token) {
        if (
          !!token.idTokenPayload?.exp &&
          token.idTokenPayload.exp * 1000 < new Date().getTime()
        ) {
          logout();
        }
      }
    }, CHECK_TOKEN_EXPIRATION_INTERVAL);

    return () => clearInterval(interval);
  }, [logout, token]);

  const isAuthenticated = useMemo(
    () =>
      !!token &&
      !!token.idTokenPayload?.exp &&
      token.idTokenPayload.exp * 1000 > new Date().getTime(),
    [token],
  );

  const authClientData: AuthClient = useMemo(
    () => ({
      url,
      realm,
      clientId,
    }),
    [url, realm, clientId],
  );

  const value = useMemo(
    () => ({
      authClientData,
      keycloak,
      authenticate,
      token,
      userPermissions,
      login,
      signup,
      logout,
      isAuthenticated,
      isLoading: loading,
      setLoading,
      localStorageAvailable,
    }),
    [
      authClientData,
      keycloak,
      authenticate,
      isAuthenticated,
      loading,
      localStorageAvailable,
      login,
      signup,
      logout,
      token,
      userPermissions,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook function that provides the value of the authentication context.
 * Must be used within an AuthProvider, otherwise it will throw an error.
 *
 * @returns {NonNullable<AuthContextValue>} The value of the authentication context.
 * @throws {Error} If the function is used outside of an AuthProvider.
 *
 * @example
 * const authContext = useAuth();
 */
export const useAuth = (): NonNullable<AuthContextValue> => {
  const context = useContext(AuthContext);

  if (!context) {
    // eslint-disable-next-line functional/no-throw-statements
    throw new Error('useAuth must be used within a AuthProvider');
  }

  return context;
};
