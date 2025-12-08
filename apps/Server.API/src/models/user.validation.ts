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
 * YouTube URL validation regex (channel or user)
 */
const youtubeUrlRegex =
  /^https:\/\/(www\.)?youtube\.com\/(channel\/UC[\w-]{22}|c\/[\w-]+|user\/[\w-]+|@[\w-]+)\/?$/;

/**
 * Garmin Connect profile URL validation regex
 */
const garminUrlRegex =
  /^https:\/\/connect\.garmin\.com\/modern\/profile\/[\w-]+$/;

/**
 * TikTok profile URL validation regex
 */
const tiktokUrlRegex = /^https:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/?$/;

/**
 * Generic URL validation regex
 */
const urlRegex = /^https?:\/\/.+\..+$/;

/**
 * ISO 3166-1 alpha-2 country code regex
 */
const countryCodeRegex = /^[A-Z]{2}$/;

/**
 * Time format validation for running achievements
 * Supports MM:SS or HH:MM:SS format with two-digit components
 */
const timeFormatRegex = /^(\d{2}:\d{2}:\d{2}|\d{2}:\d{2})$/;

/**
 * Personal stats schema
 */
const personalStatsSchema = z
  .object({
    height: z.number().min(0, 'Height must be positive').optional(),
    weight: z.number().min(0, 'Weight must be positive').optional(),
  })
  .optional();

/**
 * Personal achievements schema
 */
const personalAchievementsSchema = z
  .object({
    time5k: z
      .string()
      .regex(timeFormatRegex, 'Invalid time format (use MM:SS)')
      .optional(),
    time10k: z
      .string()
      .regex(timeFormatRegex, 'Invalid time format (use MM:SS)')
      .optional(),
    timeHalfMarathon: z
      .string()
      .regex(timeFormatRegex, 'Invalid time format (use HH:MM:SS or MM:SS)')
      .optional(),
    timeMarathon: z
      .string()
      .regex(timeFormatRegex, 'Invalid time format (use HH:MM:SS or MM:SS)')
      .optional(),
  })
  .optional();

/**
 * Privacy settings schema
 * Note: avatar and banner are optional for backward compatibility with existing users.
 * Mongoose schema provides defaults for these fields.
 */
const privacySettingsSchema = z.object({
  email: z.nativeEnum(PrivacyLevel),
  dateOfBirth: z.nativeEnum(PrivacyLevel),
  sportTypes: z.nativeEnum(PrivacyLevel),
  socialLinks: z.nativeEnum(PrivacyLevel),
  avatar: z.nativeEnum(PrivacyLevel).optional().default(PrivacyLevel.PUBLIC),
  banner: z.nativeEnum(PrivacyLevel).optional().default(PrivacyLevel.PUBLIC),
  description: z
    .nativeEnum(PrivacyLevel)
    .optional()
    .default(PrivacyLevel.PUBLIC),
  cityRegion: z
    .nativeEnum(PrivacyLevel)
    .optional()
    .default(PrivacyLevel.PUBLIC),
  personalStats: z
    .nativeEnum(PrivacyLevel)
    .optional()
    .default(PrivacyLevel.PUBLIC),
  personalAchievements: z
    .nativeEnum(PrivacyLevel)
    .optional()
    .default(PrivacyLevel.PUBLIC),
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
  youtubeLink: z
    .string()
    .regex(youtubeUrlRegex, 'Invalid YouTube profile URL')
    .optional()
    .or(z.literal('')),
  garminLink: z
    .string()
    .regex(garminUrlRegex, 'Invalid Garmin Connect profile URL')
    .optional()
    .or(z.literal('')),
  tiktokLink: z
    .string()
    .regex(tiktokUrlRegex, 'Invalid TikTok profile URL')
    .optional()
    .or(z.literal('')),
  personalWebsiteLink: z
    .string()
    .regex(urlRegex, 'Invalid website URL')
    .optional()
    .or(z.literal('')),
  country: z
    .string()
    .regex(countryCodeRegex, 'Invalid country code (use 2-letter ISO code)')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .or(z.literal('')),
  cityRegion: z
    .string()
    .max(100, 'City/Region must be 100 characters or less')
    .optional()
    .or(z.literal('')),
  personalStats: personalStatsSchema,
  personalAchievements: personalAchievementsSchema,
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
  youtubeLink: z
    .string()
    .regex(youtubeUrlRegex, 'Invalid YouTube profile URL')
    .optional()
    .or(z.literal(''))
    .nullable(),
  garminLink: z
    .string()
    .regex(garminUrlRegex, 'Invalid Garmin Connect profile URL')
    .optional()
    .or(z.literal(''))
    .nullable(),
  tiktokLink: z
    .string()
    .regex(tiktokUrlRegex, 'Invalid TikTok profile URL')
    .optional()
    .or(z.literal(''))
    .nullable(),
  personalWebsiteLink: z
    .string()
    .regex(urlRegex, 'Invalid website URL')
    .optional()
    .or(z.literal(''))
    .nullable(),
  country: z
    .string()
    .regex(countryCodeRegex, 'Invalid country code (use 2-letter ISO code)')
    .optional()
    .or(z.literal(''))
    .nullable(),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .or(z.literal(''))
    .nullable(),
  cityRegion: z
    .string()
    .max(100, 'City/Region must be 100 characters or less')
    .optional()
    .or(z.literal(''))
    .nullable(),
  personalStats: personalStatsSchema.nullable(),
  personalAchievements: personalAchievementsSchema.nullable(),
  privacySettings: privacySettingsSchema.optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
