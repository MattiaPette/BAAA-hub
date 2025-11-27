import { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeModeProvider } from './providers/ThemeProvider/ThemeProvider';
import { LanguageProvider } from './providers/LanguageProvider/LanguageProvider';
import { TranslationProvider } from './providers/TranslationProvider/TranslationProvider';
import { AuthProvider } from './providers/AuthProvider/AuthProvider';
import { initTheme } from './theme/theme';

// Mock Auth0 props for testing
const mockAuthProps = {
  domain: 'test-domain.auth0.com',
  clientID: 'test-client-id',
  responseType: 'token',
  userDatabaseConnection: 'Username-Password-Authentication',
  scope: 'openid profile email',
  redirectUri: 'http://localhost:3000',
};

/**
 * Custom render function that wraps components with necessary providers
 * for testing components that use Material-UI theme or i18n features.
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult {
  const theme = initTheme('dark');
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider {...mockAuthProps}>
        <LanguageProvider>
          <TranslationProvider>
            <ThemeModeProvider>
              <ThemeProvider theme={theme}>{ui}</ThemeProvider>
            </ThemeModeProvider>
          </TranslationProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>,
    options,
  );
}

export * from '@testing-library/react';
export { renderWithProviders as render };
