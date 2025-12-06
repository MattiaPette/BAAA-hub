import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { renderWithProviders as render } from '../../test-utils';
import { PublicContainer } from './PublicContainer';
import * as AuthProviderModule from '../../providers/AuthProvider/AuthProvider';
import * as BreadcrumProviderModule from '../../providers/BreadcrumProvider/BreadcrumProvider';

describe('PublicContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      login: vi.fn(),
      signup: vi.fn(),
      isAuthenticated: false,
      localStorageAvailable: true,
      logout: vi.fn(),
      authenticate: vi.fn(),
      token: null,
      userPermissions: [],
      isLoading: false,
      authErrorMessages: [],
      clearAuthErrors: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    vi.spyOn(BreadcrumProviderModule, 'useBreadcrum').mockReturnValue({
      title: 'Dashboard',
      setTitle: vi.fn(),
    });
  });

  it('should render the header with login and signup buttons', () => {
    render(
      <MemoryRouter>
        <PublicContainer />
      </MemoryRouter>,
    );

    // Check for button text content
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('should display the page title', () => {
    render(
      <MemoryRouter>
        <PublicContainer />
      </MemoryRouter>,
    );

    // Check for the h1 element with title
    const titles = screen.getAllByText('Dashboard');
    expect(titles.length).toBeGreaterThan(0);
    // There should be a heading with the title
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Dashboard',
    );
  });

  it('should open login dialog when login button is clicked', async () => {
    render(
      <MemoryRouter>
        <PublicContainer />
      </MemoryRouter>,
    );

    // Click the desktop login button (with text)
    const loginButtons = screen.getAllByRole('button', { name: /Login/i });
    // The first one is the text button (desktop), the second is the icon button (mobile)
    fireEvent.click(loginButtons[0]);

    await waitFor(() => {
      // Check that the login dialog is open
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      // Check that email field is present (login form specific)
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });
  });

  it('should open signup dialog when signup button is clicked', async () => {
    render(
      <MemoryRouter>
        <PublicContainer />
      </MemoryRouter>,
    );

    // Click the desktop signup button (with text)
    const signupButtons = screen.getAllByRole('button', { name: /Sign Up/i });
    // The first one is the text button (desktop), the second is the icon button (mobile)
    fireEvent.click(signupButtons[0]);

    await waitFor(() => {
      // Check that the signup dialog is open
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      // Check that email field is present (signup form specific)
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      // Check for Create Account button which is specific to signup
      expect(
        screen.getByRole('button', { name: /create account/i }),
      ).toBeInTheDocument();
    });
  });

  it('should open sidebar when menu button is clicked', async () => {
    render(
      <MemoryRouter>
        <PublicContainer />
      </MemoryRouter>,
    );

    const menuButton = screen.getByRole('button', { name: /open menu/i });
    fireEvent.click(menuButton);

    await waitFor(() => {
      expect(screen.getByText('BAAA Hub')).toBeInTheDocument();
    });
  });

  it('should render main content area', () => {
    render(
      <MemoryRouter>
        <PublicContainer />
      </MemoryRouter>,
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should render logo', () => {
    render(
      <MemoryRouter>
        <PublicContainer />
      </MemoryRouter>,
    );

    // Check that at least one logo image exists
    const images = screen.getAllByRole('img', { hidden: true });
    expect(images.length).toBeGreaterThan(0);
  });
});
