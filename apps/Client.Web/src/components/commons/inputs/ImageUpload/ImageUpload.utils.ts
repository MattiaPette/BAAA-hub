import { t } from '@lingui/core/macro';
import {
  SUPPORTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  ImageValidationResult,
  CropArea,
} from './ImageUpload.model';

/**
 * Validate an image file for upload
 */
export const validateImageFile = (file: File): ImageValidationResult => {
  // Check file type
  const fileType = file.type.toLowerCase();
  if (
    !SUPPORTED_IMAGE_TYPES.includes(
      fileType as (typeof SUPPORTED_IMAGE_TYPES)[number],
    )
  ) {
    return {
      valid: false,
      error: t`File type not supported. Please use JPG, PNG, WEBP, or HEIC.`,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: t`File is too large. Maximum size is 5MB.`,
    };
  }

  return { valid: true };
};

/**
 * Create an image element from a file
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', reject);
    // eslint-disable-next-line functional/immutable-data
    image.src = url;
  });

/**
 * Minimum dimensions for cropped images to ensure good display quality.
 * - Avatar: 400px ensures crisp display on high-DPI screens at common sizes (100-200px displayed)
 * - Banner: 1200x400 matches common viewport widths and 3:1 aspect ratio for banner display
 */
const MIN_AVATAR_SIZE = 400;
const MIN_BANNER_WIDTH = 1200;
const MIN_BANNER_HEIGHT = 400;

/**
 * JPEG quality setting (0.92) balances file size and visual quality.
 * Higher than 0.90 preserves details in photos, lower than 0.95 keeps reasonable file sizes.
 */
const JPEG_QUALITY = 0.92;

/**
 * Calculate the output dimensions for a cropped image
 * Ensures minimum dimensions for good display quality
 */
const calculateOutputDimensions = (
  cropWidth: number,
  cropHeight: number,
  isAvatar: boolean,
): { width: number; height: number } => {
  if (isAvatar) {
    // For avatars, ensure minimum size
    if (cropWidth < MIN_AVATAR_SIZE) {
      const scale = MIN_AVATAR_SIZE / cropWidth;
      return {
        width: MIN_AVATAR_SIZE,
        height: Math.round(cropHeight * scale),
      };
    }
    return { width: cropWidth, height: cropHeight };
  }

  // For banners, ensure minimum dimensions
  const widthScale = MIN_BANNER_WIDTH / cropWidth;
  const heightScale = MIN_BANNER_HEIGHT / cropHeight;
  const scale = Math.max(widthScale, heightScale, 1);

  if (scale > 1) {
    return {
      width: Math.round(cropWidth * scale),
      height: Math.round(cropHeight * scale),
    };
  }

  return { width: cropWidth, height: cropHeight };
};

/**
 * Get cropped image from canvas with high quality output
 * Ensures minimum dimensions for good display quality
 */
export const getCroppedImage = async (
  imageSrc: string,
  pixelCrop: Readonly<CropArea>,
  originalFileName: string,
  isAvatar: boolean = false,
): Promise<File> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Calculate output dimensions - scale up if needed for quality
  const { width: outputWidth, height: outputHeight } =
    calculateOutputDimensions(pixelCrop.width, pixelCrop.height, isAvatar);

  // Set canvas size to the output dimensions
  // eslint-disable-next-line functional/immutable-data
  canvas.width = outputWidth;
  // eslint-disable-next-line functional/immutable-data
  canvas.height = outputHeight;

  // Enable high-quality image rendering
  // eslint-disable-next-line functional/immutable-data
  ctx.imageSmoothingEnabled = true;
  // eslint-disable-next-line functional/immutable-data
  ctx.imageSmoothingQuality = 'high';

  // Draw the cropped image scaled to output dimensions
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  // Convert canvas to blob with high quality
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        // Create a new file with the original name
        const file = new File([blob], originalFileName, { type: 'image/jpeg' });
        resolve(file);
      },
      'image/jpeg',
      JPEG_QUALITY,
    );
  });
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
