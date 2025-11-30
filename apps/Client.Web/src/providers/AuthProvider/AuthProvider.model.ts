import Keycloak from 'keycloak-js';
import {
  Dispatch,
  DispatchWithoutAction,
  ReactNode,
  SetStateAction,
} from 'react';

/**
 * Enumeration of possible authentication error codes.
 * These codes represent various authentication, authorization, and network errors
 * that can occur during the authentication flow.
 */
export enum AuthErrorCode {
  // Authentication errors
  /** Access was denied during authentication */
  ACCESS_DENIED = 'access_denied',
  /** User is not authorized to access the resource */
  UNAUTHORIZED = 'unauthorized',
  /** The provided authentication token is invalid */
  INVALID_TOKEN = 'invalid_token',
  /** Username or password is incorrect */
  INVALID_USER_PASSWORD = 'invalid_user_password',
  /** The password has been found in a data breach */
  PASSWORD_LEAKED = 'password_leaked',
  /** Account locked due to too many failed login attempts */
  TOO_MANY_ATTEMPTS = 'too_many_attempts',
  /** User account has been blocked */
  BLOCKED_USER = 'blocked_user',
  /** Sign up attempt is invalid */
  INVALID_SIGNUP = 'invalid_signup',
  /** A user with this email already exists */
  USER_EXISTS = 'user_exists',
  /** The username is already taken */
  USERNAME_EXISTS = 'username_exists',

  // Session and token errors
  /** Login is required to access this resource */
  LOGIN_REQUIRED = 'login_required',
  /** User consent is required */
  CONSENT_REQUIRED = 'consent_required',
  /** Additional interaction is required */
  INTERACTION_REQUIRED = 'interaction_required',
  /** The authorization grant is invalid */
  INVALID_GRANT = 'invalid_grant',
  /** The authentication token has expired */
  EXPIRED_TOKEN = 'expired_token',

  // Configuration errors
  /** The authentication request is invalid */
  INVALID_REQUEST = 'invalid_request',
  /** The client is not authorized */
  UNAUTHORIZED_CLIENT = 'unauthorized_client',
  /** The response type is not supported */
  UNSUPPORTED_RESPONSE_TYPE = 'unsupported_response_type',
  /** The requested scope is invalid */
  INVALID_SCOPE = 'invalid_scope',
  /** A server error occurred */
  SERVER_ERROR = 'server_error',
  /** The service is temporarily unavailable */
  TEMPORARILY_UNAVAILABLE = 'temporarily_unavailable',

  // MFA errors
  /** Multi-factor authentication is required */
  MFA_REQUIRED = 'mfa_required',
  /** The MFA code provided is invalid */
  MFA_INVALID_CODE = 'mfa_invalid_code',
  /** MFA registration is required before login */
  MFA_REGISTRATION_REQUIRED = 'mfa_registration_required',

  // Password policy errors
  /** Password does not meet strength requirements */
  PASSWORD_STRENGTH_ERROR = 'password_strength_error',
  /** Password contains user information */
  PASSWORD_NO_USER_INFO_ERROR = 'password_no_user_info_error',
  /** Password is too common (found in dictionary) */
  PASSWORD_DICTIONARY_ERROR = 'password_dictionary_error',

  // Rate limiting
  /** Too many requests were made in a short time */
  TOO_MANY_REQUESTS = 'too_many_requests',

  // Network errors
  /** A network error occurred */
  NETWORK_ERROR = 'network_error',
  /** The request timed out */
  TIMEOUT = 'timeout',

  // Other
  /** The authentication configuration is invalid */
  INVALID_CONFIGURATION = 'invalid_configuration',
  /** An unknown error occurred */
  UNKNOWN_ERROR = 'unknown_error',
}

/**
 * Configuration for the Keycloak authentication client.
 *
 * @property {string} url - Keycloak server URL (e.g., https://keycloak.example.com)
 * @property {string} realm - Keycloak realm name
 * @property {string} clientId - Keycloak client identifier
 */
export interface AuthClient {
  url: string;
  realm: string;
  clientId: string;
}

/**
 * Props for the AuthProvider component.
 * Combines authentication client configuration with React children.
 *
 * @property {ReactNode} children - React components to be wrapped by the authentication provider
 */
export type AuthProviderProps = Readonly<AuthClient> &
  Readonly<{
    children: ReactNode;
  }>;

/**
 * Payload structure of a decoded JWT ID token from Keycloak.
 * Contains user information and token metadata.
 *
 * @property {string} preferred_username - User's preferred username
 * @property {string} name - User's full name
 * @property {string} email - User's email address
 * @property {boolean} email_verified - Whether the user's email has been verified
 * @property {string} given_name - User's first name
 * @property {string} family_name - User's last name
 * @property {string} iss - Token issuer (Keycloak realm URL)
 * @property {string} aud - Token audience (client ID)
 * @property {number} iat - Token issued at timestamp
 * @property {number} exp - Token expiration timestamp
 * @property {string} sub - Subject (user ID)
 * @property {string} sid - Session ID
 * @property {string} azp - Authorized party
 * @property {string[]} db_roles - Database roles assigned to the user (custom claim)
 * @property {object} realm_access - Realm-level roles
 * @property {object} resource_access - Client-specific roles
 */
export type TokenPayload = Readonly<{
  preferred_username?: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
  given_name?: string;
  family_name?: string;
  iss: string;
  aud: string | string[];
  iat: number;
  exp: number;
  sub: string;
  sid?: string;
  azp?: string;
  db_roles?: string[];
  realm_access?: {
    roles: string[];
  };
  resource_access?: Record<
    string,
    {
      roles: string[];
    }
  >;
}>;

/**
 * Authentication token structure for Keycloak.
 * Contains the Keycloak instance and parsed token payload.
 */
export type AuthToken = Readonly<{
  accessToken?: string;
  idToken?: string;
  refreshToken?: string;
  idTokenPayload?: TokenPayload;
}>;

/**
 * User credentials for authentication.
 *
 * @property {string} email - User's email address
 * @property {string} password - User's password
 */
export type AuthLoginData = Readonly<{
  email: string;
  password: string;
}>;

/**
 * Parameters for the login function.
 * Note: With Keycloak, login is handled via redirect, so email/password
 * are not passed directly but handled by Keycloak's login page.
 *
 * @property {string} email - User's email address (used for hint)
 * @property {string} password - User's password (not used with Keycloak redirect)
 * @property {function} [onErrorCallback] - Optional callback invoked when login fails
 */
export type AuthLoginFunctionParameters = Readonly<{
  email: string;
  password: string;
  onErrorCallback?: (error: AuthErrorCode | undefined) => void;
}>;

/**
 * Function type for initiating user login.
 *
 * @param {AuthLoginFunctionParameters} parameters - Login credentials and optional error callback
 */
export type AuthLoginFunction = (
  parameters: AuthLoginFunctionParameters,
) => void;

/**
 * Parameters for the signup function.
 *
 * @property {string} email - User's email address
 * @property {string} password - User's password
 * @property {function} [onSuccessCallback] - Optional callback invoked when signup succeeds
 * @property {function} [onErrorCallback] - Optional callback invoked when signup fails
 */
export type AuthSignupFunctionParameters = Readonly<{
  email: string;
  password: string;
  onSuccessCallback?: () => void;
  onErrorCallback?: (error: AuthErrorCode | undefined) => void;
}>;

/**
 * Function type for initiating user signup.
 *
 * @param {AuthSignupFunctionParameters} parameters - Signup credentials and optional callbacks
 */
export type AuthSignupFunction = (
  parameters: AuthSignupFunctionParameters,
) => void;

/**
 * Function type for initiating login via redirect flow.
 * This method redirects the user to the Keycloak login page.
 */
export type LoginWithRedirectFunction = () => void;

/**
 * Parameters for the authenticate function.
 *
 * @property {function} [onErrorCallback] - Optional callback invoked when authentication fails
 */
export type AuthenticateFunctionParameters = Readonly<{
  onErrorCallback?: (error: AuthErrorCode | undefined) => void;
}>;

/**
 * Function type for authenticating existing sessions.
 * Used to restore authentication state from stored tokens or URL fragments.
 *
 * @param {AuthenticateFunctionParameters} parameters - Optional error callback
 */
export type AuthenticateFunction = (
  parameters: AuthenticateFunctionParameters,
) => void;

/**
 * Value provided by the authentication context.
 * Contains authentication state, user information, and authentication methods.
 *
 * @property {AuthClient} authClientData - Keycloak client configuration
 * @property {Keycloak | null} keycloak - Keycloak instance for advanced usage
 * @property {AuthToken | null} token - Current authentication token, or null if not authenticated
 * @property {string[]} userPermissions - Array of permission strings for the authenticated user
 * @property {AuthenticateFunction} authenticate - Function to authenticate from existing session/token
 * @property {AuthLoginFunction} login - Function to log in with credentials (redirects to Keycloak)
 * @property {AuthSignupFunction} signup - Function to sign up (redirects to Keycloak registration)
 * @property {LoginWithRedirectFunction} loginWithRedirect - Function to log in via redirect flow
 * @property {DispatchWithoutAction} logout - Function to log out the current user
 * @property {boolean} isAuthenticated - Whether the user is currently authenticated
 * @property {boolean} isLoading - Whether an authentication operation is in progress
 * @property {Dispatch<SetStateAction<boolean>>} setLoading - Function to update loading state
 * @property {boolean} localStorageAvailable - Whether localStorage is available in the current environment
 */
export type AuthContextValue = Readonly<{
  authClientData: AuthClient;
  keycloak: Keycloak | null;
  token: AuthToken | null;
  userPermissions: string[];
  authenticate: AuthenticateFunction;
  login: AuthLoginFunction;
  signup: AuthSignupFunction;
  loginWithRedirect: LoginWithRedirectFunction;
  logout: DispatchWithoutAction;
  isAuthenticated: boolean;
  isLoading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  localStorageAvailable: boolean;
}>;
