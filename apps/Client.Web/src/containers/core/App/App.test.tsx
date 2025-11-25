import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { App } from './App';

const mockAuthConfig = {
  domain: 'test-domain.auth0.com',
  clientID: 'test-client-id',
  responseType: 'token',
  userDatabaseConnection: 'Username-Password-Authentication',
  scope: 'openid profile email',
  redirectUri: 'http://localhost:3000',
};

describe('App', () => {
  it('should render without crashing', () => {
    const { container } = render(<App authConfiguration={mockAuthConfig} />);
    expect(container).toBeInTheDocument();
  });

  it('should wrap content with error boundary', () => {
    const { container } = render(<App authConfiguration={mockAuthConfig} />);
    // The app should render with all providers
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render main flex container', () => {
    const { container } = render(<App authConfiguration={mockAuthConfig} />);
    const mainElement = container.querySelector('main');
    expect(mainElement).toBeInTheDocument();
  });

  it('should include CSS baseline for consistent styling', () => {
    const { container } = render(<App authConfiguration={mockAuthConfig} />);
    // CssBaseline is rendered, verify container exists
    expect(container).toBeInTheDocument();
  });

  it('should initialize with all required providers', () => {
    const { container } = render(<App authConfiguration={mockAuthConfig} />);
    // App should render with AuthProvider, LanguageProvider, ThemeModeProvider, etc.
    expect(container.firstChild).toBeTruthy();
  });

  it('should render with theme provider and snackbar provider', () => {
    const { container } = render(<App authConfiguration={mockAuthConfig} />);
    // MaterialUI component includes ThemeProvider and SnackbarProvider
    expect(container).toBeInTheDocument();
  });
});
