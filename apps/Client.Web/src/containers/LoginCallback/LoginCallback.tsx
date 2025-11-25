import { useLocation, useNavigate } from 'react-router';
import { FC, useEffect } from 'react';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';
import { FlexContainer } from '../../components/commons/layouts/FlexContainer/FlexContainer';
import { AuthErrorCode } from '../../providers/AuthProvider/AuthProvider.model';
import { LoadingOverlay } from '../../components/commons/feedbacks/LoadingOverlay/LoadingOverlay';
import { Layout } from '../../components/commons/layouts/Layout/Layout';

/**
 * LoginCallback component — handles the identity provider redirect and
 * processes the authentication response found in the URL hash.
 *
 * Inspects the URL fragment produced by the identity provider after a
 * successful or failed sign-in and delegates parsing/validation to the
 * `AuthProvider`'s `authenticate()` helper. On error it redirects the user
 * back to the login page with an error code so the UI can show a friendly
 * message.
 *
 * @param {void} props - This component does not accept props; it reads
 *   routing and auth state via hooks (`useLocation`, `useNavigate`, `useAuth`).
 * @returns {JSX.Element} A React element showing a loader while the auth hash
 *   is processed.
 * @throws {Error} If `useAuth()` is called outside of an `AuthProvider` the
 *   hook will throw; consumers should ensure the component is rendered
 *   inside an `AuthProvider`.
 *
 * Notes:
 * - The component itself is synchronous (not `async`) but it triggers
 *   asynchronous validation inside `authenticate()` provided by the
 *   `AuthProvider`.
 *
 * @example
 * // Typical route configuration
 * // <Route path="/callback" element={<LoginCallback />} />
 */

export const LoginCallback: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { authenticate } = useAuth();

  useEffect(() => {
    if (location.hash) {
      if (
        location.hash.includes('access_token') ||
        location.hash.includes('id_token')
      ) {
        authenticate({
          onErrorCallback: (errorCode: AuthErrorCode | undefined) => {
            if (errorCode) {
              navigate(`/login?error=${errorCode}`);
            }
          },
        });
      } else if (location.hash.includes('error')) {
        // Handle error case
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const error = hashParams.get('error');
        navigate(`/login?error=${error}`);
      }
    }
  }, [location, authenticate, navigate]);

  return (
    <FlexContainer direction="column">
      <Layout
        sx={{
          backgroundImage: theme =>
            `url('/stripes.svg'), radial-gradient(ellipse at 50% 50%, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
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
