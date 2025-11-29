import { FC, useState, useCallback, useRef, ChangeEvent } from 'react';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useSnackbar } from 'notistack';
import {
  Avatar,
  Box,
  IconButton,
  CircularProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
  useMediaQuery,
  alpha,
  Button,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { PrivacyLevel } from '@baaa-hub/shared-types';
import { ImageUploadProps } from './ImageUpload.model';
import { validateImageFile } from './ImageUpload.utils';
import { ImageCropDialog } from './ImageCropDialog';
import { PrivacySelector } from '../PrivacySelector/PrivacySelector';

/**
 * ImageUpload component for avatar and banner image management
 * Provides hover edit icon on desktop, fixed action on mobile
 * Includes cropping dialog and upload progress
 */
export const ImageUpload: FC<ImageUploadProps> = ({
  variant,
  imageUrl,
  onUpload,
  onDelete,
  privacy = PrivacyLevel.PUBLIC,
  onPrivacyChange,
  isLoading = false,
  disabled = false,
  fallbackText = '?',
  size = 150,
  showPrivacyControls = false,
  onImageClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { enqueueSnackbar } = useSnackbar();

  const [isHovered, setIsHovered] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use preview URL if available, otherwise use provided imageUrl
  const displayUrl = previewUrl || imageUrl;

  const handleFileSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const validation = validateImageFile(file);
      if (!validation.valid) {
        enqueueSnackbar(validation.error || t`Invalid file`, {
          variant: 'error',
        });
        return;
      }

      setSelectedFile(file);
      setCropDialogOpen(true);

      // Reset file input to allow selecting the same file again
      if (fileInputRef.current) {
        // eslint-disable-next-line functional/immutable-data
        fileInputRef.current.value = '';
      }
    },
    [enqueueSnackbar],
  );

  const handleCropConfirm = useCallback(
    async (croppedFile: File) => {
      setCropDialogOpen(false);
      setIsUploading(true);

      // Create preview URL for optimistic update
      const objectUrl = URL.createObjectURL(croppedFile);
      setPreviewUrl(objectUrl);

      try {
        await onUpload(croppedFile);
        enqueueSnackbar(
          variant === 'banner'
            ? t`Banner updated successfully!`
            : t`Profile picture updated successfully!`,
          { variant: 'success' },
        );
      } catch (error) {
        console.error('Upload failed:', error);
        // Revert preview on error
        setPreviewUrl(null);
        enqueueSnackbar(
          variant === 'banner'
            ? t`Failed to update banner. Please try again.`
            : t`Failed to update profile picture. Please try again.`,
          { variant: 'error' },
        );
      } finally {
        setIsUploading(false);
        setSelectedFile(null);
      }
    },
    [onUpload, enqueueSnackbar, variant],
  );

  const handleCropCancel = useCallback(() => {
    setCropDialogOpen(false);
    setSelectedFile(null);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!onDelete) return;

    setIsUploading(true);
    try {
      await onDelete();
      setPreviewUrl(null);
      enqueueSnackbar(
        variant === 'banner'
          ? t`Banner removed successfully!`
          : t`Profile picture removed successfully!`,
        { variant: 'success' },
      );
    } catch (error) {
      console.error('Delete failed:', error);
      enqueueSnackbar(t`Failed to remove image. Please try again.`, {
        variant: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  }, [onDelete, enqueueSnackbar, variant]);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const isInteractable = !disabled && !isLoading && !isUploading;
  const showOverlay = (isMobile || isHovered) && isInteractable;

  // Common file input (hidden)
  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
      onChange={handleFileSelect}
      style={{ display: 'none' }}
      aria-label={
        variant === 'banner'
          ? t`Upload banner image`
          : t`Upload profile picture`
      }
    />
  );

  // Render Avatar variant
  if (variant === 'avatar') {
    return (
      <Stack spacing={1} alignItems="center">
        <Box
          sx={{ position: 'relative', display: 'inline-block' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {fileInput}

          <Avatar
            src={displayUrl}
            sx={{
              width: size,
              height: size,
              fontSize: size / 3,
              fontWeight: 700,
              bgcolor: theme.palette.primary.main,
              border: `4px solid ${theme.palette.background.paper}`,
              boxShadow: theme.shadows[3],
            }}
          >
            {!displayUrl && fallbackText}
          </Avatar>

          {/* Loading/Uploading overlay */}
          {(isLoading || isUploading) && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.common.black, 0.5),
                borderRadius: '50%',
              }}
              role="status"
              aria-label={t`Uploading image`}
            >
              <CircularProgress size={size / 3} sx={{ color: 'white' }} />
            </Box>
          )}

          {/* Edit overlay */}
          {showOverlay && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.common.black, 0.5),
                borderRadius: '50%',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onClick={triggerFileInput}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  triggerFileInput();
                }
              }}
              aria-label={t`Change profile picture`}
            >
              <Stack alignItems="center" spacing={0.5}>
                <PhotoCameraIcon sx={{ color: 'white', fontSize: size / 4 }} />
                <Typography
                  variant="caption"
                  sx={{ color: 'white', fontWeight: 500 }}
                >
                  <Trans>Change</Trans>
                </Typography>
              </Stack>
            </Box>
          )}

          {/* Delete button (mobile only, when image exists) */}
          {isMobile && displayUrl && onDelete && isInteractable && (
            <Tooltip title={t`Remove photo`}>
              <IconButton
                size="small"
                onClick={handleDelete}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'error.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'error.dark' },
                }}
                aria-label={t`Remove profile picture`}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {/* View button (when image exists and onImageClick is provided) */}
          {displayUrl && onImageClick && isInteractable && (
            <Tooltip title={t`View full size`}>
              <IconButton
                size="small"
                onClick={onImageClick}
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
                aria-label={t`View full size profile picture`}
              >
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Privacy selector */}
        {showPrivacyControls && onPrivacyChange && (
          <Box sx={{ width: '100%', maxWidth: 200 }}>
            <PrivacySelector
              value={privacy}
              onChange={onPrivacyChange}
              label={t`Photo Privacy`}
              disabled={disabled}
            />
          </Box>
        )}

        {/* Crop Dialog */}
        <ImageCropDialog
          open={cropDialogOpen}
          onClose={handleCropCancel}
          onConfirm={handleCropConfirm}
          imageFile={selectedFile}
          aspectRatio={1}
          variant="avatar"
        />
      </Stack>
    );
  }

  // Render Banner variant
  return (
    <Box sx={{ position: 'relative' }}>
      {fileInput}

      <Paper
        elevation={0}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          height: { xs: 200, md: 300 },
          borderRadius: { xs: 0, sm: 3 },
          background: displayUrl
            ? `url(${displayUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Loading/Uploading overlay */}
        {(isLoading || isUploading) && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.common.black, 0.5),
            }}
            role="status"
            aria-label={t`Uploading banner`}
          >
            <CircularProgress sx={{ color: 'white' }} />
          </Box>
        )}

        {/* Edit button */}
        {showOverlay && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.common.black, 0.3),
              transition: 'opacity 0.2s',
            }}
          >
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={triggerFileInput}
              sx={{
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                },
              }}
            >
              <Trans>Change Banner</Trans>
            </Button>
          </Box>
        )}

        {/* Mobile: Fixed edit button */}
        {isMobile && isInteractable && !showOverlay && (
          <Tooltip title={t`Edit banner`}>
            <IconButton
              onClick={triggerFileInput}
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': { bgcolor: theme.palette.primary.dark },
              }}
              aria-label={t`Change banner image`}
            >
              <PhotoCameraIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* Delete button (when image exists) */}
        {displayUrl && onDelete && isInteractable && (
          <Tooltip title={t`Remove banner`}>
            <IconButton
              size="small"
              onClick={handleDelete}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'error.main',
                color: 'white',
                '&:hover': { bgcolor: 'error.dark' },
              }}
              aria-label={t`Remove banner image`}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {/* View button (when image exists and onImageClick is provided) */}
        {displayUrl && onImageClick && isInteractable && (
          <Tooltip title={t`View full size`}>
            <IconButton
              size="small"
              onClick={onImageClick}
              sx={{
                position: 'absolute',
                top: 8,
                right: displayUrl && onDelete ? 48 : 8,
                bgcolor: 'background.paper',
                color: 'text.primary',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              aria-label={t`View full size banner`}
            >
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Paper>

      {/* Privacy selector for banner */}
      {showPrivacyControls && onPrivacyChange && (
        <Box sx={{ mt: 2 }}>
          <PrivacySelector
            value={privacy}
            onChange={onPrivacyChange}
            label={t`Banner Privacy`}
            disabled={disabled}
          />
        </Box>
      )}

      {/* Crop Dialog */}
      <ImageCropDialog
        open={cropDialogOpen}
        onClose={handleCropCancel}
        onConfirm={handleCropConfirm}
        imageFile={selectedFile}
        aspectRatio={3}
        variant="banner"
      />
    </Box>
  );
};
