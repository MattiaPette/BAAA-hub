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
 * Get cropped image from canvas
 */
export const getCroppedImage = async (
  imageSrc: string,
  pixelCrop: Readonly<CropArea>,
  originalFileName: string,
): Promise<File> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Set canvas size to the cropped area
  // eslint-disable-next-line functional/immutable-data
  canvas.width = pixelCrop.width;
  // eslint-disable-next-line functional/immutable-data
  canvas.height = pixelCrop.height;

  // Draw the cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  // Convert canvas to blob
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
      0.95,
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
