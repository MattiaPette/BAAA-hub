import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { renderWithProviders as render } from '../../test-utils';
import { PublicContainer } from './PublicContainer';
import * as AuthProviderModule from '../../providers/AuthProvider/AuthProvider';
import * as BreadcrumProviderModule from '../../providers/BreadcrumProvider/BreadcrumProvider';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

  it('should navigate to /login when login button is clicked', async () => {
    render(
      <MemoryRouter>
        <PublicContainer />
      </MemoryRouter>,
    );

    // Click the text button, not the icon button
    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('should navigate to /signup when signup button is clicked', async () => {
    render(
      <MemoryRouter>
        <PublicContainer />
      </MemoryRouter>,
    );

    // Click the text button, not the icon button
    const signupButton = screen.getByText('Sign Up');
    fireEvent.click(signupButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/signup');
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
