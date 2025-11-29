import { SportType, UserPrivacySettings } from '@baaa-hub/shared-types';

/**
 * Form input for profile editing
 */
export interface ProfileEditFormInput {
  name: string;
  surname: string;
  dateOfBirth: string;
  sportTypes: SportType[];
  stravaLink: string;
  instagramLink: string;
  privacySettings: UserPrivacySettings;
}

/**
 * Props for ProfileEdit component
 */
export interface ProfileEditProps {
  readonly user: Readonly<import('@baaa-hub/shared-types').User>;
  readonly onUpdate: (data: Readonly<ProfileEditFormInput>) => Promise<void>;
  readonly onCancel: () => void;
  readonly isSubmitting: boolean;
}
