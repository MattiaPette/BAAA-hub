import { AuthOptions } from 'auth0-js';

export type AuthConfigurationProps = AuthOptions &
  Readonly<{ userDatabaseConnection: string }>;

export type AppProps = { authConfiguration: AuthConfigurationProps };
