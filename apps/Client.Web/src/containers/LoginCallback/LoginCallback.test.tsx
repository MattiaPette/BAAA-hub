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
      loginWithRedirect: vi.fn(),
      logout: vi.fn(),
      token: null,
      userPermissions: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
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

  it('should call authenticate when access_token is in hash', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/login/callback#access_token=test_token&id_token=test_id',
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

  it('should call authenticate when id_token is in hash', async () => {
    render(
      <MemoryRouter initialEntries={['/login/callback#id_token=test_id']}>
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
        initialEntries={['/login/callback#access_token=invalid_token']}
      >
        <LoginCallback />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login?error=invalid_token');
    });
  });

  it('should navigate to login when error is in hash', async () => {
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

  it('should not call authenticate when no hash is present', () => {
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
        initialEntries={['/login/callback#access_token=test_token']}
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
});
