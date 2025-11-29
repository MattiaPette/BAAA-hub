import { SportType, UserPrivacySettings } from '@baaa-hub/shared-types';

/**
 * Form input for profile setup
 */
export interface ProfileSetupFormInput {
  name: string;
  surname: string;
  nickname: string;
  email: string;
  dateOfBirth: string;
  sportTypes: SportType[];
  stravaLink: string;
  instagramLink: string;
  privacySettings: UserPrivacySettings;
}

/**
 * Extended form data with image files (for the container)
 */
export interface ProfileSetupFormData extends ProfileSetupFormInput {
  avatarFile?: File;
  bannerFile?: File;
}

/**
 * Props for ProfileSetupForm component
 */
export interface ProfileSetupFormProps {
  readonly defaultEmail?: string;
  readonly defaultName?: string;
  readonly isSubmitting: boolean;
  readonly errorMessage?: string;
  readonly onSubmit: (data: Readonly<ProfileSetupFormData>) => void;
  readonly onLogout: () => void;
}
