import {
  FunctionComponent,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';

import { Auth0DecodedHash, WebAuth } from 'auth0-js';
import {
  AuthClient,
  AuthContextValue,
  AuthErrorCode,
  AuthProviderProps,
  AuthToken,
} from './AuthProvider.model';

const AUTH_TOKEN_FIELD = 'auth_token';
const REFRESH_TOKEN_INTERVAL = 60 * 60 * 1000;
const CHECK_TOKEN_EXPIRATION_INTERVAL = 30 * 1000;

// Init
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

/**
 * AuthProvider — creates and provides an authentication context to descendants.
 *
 * Builds an Auth0 WebAuth client from the provided props, exposes helpers
 * (authenticate, login, logout), persists tokens to localStorage when
 * available and keeps track of loading state, the current token, user
 * permissions and token expiration. The component itself is synchronous
 * (a React component) but triggers asynchronous auth operations inside the
 * provided helpers (e.g. `authenticate`, `login`).
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Child components wrapped by the provider.
 * @param {string} props.domain - Auth0 domain (for example `your-tenant.auth0.com`).
 * @param {string} props.clientID - Auth0 client identifier.
 * @param {string} props.responseType - Response type to request (for example `token id_token`).
 * @param {string} props.userDatabaseConnection - Auth0 database connection (realm) used for username/password logins.
 * @param {string} props.scope - Requested scopes (for example `openid profile email`).
 * @param {string} props.redirectUri - Redirect URI used after authentication (must match configured application settings).
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
 * //   domain="example.auth0.com"
 * //   clientID="your-client-id"
 * //   responseType="token id_token"
 * //   userDatabaseConnection="Username-Password-Authentication"
 * //   scope="openid profile email"
 * //   redirectUri="https://app.example.com/callback"
 * // >
 * //   <App />
 * // </AuthProvider>
 */

export const AuthProvider: FunctionComponent<AuthProviderProps> = ({
  children,
  domain,
  clientID,
  responseType,
  userDatabaseConnection,
  scope,
  redirectUri,
}) => {
  if (
    !domain ||
    !clientID ||
    !responseType ||
    !userDatabaseConnection ||
    !scope ||
    !redirectUri
  ) {
    // eslint-disable-next-line functional/no-throw-statements
    throw new Error('AuthProvider requires all props to be provided.');
  }

  const auth = useMemo(
    () =>
      new WebAuth({
        domain,
        clientID,
        responseType,
        scope,
        redirectUri,
      }),
    [domain, clientID, responseType, scope, redirectUri],
  );

  const [localStorageAvailable, setLocalStorageAvailable] =
    useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);

  const [token, setToken] = useState<AuthToken | null>(
    localStorageAvailable
      ? JSON.parse(window.localStorage.getItem(AUTH_TOKEN_FIELD) || 'null')
      : null,
  );

  const userPermissions = useMemo<string[]>(() => {
    if (token) {
      return token.idTokenPayload?.db_roles || [];
    }
    return [];
  }, [token]);

  /**
   * Save the parsed auth token and update local authentication state.
   *
   * Persists the provided Auth0 decoded hash to `window.localStorage` when
   * available, updates React state (`token`, `userPermissions`) and clears
   * the loading flag. This function itself is synchronous.
   *
   * @function
   * @name saveAuthToken
   * @type {Function}
   *
   * @param {Readonly<Auth0DecodedHash>} authToken - The decoded Auth0 hash
   *   object (typically returned by `auth.parseHash()` / `checkSession()`).
   * @returns {void}
   *
   * @example
   * // Called after a successful parse/validation
   * saveAuthToken(authResult);
   */
  const saveAuthToken = useCallback(
    (accessToken: Readonly<Auth0DecodedHash>) => {
      if (localStorageAvailable) {
        window.localStorage.setItem(
          AUTH_TOKEN_FIELD,
          JSON.stringify(accessToken),
        );

        setToken(accessToken);
      }

      setLoading(false);
    },
    [localStorageAvailable],
  );

  /**
   * Parse and validate authentication tokens found in the URL hash.
   *
   * Parses the URL fragment produced by Auth0 after redirect, validates the
   * id token and, on success, saves the token via `saveAuthToken`. On
   * failure it calls the optional `onErrorCallback` with an `AuthErrorCode`.
   * This function triggers asynchronous work via the auth0 callbacks.
   *
   * @param {{ onErrorCallback?: (errorCode?: AuthErrorCode) => void }} params -
   *   Object with an optional error callback invoked when parsing/validation fails.
   * @param {(errorCode?: AuthErrorCode) => void} [params.onErrorCallback] -
   *   Callback that will be called with a mapped `AuthErrorCode` on failure.
   * @returns {void}
   * @example
   * // Example usage
   * authenticate({ onErrorCallback: code => { console.log(code); } });
   */
  const authenticate = useCallback<AuthContextValue['authenticate']>(
    ({ onErrorCallback }) => {
      setLoading(true);
      auth.parseHash((err, authResult) => {
        if (err) {
          console.error("Errore durante il parsing dell'hash:", err);
          setLoading(false);
          onErrorCallback?.(AuthErrorCode.INVALID_TOKEN);
        } else if (authResult && authResult.accessToken) {
          auth.validateToken(
            authResult.idToken || '',
            authResult.idTokenPayload.nonce || '',
            validationErr => {
              if (validationErr) {
                console.error('Token non valido:', validationErr);
                setLoading(false);
                onErrorCallback?.(validationErr.error as AuthErrorCode);
              } else {
                saveAuthToken(authResult);
              }
            },
          );
        }
      });
    },
    [auth, saveAuthToken],
  );

  /**
   * Login — perform username/password authentication using Auth0 realm.
   *
   * Delegates credential authentication to the Auth0 `auth.login()` method.
   * The function triggers asynchronous work via Auth0 callbacks and will
   * call the optional `onErrorCallback` with a mapped `AuthErrorCode` when
   * an authentication error occurs.
   *
   * @param {{ email: string; password: string; onErrorCallback?: (errorCode?: AuthErrorCode) => void }} params -
   *   Object containing login credentials and an optional error callback.
   * @param {string} params.email - The user's email or username.
   * @param {string} params.password - The user's password.
   * @param {(errorCode?: AuthErrorCode) => void} [params.onErrorCallback] -
   *   Callback invoked with an `AuthErrorCode` in case of failure.
   * @returns {void}
   * @example
   * // Example usage
   * login({ email: 'alice@example.com', password: 'secret', onErrorCallback: code => { console.log(code); } });
   */
  const login = useCallback<AuthContextValue['login']>(
    ({ email, password, onErrorCallback }) => {
      auth.login(
        {
          email,
          password,
          realm: userDatabaseConnection,
          responseType,
        },
        err => {
          if (err) {
            console.error("Errore nell'autenticazione:", err.description);
            onErrorCallback?.(err.code as AuthErrorCode);
          }
        },
      );
    },
    [auth, responseType, userDatabaseConnection],
  );

  /**
   * Signup — register a new user using Auth0 database connection.
   *
   * Creates a new user account using Auth0's signup endpoint. After successful
   * registration, the user will need to log in with their credentials.
   * The function triggers asynchronous work via Auth0 callbacks and will
   * call the optional callbacks based on success or failure.
   *
   * @param {{ email: string; password: string; onSuccessCallback?: () => void; onErrorCallback?: (errorCode?: AuthErrorCode) => void }} params -
   *   Object containing signup credentials and optional callbacks.
   * @param {string} params.email - The user's email address.
   * @param {string} params.password - The user's password.
   * @param {() => void} [params.onSuccessCallback] -
   *   Callback invoked after successful signup.
   * @param {(errorCode?: AuthErrorCode) => void} [params.onErrorCallback] -
   *   Callback invoked with an `AuthErrorCode` in case of failure.
   * @returns {void}
   * @example
   * // Example usage
   * signup({ email: 'alice@example.com', password: 'secret', onSuccessCallback: () => { ... }, onErrorCallback: code => { console.log(code); } });
   */
  const signup = useCallback<AuthContextValue['signup']>(
    ({ email, password, onSuccessCallback, onErrorCallback }) => {
      auth.signup(
        {
          email,
          password,
          connection: userDatabaseConnection,
        },
        err => {
          if (err) {
            console.error('Errore nella registrazione:', err.description);
            onErrorCallback?.(err.code as AuthErrorCode);
          } else {
            onSuccessCallback?.();
          }
        },
      );
    },
    [auth, userDatabaseConnection],
  );

  /**
   * Login with redirect — initiates authentication via the Auth0 hosted login page.
   *
   * Redirects the user to the Auth0 Universal Login page for authentication.
   * This method is more reliable than cross-origin authentication (used by
   * `login()`) because it doesn't depend on third-party cookies, making it
   * work in browsers with strict privacy settings like Safari.
   *
   * After successful authentication, Auth0 redirects back to the configured
   * `redirectUri` with tokens in the URL hash, which are then processed by
   * the `authenticate()` function.
   *
   * @function
   * @name loginWithRedirect
   * @type {AuthContextValue['loginWithRedirect']}
   *
   * @returns {void}
   *
   * @example
   * loginWithRedirect();
   */
  const loginWithRedirect = useCallback<
    AuthContextValue['loginWithRedirect']
  >(() => {
    auth.authorize({
      connection: userDatabaseConnection,
    });
  }, [auth, userDatabaseConnection]);

  /**
   * Logs the user out by removing the access token from localStorage (if available)
   * and resetting the authentication state. Also sets the loading state to false.
   *
   * @function
   * @name logout
   * @type {AuthContextValue['logout']}
   *
   * @returns {void}
   *
   * @example
   * logout();
   */
  const logout = useCallback<AuthContextValue['logout']>(() => {
    // auth.logout({ returnTo: window.location.origin });

    if (localStorageAvailable) {
      window.localStorage.removeItem(AUTH_TOKEN_FIELD);
      setToken(null);
    }

    setLoading(false);
  }, [localStorageAvailable]);

  /**
   * Effect hook that checks for the availability of localStorage in the browser.
   * If available, it sets the `localStorageAvailable` state to true.
   * If not available (e.g., cookies or storage are disabled), it logs an informational message
   * and sets the state to false.
   *
   * @function
   * @returns {void}
   *
   * @example
   * useEffect(() => {
   * // Checks localStorage availability on component mount
   * }, []);
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
   * Effect hook that periodically refresh the authentication session.
   *
   * Starts an interval (every REFRESH_TOKEN_INTERVAL) that calls Auth0's
   * `checkSession()` to refresh tokens when a token is present. If a new
   * token is returned it is saved via `saveAuthToken`, otherwise the user
   * is logged out. The effect cleans up the interval on unmount.
   *
   * @returns {void}
   * @example
   * useEffect(() => {
   *   // Periodically refresh auth session while the provider is mounted
   * }, [auth, logout, saveAuthToken, token]);
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (token) {
        auth.checkSession({}, (_, res) => {
          if (res) {
            saveAuthToken(res);
          } else {
            logout();
          }
        });
      }
    }, REFRESH_TOKEN_INTERVAL);

    return () => clearInterval(interval);
  }, [auth, logout, saveAuthToken, token]);

  /**
   * Effect hook that periodically check token expiration and logout when expired.
   *
   * Starts an interval that checks the stored token's `exp` claim and
   * triggers `logout()` if the token is expired. The interval is cleared on
   * unmount. This helps to ensure stale tokens are removed promptly.
   *
   * @returns {void}
   * @example
   * useEffect(() => {
   *   // Periodically check token expiration while the provider is mounted
   * }, [auth, logout, saveAuthToken, token]);
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
  }, [auth, logout, saveAuthToken, token]);

  const isAuthenticated = useMemo(
    () =>
      !!token &&
      !!token.idTokenPayload?.exp &&
      token.idTokenPayload.exp * 1000 > new Date().getTime(),
    [token],
  );

  const authClientData: AuthClient = useMemo(
    () => ({
      domain,
      clientID,
      responseType,
      userDatabaseConnection,
      scope,
      redirectUri,
    }),
    [
      domain,
      clientID,
      responseType,
      userDatabaseConnection,
      scope,
      redirectUri,
    ],
  );

  const value = useMemo(
    () => ({
      authClientData,
      authenticate,
      token,
      userPermissions,
      login,
      signup,
      loginWithRedirect,
      logout,
      isAuthenticated,
      isLoading: loading,
      setLoading,
      localStorageAvailable,
    }),
    [
      authClientData,
      authenticate,
      isAuthenticated,
      loading,
      localStorageAvailable,
      login,
      signup,
      loginWithRedirect,
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
