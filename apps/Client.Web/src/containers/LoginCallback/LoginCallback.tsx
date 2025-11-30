import { useLocation, useNavigate } from 'react-router';
import { FC, useEffect } from 'react';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';
import { FlexContainer } from '../../components/commons/layouts/FlexContainer/FlexContainer';
import { AuthErrorCode } from '../../providers/AuthProvider/AuthProvider.model';
import { LoadingOverlay } from '../../components/commons/feedbacks/LoadingOverlay/LoadingOverlay';
import { Layout } from '../../components/commons/layouts/Layout/Layout';

/**
 * LoginCallback component — handles the identity provider redirect and
 * processes the authentication response found in the URL.
 *
 * For Keycloak, authentication is handled via authorization code flow with PKCE.
 * The URL will contain a `code` query parameter after successful authentication.
 * On error it redirects the user back to the login page with an error code
 * so the UI can show a friendly message.
 *
 * @param {void} props - This component does not accept props; it reads
 *   routing and auth state via hooks (`useLocation`, `useNavigate`, `useAuth`).
 * @returns {JSX.Element} A React element showing a loader while the auth callback
 *   is processed.
 * @throws {Error} If `useAuth()` is called outside of an `AuthProvider` the
 *   hook will throw; consumers should ensure the component is rendered
 *   inside an `AuthProvider`.
 *
 * Notes:
 * - The component itself is synchronous (not `async`) but it triggers
 *   asynchronous validation inside `authenticate()` provided by the
 *   `AuthProvider`.
 * - Keycloak uses authorization code flow with PKCE, so the URL contains
 *   a `code` parameter instead of tokens in the hash.
 *
 * @example
 * // Typical route configuration
 * // <Route path="/login/callback" element={<LoginCallback />} />
 */

export const LoginCallback: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { authenticate, isAuthenticated } = useAuth();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const hasCode = searchParams.has('code');
    const hasError = searchParams.has('error');

    // Keycloak uses authorization code flow with PKCE
    if (hasCode || hasError) {
      authenticate({
        onErrorCallback: (errorCode: AuthErrorCode | undefined) => {
          if (errorCode) {
            navigate(`/login?error=${errorCode}`);
          }
        },
      });
    } else if (location.hash) {
      // Fallback for legacy hash-based tokens (shouldn't happen with Keycloak)
      if (location.hash.includes('error')) {
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const error = hashParams.get('error');
        navigate(`/login?error=${error}`);
      }
    }
  }, [location, authenticate, navigate]);

  // Redirect to home if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <FlexContainer direction="column">
      <Layout
        sx={{
          padding: '12px',
          '& .MuiBox-root': {
            backgroundColor: theme => theme.palette.background.paper,
            color: theme => theme.palette.text.primary,
          },
        }}
      />
      <LoadingOverlay isLoading />
    </FlexContainer>
  );
};
