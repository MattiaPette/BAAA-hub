/**
 * Configuration for Keycloak authentication
 */
export interface AuthConfigurationProps {
  /** Keycloak server URL (e.g., https://keycloak.example.com) */
  url: string;
  /** Keycloak realm name */
  realm: string;
  /** Keycloak client identifier */
  clientId: string;
}

export type AppProps = { authConfiguration: AuthConfigurationProps };
