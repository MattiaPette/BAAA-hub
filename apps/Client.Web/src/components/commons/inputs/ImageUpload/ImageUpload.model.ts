import { PrivacyLevel } from '@baaa-hub/shared-types';

/**
 * Supported image types for upload
 */
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const;

/**
 * Maximum file size in bytes (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Image variant for different use cases
 */
export type ImageVariant = 'avatar' | 'banner';

/**
 * Crop area type from react-easy-crop
 */
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Props for ImageUpload component
 */
export interface ImageUploadProps {
  /** Type of image being uploaded */
  variant: ImageVariant;
  /** Current image URL */
  imageUrl?: string;
  /** Handler called when image is uploaded */
  onUpload: (file: File) => Promise<void>;
  /** Handler called when image is deleted */
  onDelete?: () => Promise<void>;
  /** Optional privacy setting for the image */
  privacy?: PrivacyLevel;
  /** Handler for privacy change */
  onPrivacyChange?: (privacy: PrivacyLevel) => void;
  /** Whether the component is in a loading state */
  isLoading?: boolean;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Fallback text for avatar (initials) */
  fallbackText?: string;
  /** Size for avatar variant (default 120) */
  size?: number;
  /** Whether to show privacy controls */
  showPrivacyControls?: boolean;
}

/**
 * Props for ImageCropDialog component
 */
export interface ImageCropDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Handler called when dialog is closed */
  onClose: () => void;
  /** Handler called when crop is confirmed */
  onConfirm: (croppedFile: File) => void;
  /** The image file to crop */
  imageFile: File | null;
  /** Aspect ratio for cropping (default 1 for avatar, 3 for banner) */
  aspectRatio?: number;
  /** Image variant */
  variant: ImageVariant;
}

/**
 * Validation result for image files
 */
export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}
