import { waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { renderWithProviders as render } from '../../test-utils';
import { Logout } from './Logout';
import * as AuthProviderModule from '../../providers/AuthProvider/AuthProvider';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Logout', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      logout: mockLogout,
      isAuthenticated: true,
      localStorageAvailable: true,
      login: vi.fn(),
      authenticate: vi.fn(),
      token: null,
      userPermissions: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  it('should call logout on mount', async () => {
    render(
      <MemoryRouter>
        <Logout />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it('should navigate to login after logout', async () => {
    render(
      <MemoryRouter>
        <Logout />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('should render logout page title', () => {
    const { container } = render(
      <MemoryRouter>
        <Logout />
      </MemoryRouter>,
    );

    expect(container.querySelector('h1')).toBeInTheDocument();
  });
});
