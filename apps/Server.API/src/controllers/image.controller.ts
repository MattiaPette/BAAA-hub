import type { Context } from 'koa';
import { ErrorCode } from '@baaa-hub/shared-types';
import { User as UserMongooseModel } from '../models/user.model.js';
import { ApiError } from '../middleware/errorHandler.js';
import { AuthContext } from '../middleware/auth.js';
import {
  uploadImage,
  getImage,
  deleteImage,
  validateImage,
  generateImageKey,
  getExtensionFromMimeType,
  ImageType,
} from '../services/storage.service.js';

/**
 * Validate image type parameter
 */
const validateImageType = (type: string): ImageType => {
  if (type === 'avatar') return ImageType.AVATAR;
  if (type === 'banner') return ImageType.BANNER;
  throw new ApiError(
    400,
    'Invalid image type. Must be "avatar" or "banner"',
    ErrorCode.VALIDATION_ERROR,
  );
};

/**
 * Upload an image (avatar or banner) for the current user
 */
export const uploadUserImage = async (ctx: AuthContext): Promise<void> => {
  const { userId } = ctx.state.auth;
  const imageType = validateImageType(ctx.params.type);

  const user = await UserMongooseModel.findByAuthId(userId);
  if (!user) {
    throw new ApiError(404, 'User profile not found', ErrorCode.USER_NOT_FOUND);
  }

  if (user.isBlocked) {
    throw new ApiError(403, 'User account is blocked', ErrorCode.USER_BLOCKED);
  }

  // Get raw body data (image buffer)
  const body = ctx.request.body as Buffer;
  const contentType = ctx.request.headers['content-type'] || '';

  if (!body || !(body instanceof Buffer) || body.length === 0) {
    throw new ApiError(
      400,
      'No image data provided',
      ErrorCode.VALIDATION_ERROR,
    );
  }

  // Validate image
  try {
    validateImage(contentType, body.length);
  } catch (error) {
    throw new ApiError(
      400,
      (error as Error).message,
      ErrorCode.VALIDATION_ERROR,
    );
  }

  // Generate key and upload
  const extension = getExtensionFromMimeType(contentType);
  const key = generateImageKey(userId, imageType, extension);

  try {
    await uploadImage(key, body, contentType);
  } catch (error) {
    console.error('Failed to upload image:', error);
    throw new ApiError(500, 'Failed to upload image', ErrorCode.SERVER_ERROR);
  }

  // Delete old image if exists
  const oldKey =
    imageType === ImageType.AVATAR ? user.avatarKey : user.bannerKey;
  if (oldKey) {
    try {
      await deleteImage(oldKey);
    } catch (error) {
      // Log but don't fail - old image cleanup is not critical
      console.warn('Failed to delete old image:', error);
    }
  }

  // Update user record with new key
  if (imageType === ImageType.AVATAR) {
    user.avatarKey = key;
  } else {
    user.bannerKey = key;
  }
  await user.save();

  ctx.status = 200;
  ctx.body = {
    key,
    message: 'Image uploaded successfully',
  };
};

/**
 * Get user image by type (avatar or banner)
 * This is a public endpoint - no authentication required
 * But we validate that the user exists
 */
export const getUserImage = async (ctx: Context): Promise<void> => {
  const { userId, type } = ctx.params;
  const imageType = validateImageType(type);

  // Find user by ID
  const user = await UserMongooseModel.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found', ErrorCode.USER_NOT_FOUND);
  }

  // Get the appropriate key
  const key = imageType === ImageType.AVATAR ? user.avatarKey : user.bannerKey;
  if (!key) {
    throw new ApiError(404, 'Image not found', ErrorCode.NOT_FOUND);
  }

  try {
    const { stream, contentType } = await getImage(key);
    ctx.set('Content-Type', contentType);
    ctx.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    ctx.body = stream;
  } catch (error) {
    console.error('Failed to get image:', error);
    throw new ApiError(404, 'Image not found', ErrorCode.NOT_FOUND);
  }
};

/**
 * Get current user's image by type (avatar or banner)
 */
export const getMyImage = async (ctx: AuthContext): Promise<void> => {
  const { userId } = ctx.state.auth;
  const imageType = validateImageType(ctx.params.type);

  const user = await UserMongooseModel.findByAuthId(userId);
  if (!user) {
    throw new ApiError(404, 'User profile not found', ErrorCode.USER_NOT_FOUND);
  }

  const key = imageType === ImageType.AVATAR ? user.avatarKey : user.bannerKey;
  if (!key) {
    throw new ApiError(404, 'Image not found', ErrorCode.NOT_FOUND);
  }

  try {
    const { stream, contentType } = await getImage(key);
    ctx.set('Content-Type', contentType);
    ctx.set('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour
    ctx.body = stream;
  } catch (error) {
    console.error('Failed to get image:', error);
    throw new ApiError(404, 'Image not found', ErrorCode.NOT_FOUND);
  }
};

/**
 * Delete current user's image by type (avatar or banner)
 */
export const deleteUserImage = async (ctx: AuthContext): Promise<void> => {
  const { userId } = ctx.state.auth;
  const imageType = validateImageType(ctx.params.type);

  const user = await UserMongooseModel.findByAuthId(userId);
  if (!user) {
    throw new ApiError(404, 'User profile not found', ErrorCode.USER_NOT_FOUND);
  }

  if (user.isBlocked) {
    throw new ApiError(403, 'User account is blocked', ErrorCode.USER_BLOCKED);
  }

  const key = imageType === ImageType.AVATAR ? user.avatarKey : user.bannerKey;
  if (!key) {
    throw new ApiError(404, 'Image not found', ErrorCode.NOT_FOUND);
  }

  try {
    await deleteImage(key);
  } catch (error) {
    console.error('Failed to delete image:', error);
    throw new ApiError(500, 'Failed to delete image', ErrorCode.SERVER_ERROR);
  }

  // Clear the key from user record
  if (imageType === ImageType.AVATAR) {
    user.avatarKey = undefined;
  } else {
    user.bannerKey = undefined;
  }
  await user.save();

  ctx.status = 200;
  ctx.body = {
    message: 'Image deleted successfully',
  };
};
