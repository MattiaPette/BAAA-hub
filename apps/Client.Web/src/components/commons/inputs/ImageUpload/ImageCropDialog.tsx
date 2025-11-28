import { FC, useState, useCallback, useEffect } from 'react';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import Cropper, { Point, Area } from 'react-easy-crop';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Slider,
  Stack,
  Typography,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { ImageCropDialogProps } from './ImageUpload.model';
import { getCroppedImage } from './ImageUpload.utils';

/**
 * Dialog for cropping and repositioning an image before upload
 */
export const ImageCropDialog: FC<ImageCropDialogProps> = ({
  open,
  onClose,
  onConfirm,
  imageFile,
  aspectRatio = 1,
  variant,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load image when file changes
  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string);
      });
      reader.readAsDataURL(imageFile);
    } else {
      setImageSrc(null);
    }
  }, [imageFile]);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    }
  }, [open]);

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleConfirm = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels || !imageFile) return;

    setIsProcessing(true);
    try {
      const croppedFile = await getCroppedImage(
        imageSrc,
        croppedAreaPixels,
        imageFile.name,
      );
      onConfirm(croppedFile);
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [imageSrc, croppedAreaPixels, imageFile, onConfirm]);

  const handleZoomChange = (_event: Event, value: number | number[]) => {
    setZoom(value as number);
  };

  const getCropHeight = () => {
    if (variant === 'banner') {
      return isMobile ? 200 : 300;
    }
    return 300;
  };
  const cropHeight = getCropHeight();

  return (
    <Dialog
      open={open}
      onClose={isProcessing ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: { borderRadius: isMobile ? 0 : 3 },
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="span" fontWeight={600}>
          {variant === 'banner' ? (
            <Trans>Adjust Banner Image</Trans>
          ) : (
            <Trans>Adjust Profile Picture</Trans>
          )}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 0, position: 'relative' }}>
        <Box
          sx={{
            position: 'relative',
            height: cropHeight,
            bgcolor: 'background.default',
          }}
        >
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              cropShape={variant === 'avatar' ? 'round' : 'rect'}
              showGrid={variant === 'banner'}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          )}
        </Box>

        <Box sx={{ px: 3, py: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <ZoomOutIcon
              color="action"
              fontSize="small"
              aria-hidden="true"
              aria-label={t`Zoom out`}
            />
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={handleZoomChange}
              aria-label={t`Zoom`}
              sx={{ flex: 1 }}
            />
            <ZoomInIcon
              color="action"
              fontSize="small"
              aria-hidden="true"
              aria-label={t`Zoom in`}
            />
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 1 }}
          >
            <Trans>Drag to reposition, scroll or use slider to zoom</Trans>
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isProcessing}>
          <Trans>Cancel</Trans>
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={isProcessing || !croppedAreaPixels}
          startIcon={
            isProcessing ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {isProcessing ? t`Processing...` : t`Apply`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
