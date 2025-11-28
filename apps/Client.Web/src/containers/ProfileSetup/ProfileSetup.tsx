import { FC, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useSnackbar } from 'notistack';
import { t } from '@lingui/core/macro';
import { CreateUserRequest, SportType } from '@baaa-hub/shared-types';
import { FlexContainer } from '../../components/commons/layouts/FlexContainer/FlexContainer';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';
import { createUserProfile } from '../../services/userService';
import { ProfileSetupForm } from './ProfileSetupForm';
import { ProfileSetupFormInput } from './ProfileSetup.model';

/**
 * ProfileSetup container - handles the profile creation flow after Auth0 signup
 */
export const ProfileSetup: FC = () => {
  const { token, setLoading, logout } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  const handleSubmit = useCallback(
    async (data: Readonly<ProfileSetupFormInput>) => {
      if (!token?.idToken) {
        setErrorMessage(
          t`Authentication required. Please try logging in again.`,
        );
        return;
      }

      setIsSubmitting(true);
      setLoading(true);
      setErrorMessage(undefined);

      try {
        const createData: CreateUserRequest = {
          name: data.name.trim(),
          surname: data.surname.trim(),
          nickname: data.nickname.trim(),
          email: data.email.trim().toLowerCase(),
          dateOfBirth: data.dateOfBirth,
          sportTypes: data.sportTypes as SportType[],
          stravaLink: data.stravaLink?.trim() || undefined,
          instagramLink: data.instagramLink?.trim() || undefined,
          privacySettings: data.privacySettings,
        };

        await createUserProfile(token.idToken || '', createData);

        enqueueSnackbar(t`Profile created successfully!`, {
          variant: 'success',
        });

        // Redirect to dashboard
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('Profile creation error:', error);

        // Handle specific error cases
        if (error instanceof Error) {
          const axiosError = error as {
            response?: {
              data?: {
                code?: string;
                error?: string;
                details?: Array<{ path: string; message: string }>;
              };
            };
          };
          const errorCode = axiosError.response?.data?.code;
          const errorMsg = axiosError.response?.data?.error;
          const errorDetails = axiosError.response?.data?.details;

          switch (errorCode) {
            case 'NICKNAME_TAKEN':
              setErrorMessage(
                t`This nickname is already taken. Please choose another.`,
              );
              break;
            case 'EMAIL_TAKEN':
              setErrorMessage(t`This email is already registered.`);
              break;
            case 'USER_ALREADY_EXISTS':
              setErrorMessage(
                t`You already have a profile. Redirecting to dashboard...`,
              );
              setTimeout(() => navigate('/dashboard', { replace: true }), 2000);
              break;
            case 'AGE_REQUIREMENT_NOT_MET':
              setErrorMessage(t`You must be at least 13 years old to sign up.`);
              break;
            case 'VALIDATION_ERROR':
              // Show detailed validation errors
              if (errorDetails && errorDetails.length > 0) {
                const messages = errorDetails
                  .map(detail => `${detail.path}: ${detail.message}`)
                  .join(', ');
                setErrorMessage(messages);
              } else {
                setErrorMessage(
                  errorMsg || t`Please check your input and try again.`,
                );
              }
              break;
            default:
              setErrorMessage(
                errorMsg || t`Failed to create profile. Please try again.`,
              );
          }
        } else {
          setErrorMessage(t`Failed to create profile. Please try again.`);
        }
      } finally {
        setIsSubmitting(false);
        setLoading(false);
      }
    },
    [token, setLoading, navigate, enqueueSnackbar],
  );

  // Get default values from Auth0 token
  const defaultEmail = token?.idTokenPayload?.email || '';
  const defaultName = token?.idTokenPayload?.name || '';

  return (
    <FlexContainer direction="column">
      <ProfileSetupForm
        defaultEmail={defaultEmail}
        defaultName={defaultName}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        onSubmit={handleSubmit}
        onLogout={handleLogout}
      />
    </FlexContainer>
  );
};
