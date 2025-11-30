import { waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { renderWithProviders as render } from '../../test-utils';
import { LoginCallback } from './LoginCallback';
import * as AuthProviderModule from '../../providers/AuthProvider/AuthProvider';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginCallback', () => {
  const mockAuthenticate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      authenticate: mockAuthenticate,
      isAuthenticated: false,
      localStorageAvailable: true,
      login: vi.fn(),
      logout: vi.fn(),
      signup: vi.fn(),
      setLoading: vi.fn(),
      isLoading: false,
      token: null,
      userPermissions: [],
      keycloak: null,
      authClientData: {
        url: 'http://localhost:8180',
        realm: 'test-realm',
        clientId: 'test-client',
      },
    });
  });

  it('should render loading overlay', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/login/callback']}>
        <LoginCallback />
      </MemoryRouter>,
    );

    // LoadingOverlay should be present - check for loading component
    const loadingElement =
      container.querySelector('[role="progressbar"]') ||
      container.querySelector('.MuiCircularProgress-root') ||
      container.querySelector('.MuiBackdrop-root');
    expect(loadingElement).toBeTruthy();
  });

  it('should call authenticate when code is in query params (Keycloak PKCE flow)', async () => {
    render(
      <MemoryRouter
        initialEntries={['/login/callback?code=test_code&state=test_state']}
      >
        <LoginCallback />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockAuthenticate).toHaveBeenCalledWith(
        expect.objectContaining({
          onErrorCallback: expect.any(Function),
        }),
      );
    });
  });

  it('should call authenticate when error is in query params', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/login/callback?error=access_denied&error_description=User+cancelled',
        ]}
      >
        <LoginCallback />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockAuthenticate).toHaveBeenCalledWith(
        expect.objectContaining({
          onErrorCallback: expect.any(Function),
        }),
      );
    });
  });

  it('should navigate to login with error when authentication fails', async () => {
    mockAuthenticate.mockImplementation(({ onErrorCallback }) => {
      onErrorCallback('invalid_token');
    });

    render(
      <MemoryRouter
        initialEntries={['/login/callback?code=test_code&state=test_state']}
      >
        <LoginCallback />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login?error=invalid_token');
    });
  });

  it('should navigate to login when error is in hash (legacy fallback)', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/login/callback#error=access_denied&error_description=User+cancelled',
        ]}
      >
        <LoginCallback />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login?error=access_denied');
    });
  });

  it('should not call authenticate when no code or hash is present', () => {
    render(
      <MemoryRouter initialEntries={['/login/callback']}>
        <LoginCallback />
      </MemoryRouter>,
    );

    expect(mockAuthenticate).not.toHaveBeenCalled();
  });

  it('should handle undefined error code in error callback', async () => {
    mockAuthenticate.mockImplementation(({ onErrorCallback }) => {
      onErrorCallback(undefined);
    });

    render(
      <MemoryRouter
        initialEntries={['/login/callback?code=test_code&state=test_state']}
      >
        <LoginCallback />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockAuthenticate).toHaveBeenCalled();
    });

    // Should not navigate when errorCode is undefined
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should navigate to home when already authenticated', async () => {
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      authenticate: mockAuthenticate,
      isAuthenticated: true,
      localStorageAvailable: true,
      login: vi.fn(),
      logout: vi.fn(),
      signup: vi.fn(),
      setLoading: vi.fn(),
      isLoading: false,
      token: {
        idToken: 'test-id-token',
        accessToken: 'test-access-token',
      },
      userPermissions: [],
      keycloak: null,
      authClientData: {
        url: 'http://localhost:8180',
        realm: 'test-realm',
        clientId: 'test-client',
      },
    });

    render(
      <MemoryRouter initialEntries={['/login/callback']}>
        <LoginCallback />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
