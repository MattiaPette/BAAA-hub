import { FC, ReactNode } from 'react';
import { BrowserRouter } from 'react-router';

import { SnackbarProvider } from 'notistack';

import { CssBaseline, ThemeProvider } from '@mui/material';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FlexContainer } from '../../../components/commons/layouts/FlexContainer/FlexContainer';
import { SnackbarCloseAction } from '../../../components/commons/feedbacks/SnackbarCloseAction/SnackbarCloseAction';
import { ErrorBoundary } from '../../../components/commons/errors/ErrorBoundary/ErrorBoundary';
import { RootErrorFallback } from '../../../components/commons/errors/RootErrorFallback/RootErrorFallback';

import { Router } from '../Router/Router';

import { initTheme } from '../../../theme/theme';

import {
  LanguageProvider,
  useLanguageContext,
} from '../../../providers/LanguageProvider/LanguageProvider';

import {
  ThemeModeProvider,
  useThemeModeContext,
} from '../../../providers/ThemeProvider/ThemeProvider';

import { TranslationProvider } from '../../../providers/TranslationProvider/TranslationProvider';
import { AuthProvider } from '../../../providers/AuthProvider/AuthProvider';
import { BreadcrumProvider } from '../../../providers/BreadcrumProvider/BreadcrumProvider';
import { UserProvider } from '../../../providers/UserProvider/UserProvider';
import { AppProps } from './App.model';

/**
 * React component function that provides a theme context and a Snackbar notification provider to all its child components.
 * Uses the language context and theme mode context to initialize the theme.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {ReactNode} props.children - The child components that will be wrapped by the theme provider and the Snackbar provider.
 *
 * @returns {JSX.Element} A JSX element that wraps the child components with a theme provider and a Snackbar provider.
 *
 * @example
 * <MaterialUI>
 *   <YourComponent />
 * </MaterialUI>
 */
const MaterialUI: FC<Readonly<{ children: ReactNode }>> = ({ children }) => {
  const [language] = useLanguageContext();
  const [mode] = useThemeModeContext();
  return (
    <ThemeProvider theme={initTheme(mode, language)}>
      <SnackbarProvider
        maxSnack={10}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        // eslint-disable-next-line react/no-unstable-nested-components
        action={key => <SnackbarCloseAction snackbarKey={key} />}
      >
        <CssBaseline />

        {children}
      </SnackbarProvider>
    </ThemeProvider>
  );
};

/**
 * Application component function that initializes the required providers and returns the application's user interface.
 * This function uses the ErrorBoundary component to handle any errors at the root level of the application.
 * It also initializes the QueryClient for data query management, and configures providers for authentication, language, theme mode, translation, routing, and connection.
 *
 * @param {Object} authConfiguration - The configuration object for the authentication provider.
 * @returns {JSX.Element} The application's user interface wrapped with all necessary providers.
 *
 * @example
 * <App authConfiguration={myAuthConfig} />
 */
export const App: FC<AppProps> = ({ authConfiguration }) => {
  const queryClient = new QueryClient();

  return (
    <ErrorBoundary FallbackComponent={RootErrorFallback}>
      <AuthProvider {...authConfiguration}>
        <LanguageProvider>
          <ThemeModeProvider>
            <TranslationProvider>
              <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                  <MaterialUI>
                    <FlexContainer component="main">
                      <UserProvider>
                        <BreadcrumProvider>
                          <Router />
                        </BreadcrumProvider>
                      </UserProvider>
                    </FlexContainer>
                  </MaterialUI>
                </QueryClientProvider>
              </BrowserRouter>
            </TranslationProvider>
          </ThemeModeProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};
