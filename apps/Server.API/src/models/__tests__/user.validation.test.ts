import { describe, it, expect } from 'vitest';
import { SportType } from '@baaa-hub/shared-types';
import {
  createUserSchema,
  updateUserSchema,
  MIN_AGE_YEARS,
} from '../user.validation';

/**
 * Get a date that is exactly n years ago
 */
const getDateYearsAgo = (years: number): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date.toISOString().split('T')[0];
};

describe('createUserSchema', () => {
  const validUser = {
    name: 'John',
    surname: 'Doe',
    nickname: 'johndoe',
    email: 'john@example.com',
    dateOfBirth: getDateYearsAgo(25),
    sportTypes: [SportType.RUNNING],
  };

  describe('name validation', () => {
    it('should accept valid name', () => {
      const result = createUserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const result = createUserSchema.safeParse({ ...validUser, name: '' });
      expect(result.success).toBe(false);
    });

    it('should reject name exceeding 50 characters', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        name: 'a'.repeat(51),
      });
      expect(result.success).toBe(false);
    });

    it('should trim whitespace from name', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        name: '  John  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('John');
      }
    });
  });

  describe('surname validation', () => {
    it('should reject empty surname', () => {
      const result = createUserSchema.safeParse({ ...validUser, surname: '' });
      expect(result.success).toBe(false);
    });

    it('should reject surname exceeding 50 characters', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        surname: 'a'.repeat(51),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('nickname validation', () => {
    it('should accept valid nickname with letters, numbers, and underscores', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        nickname: 'john_doe_123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject nickname shorter than 3 characters', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        nickname: 'ab',
      });
      expect(result.success).toBe(false);
    });

    it('should reject nickname longer than 30 characters', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        nickname: 'a'.repeat(31),
      });
      expect(result.success).toBe(false);
    });

    it('should reject nickname with special characters', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        nickname: 'john-doe!',
      });
      expect(result.success).toBe(false);
    });

    it('should reject nickname with spaces', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        nickname: 'john doe',
      });
      expect(result.success).toBe(false);
    });

    it('should convert nickname to lowercase for case-insensitive uniqueness', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        nickname: 'JohnDoe_123',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.nickname).toBe('johndoe_123');
      }
    });
  });

  describe('email validation', () => {
    it('should accept valid email', () => {
      const result = createUserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        email: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });

    it('should convert email to lowercase', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        email: 'John@Example.COM',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('john@example.com');
      }
    });
  });

  describe('dateOfBirth validation', () => {
    it('should accept valid date of birth for user over minimum age', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        dateOfBirth: getDateYearsAgo(MIN_AGE_YEARS + 1),
      });
      expect(result.success).toBe(true);
    });

    it('should accept exactly minimum age', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        dateOfBirth: getDateYearsAgo(MIN_AGE_YEARS),
      });
      expect(result.success).toBe(true);
    });

    it('should reject user under minimum age', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        dateOfBirth: getDateYearsAgo(MIN_AGE_YEARS - 1),
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid date format', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        dateOfBirth: 'not-a-date',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('sportTypes validation', () => {
    it('should accept valid sport types', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        sportTypes: [SportType.RUNNING, SportType.CYCLING],
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty sport types array', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        sportTypes: [],
      });
      expect(result.success).toBe(false);
    });

    it('should reject more than 5 sport types', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        sportTypes: [
          SportType.RUNNING,
          SportType.CYCLING,
          SportType.SWIMMING,
          SportType.TRIATHLON,
          SportType.HIKING,
          SportType.GYM,
        ],
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid sport type', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        sportTypes: ['INVALID_SPORT'],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('optional fields', () => {
    it('should accept valid profile picture URL', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        profilePicture: 'https://example.com/avatar.jpg',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid profile picture URL', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        profilePicture: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid Strava link', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        stravaLink: 'https://www.strava.com/athletes/12345',
      });
      expect(result.success).toBe(true);
    });

    it('should accept Strava link without www', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        stravaLink: 'https://strava.com/athletes/12345',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid Strava link', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        stravaLink: 'https://strava.com/invalid',
      });
      expect(result.success).toBe(false);
    });

    it('should accept empty string for stravaLink', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        stravaLink: '',
      });
      expect(result.success).toBe(true);
    });

    it('should accept valid Instagram link', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        instagramLink: 'https://www.instagram.com/johndoe',
      });
      expect(result.success).toBe(true);
    });

    it('should accept Instagram link without www', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        instagramLink: 'https://instagram.com/johndoe/',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid Instagram link', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        instagramLink: 'https://instagram.com/',
      });
      expect(result.success).toBe(false);
    });

    it('should accept empty string for instagramLink', () => {
      const result = createUserSchema.safeParse({
        ...validUser,
        instagramLink: '',
      });
      expect(result.success).toBe(true);
    });
  });
});

describe('updateUserSchema', () => {
  describe('partial updates', () => {
    it('should accept empty object (no updates)', () => {
      const result = updateUserSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should accept partial name update', () => {
      const result = updateUserSchema.safeParse({ name: 'Jane' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Jane');
      }
    });

    it('should accept partial surname update', () => {
      const result = updateUserSchema.safeParse({ surname: 'Smith' });
      expect(result.success).toBe(true);
    });

    it('should accept partial dateOfBirth update', () => {
      const result = updateUserSchema.safeParse({
        dateOfBirth: getDateYearsAgo(30),
      });
      expect(result.success).toBe(true);
    });

    it('should accept partial sportTypes update', () => {
      const result = updateUserSchema.safeParse({
        sportTypes: [SportType.SWIMMING],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('nullable optional fields', () => {
    it('should accept null for profilePicture', () => {
      const result = updateUserSchema.safeParse({ profilePicture: null });
      expect(result.success).toBe(true);
    });

    it('should accept null for stravaLink', () => {
      const result = updateUserSchema.safeParse({ stravaLink: null });
      expect(result.success).toBe(true);
    });

    it('should accept null for instagramLink', () => {
      const result = updateUserSchema.safeParse({ instagramLink: null });
      expect(result.success).toBe(true);
    });
  });

  describe('validation rules', () => {
    it('should reject name under minimum age constraint for dateOfBirth', () => {
      const result = updateUserSchema.safeParse({
        dateOfBirth: getDateYearsAgo(10),
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty sportTypes array', () => {
      const result = updateUserSchema.safeParse({ sportTypes: [] });
      expect(result.success).toBe(false);
    });

    it('should reject more than 5 sport types', () => {
      const result = updateUserSchema.safeParse({
        sportTypes: [
          SportType.RUNNING,
          SportType.CYCLING,
          SportType.SWIMMING,
          SportType.TRIATHLON,
          SportType.HIKING,
          SportType.GYM,
        ],
      });
      expect(result.success).toBe(false);
    });
  });
});
