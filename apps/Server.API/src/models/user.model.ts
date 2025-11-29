import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  SportType,
  UserRole,
  User as UserType,
  PrivacyLevel,
} from '@baaa-hub/shared-types';

/**
 * User document interface for Mongoose
 */
export interface UserDocument extends Omit<UserType, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

/**
 * User model interface with static methods
 */
export interface IUserModel extends Model<UserDocument> {
  findByAuthId(authId: string): Promise<UserDocument | null>;
  findByEmail(email: string): Promise<UserDocument | null>;
  findByNickname(nickname: string): Promise<UserDocument | null>;
}

/**
 * Mongoose schema for User
 */
const userSchema = new Schema<UserDocument>(
  {
    // Profile data
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name must be 50 characters or less'],
    },
    surname: {
      type: String,
      required: [true, 'Surname is required'],
      trim: true,
      maxlength: [50, 'Surname must be 50 characters or less'],
    },
    nickname: {
      type: String,
      required: [true, 'Nickname is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Nickname must be at least 3 characters'],
      maxlength: [30, 'Nickname must be 30 characters or less'],
      match: [
        /^[a-zA-Z0-9_]+$/,
        'Nickname can only contain letters, numbers, and underscores',
      ],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    dateOfBirth: {
      type: String,
      required: [true, 'Date of birth is required'],
    },
    sportTypes: {
      type: [String],
      required: [true, 'At least one sport type is required'],
      enum: Object.values(SportType),
      validate: {
        validator: (v: string[]) => v.length >= 1 && v.length <= 5,
        message: 'You must select between 1 and 5 sport types',
      },
    },
    profilePicture: {
      type: String,
      trim: true,
    },
    avatarKey: {
      type: String,
      trim: true,
    },
    avatarThumbKey: {
      type: String,
      trim: true,
    },
    bannerKey: {
      type: String,
      trim: true,
    },
    stravaLink: {
      type: String,
      trim: true,
    },
    instagramLink: {
      type: String,
      trim: true,
    },
    privacySettings: {
      email: {
        type: String,
        enum: Object.values(PrivacyLevel),
        default: PrivacyLevel.PUBLIC,
      },
      dateOfBirth: {
        type: String,
        enum: Object.values(PrivacyLevel),
        default: PrivacyLevel.PUBLIC,
      },
      sportTypes: {
        type: String,
        enum: Object.values(PrivacyLevel),
        default: PrivacyLevel.PUBLIC,
      },
      socialLinks: {
        type: String,
        enum: Object.values(PrivacyLevel),
        default: PrivacyLevel.PUBLIC,
      },
      avatar: {
        type: String,
        enum: Object.values(PrivacyLevel),
        default: PrivacyLevel.PUBLIC,
      },
      banner: {
        type: String,
        enum: Object.values(PrivacyLevel),
        default: PrivacyLevel.PUBLIC,
      },
    },

    // System fields
    authId: {
      type: String,
      required: [true, 'Auth ID is required'],
      unique: true,
      trim: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    roles: {
      type: [String],
      enum: Object.values(UserRole),
      default: [UserRole.MEMBER],
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        const id = String(ret._id);
        // Remove internal fields
        const result = Object.fromEntries(
          Object.entries(ret).filter(([key]) => key !== '_id' && key !== '__v'),
        );
        return { ...result, id };
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        const id = String(ret._id);
        // Remove internal fields
        const result = Object.fromEntries(
          Object.entries(ret).filter(([key]) => key !== '_id' && key !== '__v'),
        );
        return { ...result, id };
      },
    },
  },
);

// Static methods
userSchema.statics.findByAuthId = function (
  authId: string,
): Promise<UserDocument | null> {
  return this.findOne({ authId });
};

userSchema.statics.findByEmail = function (
  email: string,
): Promise<UserDocument | null> {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByNickname = function (
  nickname: string,
): Promise<UserDocument | null> {
  return this.findOne({ nickname: nickname.toLowerCase() });
};

export const User = mongoose.model<UserDocument, IUserModel>(
  'User',
  userSchema,
);
