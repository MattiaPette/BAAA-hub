import {
  SportType,
  UserPrivacySettings,
  PersonalStats,
  PersonalAchievements,
} from '@baaa-hub/shared-types';

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
  youtubeLink?: string;
  garminLink?: string;
  tiktokLink?: string;
  personalWebsiteLink?: string;
  country?: string;
  description?: string;
  cityRegion?: string;
  personalStats?: PersonalStats;
  personalAchievements?: PersonalAchievements;
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
