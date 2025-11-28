import { z } from 'zod';
import { SportType, PrivacyLevel } from '@baaa-hub/shared-types';

/**
 * Minimum age requirement in years
 */
export const MIN_AGE_YEARS = 13;

/**
 * Calculate the minimum date of birth for the minimum age requirement
 */
const getMinDateOfBirth = (): Date => {
  const today = new Date();
  return new Date(
    Date.UTC(
      today.getFullYear() - MIN_AGE_YEARS,
      today.getMonth(),
      today.getDate(),
    ),
  );
};

/**
 * Strava profile URL validation regex
 */
const stravaUrlRegex = /^https:\/\/(www\.)?strava\.com\/athletes\/\d+$/;

/**
 * Instagram profile URL validation regex
 */
const instagramUrlRegex =
  /^https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/;

/**
 * Privacy settings schema
 */
const privacySettingsSchema = z.object({
  email: z.nativeEnum(PrivacyLevel),
  dateOfBirth: z.nativeEnum(PrivacyLevel),
  sportTypes: z.nativeEnum(PrivacyLevel),
  socialLinks: z.nativeEnum(PrivacyLevel),
});

/**
 * Zod schema for creating a new user profile
 */
export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be 50 characters or less')
    .trim(),
  surname: z
    .string()
    .min(1, 'Surname is required')
    .max(50, 'Surname must be 50 characters or less')
    .trim(),
  nickname: z
    .string()
    .min(3, 'Nickname must be at least 3 characters')
    .max(30, 'Nickname must be 30 characters or less')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Nickname can only contain letters, numbers, and underscores',
    )
    .trim()
    .toLowerCase(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  dateOfBirth: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), 'Invalid date format')
    .refine(val => {
      const dob = new Date(val);
      const minDate = getMinDateOfBirth();
      return dob <= minDate;
    }, `You must be at least ${MIN_AGE_YEARS} years old to sign up`),
  sportTypes: z
    .array(z.nativeEnum(SportType))
    .min(1, 'At least one sport type is required')
    .max(5, 'You can select up to 5 sport types'),
  profilePicture: z.string().url('Invalid profile picture URL').optional(),
  stravaLink: z
    .string()
    .regex(stravaUrlRegex, 'Invalid Strava profile URL')
    .optional()
    .or(z.literal('')),
  instagramLink: z
    .string()
    .regex(instagramUrlRegex, 'Invalid Instagram profile URL')
    .optional()
    .or(z.literal('')),
  privacySettings: privacySettingsSchema,
});

/**
 * Zod schema for updating a user profile (partial, excludes email and nickname)
 */
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be 50 characters or less')
    .trim()
    .optional(),
  surname: z
    .string()
    .min(1, 'Surname is required')
    .max(50, 'Surname must be 50 characters or less')
    .trim()
    .optional(),
  dateOfBirth: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), 'Invalid date format')
    .refine(val => {
      const dob = new Date(val);
      const minDate = getMinDateOfBirth();
      return dob <= minDate;
    }, `You must be at least ${MIN_AGE_YEARS} years old`)
    .optional(),
  sportTypes: z
    .array(z.nativeEnum(SportType))
    .min(1, 'At least one sport type is required')
    .max(5, 'You can select up to 5 sport types')
    .optional(),
  profilePicture: z
    .string()
    .url('Invalid profile picture URL')
    .optional()
    .nullable(),
  stravaLink: z
    .string()
    .regex(stravaUrlRegex, 'Invalid Strava profile URL')
    .optional()
    .or(z.literal(''))
    .nullable(),
  instagramLink: z
    .string()
    .regex(instagramUrlRegex, 'Invalid Instagram profile URL')
    .optional()
    .or(z.literal(''))
    .nullable(),
  privacySettings: privacySettingsSchema.optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
