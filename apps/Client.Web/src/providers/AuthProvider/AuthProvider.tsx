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
import { getErrorDescription } from '../../helpers/getErrorDescription/getErrorDescription';

import {
  AuthClient,
  AuthContextValue,
  AuthErrorCode,
  AuthProviderProps,
  AuthToken,
  TokenPayload,
} from './AuthProvider.model';

const AUTH_TOKEN_FIELD = 'auth_token';
const REMEMBERED_EMAIL_FIELD = 'remembered_email';
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
 * Map Keycloak error responses to AuthErrorCode
 *
 * Keycloak returns different error descriptions for various scenarios:
 * - "Invalid user credentials" - Wrong username/password
 * - "Account disabled" - User account is disabled
 * - "Account locked" - Too many failed login attempts
 * - "Account is not fully set up" - Missing required profile fields (Keycloak 23+)
 * - "Verify email" / "email not verified" - Email verification required
 * - "Required action" - User must complete required actions (e.g., update profile, accept terms)
 * - "Account expired" / "User expired" - Account has expired
 */
const mapKeycloakError = (
  error: string,
  errorDescription?: string,
): AuthErrorCode => {
  const descLower = errorDescription?.toLowerCase() ?? '';

  // Handle OAuth2 standard errors
  switch (error) {
    case 'invalid_grant':
      // Check error description for more specific error - order matters as
      // some patterns may overlap; more specific patterns are checked first
      if (descLower.includes('invalid user credentials')) {
        return AuthErrorCode.INVALID_USER_PASSWORD;
      }
      if (descLower.includes('account disabled')) {
        return AuthErrorCode.BLOCKED_USER;
      }
      if (descLower.includes('account locked')) {
        return AuthErrorCode.TOO_MANY_ATTEMPTS;
      }
      // Account setup incomplete (Keycloak 23+ requires first/last name by default)
      if (descLower.includes('not fully set up')) {
        return AuthErrorCode.ACCOUNT_NOT_FULLY_SET_UP;
      }
      // Email verification required
      if (
        descLower.includes('verify email') ||
        descLower.includes('email not verified')
      ) {
        return AuthErrorCode.EMAIL_NOT_VERIFIED;
      }
      // User must complete required actions before login
      if (descLower.includes('required action')) {
        return AuthErrorCode.ACTION_REQUIRED;
      }
      // Account has expired
      if (
        descLower.includes('account expired') ||
        descLower.includes('user expired')
      ) {
        return AuthErrorCode.ACCOUNT_EXPIRED;
      }
      return AuthErrorCode.INVALID_GRANT;
    case 'invalid_client':
      return AuthErrorCode.UNAUTHORIZED_CLIENT;
    case 'invalid_request':
      return AuthErrorCode.INVALID_REQUEST;
    case 'unauthorized_client':
      return AuthErrorCode.UNAUTHORIZED_CLIENT;
    case 'invalid_scope':
      return AuthErrorCode.INVALID_SCOPE;
    case 'access_denied':
      return AuthErrorCode.ACCESS_DENIED;
    case 'temporarily_unavailable':
      return AuthErrorCode.TEMPORARILY_UNAVAILABLE;
    case 'server_error':
      return AuthErrorCode.SERVER_ERROR;
    default:
      return AuthErrorCode.UNKNOWN_ERROR;
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
  const [authErrorMessages, setAuthErrorMessages] = useState<string[]>([]);

  const clearAuthErrors = useCallback(() => {
    setAuthErrorMessages([]);
  }, []);

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
      // Don't call setLoading(false) here - let the calling function manage loading state
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
    // We removed the timestamp query param because it causes the Service Worker
    // to fall back to index.html (the app) instead of serving the static file.
    const silentCheckSsoRedirectUri = `${window.location.origin}${import.meta.env.BASE_URL}silent-check-sso.html`;

    // CRITICAL SAFETY CHECK:
    // If this React application is running inside the silent-check-sso iframe,
    // it means the Service Worker served index.html instead of the static file.
    // We must abort initialization to prevent errors and infinite loops.
    if (
      window.parent !== window &&
      window.location.href.includes('silent-check-sso.html')
    ) {
      console.error(
        'CRITICAL: The React App is running inside the Silent Check SSO iframe. ' +
          'This means the Service Worker is serving index.html instead of the static silent-check-sso.html file. ' +
          'Please check your vite-plugin-pwa configuration to exclude this file from navigation fallback.',
      );
      return;
    }

    kc.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri,
      checkLoginIframe: false,
      pkceMethod: 'S256',
    })
      .then(authenticated => {
        setKeycloak(kc);
        setInitialized(true);
        if (authenticated) {
          updateTokenFromKeycloak(kc);
        } else {
          // Check if we have tokens in localStorage from a previous password grant login
          const storedToken = token;
          if (
            storedToken &&
            storedToken.accessToken &&
            storedToken.idToken &&
            storedToken.refreshToken
          ) {
            // Check if token is still valid
            const isValid =
              !!storedToken.idTokenPayload?.exp &&
              storedToken.idTokenPayload.exp * 1000 > new Date().getTime();

            if (isValid) {
              // Sync tokens with Keycloak instance for token refresh to work
              // eslint-disable-next-line functional/immutable-data
              kc.token = storedToken.accessToken;
              // eslint-disable-next-line functional/immutable-data
              kc.idToken = storedToken.idToken;
              // eslint-disable-next-line functional/immutable-data
              kc.refreshToken = storedToken.refreshToken;
              // eslint-disable-next-line functional/immutable-data
              kc.authenticated = true;
              // Token is already set, just finish loading
              setLoading(false);
            } else {
              // Token expired, clear it
              saveAuthToken(null);
              setLoading(false);
            }
          } else {
            setLoading(false);
          }
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
    token,
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
   * Login — perform authentication via Keycloak Resource Owner Password Credentials flow.
   *
   * This uses the Keycloak token endpoint directly to authenticate with email/password,
   * providing an embedded login experience without redirecting to Keycloak's login page.
   */
  const login = useCallback<AuthContextValue['login']>(
    async ({
      email,
      password,
      rememberMe,
      onSuccessCallback,
      onErrorCallback,
    }) => {
      if (!url || !realm || !clientId) {
        onErrorCallback?.(AuthErrorCode.INVALID_CONFIGURATION);
        return;
      }

      setLoading(true);

      try {
        const tokenEndpoint = `${url}/realms/${realm}/protocol/openid-connect/token`;

        const formData = new URLSearchParams();
        formData.append('grant_type', 'password');
        formData.append('client_id', clientId);
        formData.append('username', email);
        formData.append('password', password);
        formData.append('scope', 'openid profile email');

        const response = await fetch(tokenEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = (await response.json()) as {
            error?: string;
            error_description?: string;
          };
          const errorCode = mapKeycloakError(
            errorData.error || 'unknown_error',
            errorData.error_description,
          );
          const errorMessage = getErrorDescription({ errorCode });
          setAuthErrorMessages([errorMessage]);
          setLoading(false);
          onErrorCallback?.(errorCode);
          return;
        }

        const tokenResponse = (await response.json()) as {
          access_token: string;
          id_token: string;
          refresh_token: string;
          expires_in: number;
          token_type: string;
        };

        const idTokenPayload = parseJwt(tokenResponse.id_token);

        const authToken: AuthToken = {
          accessToken: tokenResponse.access_token,
          idToken: tokenResponse.id_token,
          refreshToken: tokenResponse.refresh_token,
          idTokenPayload: idTokenPayload || undefined,
        };

        // Handle "Remember Me" functionality
        if (localStorageAvailable) {
          if (rememberMe) {
            window.localStorage.setItem(REMEMBERED_EMAIL_FIELD, email);
          } else {
            window.localStorage.removeItem(REMEMBERED_EMAIL_FIELD);
          }
        }

        // Sync tokens with Keycloak instance for token refresh to work
        if (keycloak) {
          // eslint-disable-next-line functional/immutable-data
          keycloak.token = tokenResponse.access_token;
          // eslint-disable-next-line functional/immutable-data
          keycloak.idToken = tokenResponse.id_token;
          // eslint-disable-next-line functional/immutable-data
          keycloak.refreshToken = tokenResponse.refresh_token;
          // eslint-disable-next-line functional/immutable-data
          keycloak.authenticated = true;
        }

        setAuthErrorMessages([]); // Clear errors on successful login
        saveAuthToken(authToken);
        setLoading(false);
        onSuccessCallback?.();
      } catch (error) {
        setLoading(false);
        // Distinguish between network errors and other errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
          onErrorCallback?.(AuthErrorCode.NETWORK_ERROR);
        } else if (error instanceof SyntaxError) {
          // JSON parsing error from unexpected response format
          onErrorCallback?.(AuthErrorCode.SERVER_ERROR);
        } else {
          onErrorCallback?.(AuthErrorCode.NETWORK_ERROR);
        }
      }
    },
    [url, realm, clientId, saveAuthToken, localStorageAvailable, keycloak],
  );

  /**
   * Signup — create a new user via backend API.
   *
   * This calls the backend registration endpoint to create a new user account.
   * The backend is responsible for communicating with Keycloak Admin API
   * to create the user.
   *
   * Note: This requires a backend endpoint at /api/auth/register that handles
   * user registration with Keycloak.
   */
  const signup = useCallback<AuthContextValue['signup']>(
    async ({ email, password, onSuccessCallback, onErrorCallback }) => {
      if (!url || !realm || !clientId) {
        onErrorCallback?.(AuthErrorCode.INVALID_CONFIGURATION);
        return;
      }

      setLoading(true);

      try {
        const apiBaseUrl =
          import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            username: email, // Use email as username
          }),
        });

        if (!response.ok) {
          const errorData = (await response.json().catch(() => ({}))) as {
            error?: string;
            message?: string;
            code?: string;
          };

          setLoading(false);

          // Map error responses
          if (
            errorData.code === 'USER_EXISTS' ||
            errorData.message?.toLowerCase().includes('already exists') ||
            errorData.message?.toLowerCase().includes('user exists')
          ) {
            onErrorCallback?.(AuthErrorCode.USER_EXISTS);
            return;
          }

          if (
            errorData.code === 'USERNAME_EXISTS' ||
            errorData.message?.toLowerCase().includes('username')
          ) {
            onErrorCallback?.(AuthErrorCode.USERNAME_EXISTS);
            return;
          }

          if (
            errorData.code === 'PASSWORD_POLICY' ||
            errorData.message?.toLowerCase().includes('password')
          ) {
            onErrorCallback?.(AuthErrorCode.PASSWORD_STRENGTH_ERROR);
            return;
          }

          // Handle 404 - endpoint not implemented
          if (response.status === 404) {
            onErrorCallback?.(AuthErrorCode.INVALID_SIGNUP);
            return;
          }

          onErrorCallback?.(AuthErrorCode.UNKNOWN_ERROR);
          return;
        }

        setLoading(false);
        onSuccessCallback?.();
      } catch (error) {
        setLoading(false);
        if (error instanceof TypeError) {
          onErrorCallback?.(AuthErrorCode.NETWORK_ERROR);
        } else {
          onErrorCallback?.(AuthErrorCode.UNKNOWN_ERROR);
        }
      }
    },
    [url, realm, clientId],
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

  /**
   * Get the remembered email from localStorage
   */
  const getRememberedEmail = useCallback(() => {
    if (!localStorageAvailable) {
      return null;
    }
    try {
      return window.localStorage.getItem(REMEMBERED_EMAIL_FIELD);
    } catch {
      return null;
    }
  }, [localStorageAvailable]);

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
      authErrorMessages,
      clearAuthErrors,
      getRememberedEmail,
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
      authErrorMessages,
      clearAuthErrors,
      getRememberedEmail,
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
