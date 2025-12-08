import {
  FC,
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  useCallback,
} from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import {
  Box,
  Button,
  Card,
  FormControl,
  TextField,
  Typography,
  useTheme,
  Alert,
  Avatar,
  Stack,
  styled,
  Stepper,
  Step,
  StepLabel,
  useMediaQuery,
  MobileStepper,
  Chip,
  Select,
  MenuItem,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  SvgIcon,
  SvgIconProps,
  FormHelperText,
  Checkbox,
  CircularProgress,
  SelectChangeEvent,
  IconButton,
  Tooltip,
} from '@mui/material';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import InstagramIcon from '@mui/icons-material/Instagram';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import LanguageIcon from '@mui/icons-material/Language';
import LogoutIcon from '@mui/icons-material/Logout';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { SportType, PrivacyLevel } from '@baaa-hub/shared-types';
import { useSnackbar } from 'notistack';
import { getSportTypeLabel } from '../../helpers/sportTypes';
import {
  ProfileSetupFormInput,
  ProfileSetupFormProps,
  ProfileSetupFormData,
} from './ProfileSetup.model';
import { PrivacySelector } from '../../components/commons/inputs/PrivacySelector/PrivacySelector';
import { checkNicknameAvailability } from '../../services/userService';
import { useLanguageContext } from '../../providers/LanguageProvider/LanguageProvider';
import { Language } from '../../providers/LanguageProvider/LanguageProvider.model';
import {
  ImageCropDialog,
  validateImageFile,
} from '../../components/commons/inputs/ImageUpload';
import logo from '../../assets/baaa.png';

const StravaIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.477 0 4.51 11.173h4.171" />
  </SvgIcon>
);

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(3),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '700px',
    padding: theme.spacing(4),
  },
  [theme.breakpoints.up('md')]: {
    maxWidth: '800px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '& fieldset': {
    borderColor: theme.palette.text.primary,
    borderWidth: 1,
  },
}));

const getMaxDateOfBirth = (): string => {
  const today = new Date();
  const minDate = new Date(
    today.getFullYear() - 13,
    today.getMonth(),
    today.getDate(),
  );
  return minDate.toISOString().split('T')[0];
};

const getInitials = (name: string, surname: string): string => {
  const firstInitial = name ? name.charAt(0).toUpperCase() : '';
  const lastInitial = surname ? surname.charAt(0).toUpperCase() : '';
  return `${firstInitial}${lastInitial}`;
};

export const ProfileSetupForm: FC<ProfileSetupFormProps> = ({
  defaultEmail = '',
  defaultName = '',
  isSubmitting,
  errorMessage,
  onSubmit,
  onLogout,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { enqueueSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = useState(0);
  const [language, setLanguage] = useLanguageContext();

  // Image upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [cropDialogVariant, setCropDialogVariant] = useState<
    'avatar' | 'banner'
  >('avatar');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    setLanguage(event.target.value as Language);
  };

  // Nickname availability state
  const [nicknameStatus, setNicknameStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    checkedNickname: string;
  }>({
    checking: false,
    available: null,
    checkedNickname: '',
  });

  const [nameParts] = useState(() => {
    const parts = defaultName.split(' ');
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
    };
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ProfileSetupFormInput>({
    mode: 'onBlur',
    defaultValues: {
      name: nameParts.firstName,
      surname: nameParts.lastName,
      nickname: '',
      email: defaultEmail,
      dateOfBirth: '',
      sportTypes: [],
      stravaLink: '',
      instagramLink: '',
      privacySettings: {
        email: PrivacyLevel.PUBLIC,
        dateOfBirth: PrivacyLevel.PUBLIC,
        sportTypes: PrivacyLevel.PUBLIC,
        socialLinks: PrivacyLevel.PUBLIC,
        avatar: PrivacyLevel.PUBLIC,
        banner: PrivacyLevel.PUBLIC,
      },
    },
  });

  const watchedName = watch('name');
  const watchedSurname = watch('surname');
  const watchedNickname = watch('nickname');

  // Debounced nickname availability check
  useEffect(() => {
    // Validate nickname format first
    const rawNickname = (watchedNickname || '').trim();
    const trimmedNickname = rawNickname.toLowerCase();

    // Check format before lowercasing to use correct regex
    if (rawNickname.length < 3 || !/^[a-zA-Z0-9_]+$/.test(rawNickname)) {
      setNicknameStatus({
        checking: false,
        available: null,
        checkedNickname: '',
      });
      return undefined;
    }

    // Set checking state
    setNicknameStatus(prev => ({
      ...prev,
      checking: true,
    }));

    // Debounce the API call
    const timeoutId = setTimeout(() => {
      checkNicknameAvailability(trimmedNickname)
        .then(result => {
          setNicknameStatus({
            checking: false,
            available: result.available,
            checkedNickname: trimmedNickname,
          });

          // Set or clear form error based on availability
          if (!result.available) {
            setError('nickname', {
              type: 'nicknameTaken',
              message: t`This nickname is already taken`,
            });
          }
        })
        .catch((error: unknown) => {
          // Log error but don't block the form
          console.warn('Nickname availability check failed:', error);
          setNicknameStatus({
            checking: false,
            available: null,
            checkedNickname: '',
          });
        });
    }, 500);

    // Cleanup timeout on unmount or when nickname changes
    return () => {
      clearTimeout(timeoutId);
    };
  }, [watchedNickname, setError]);

  // Clear nickname taken error when user types a new valid nickname
  useEffect(() => {
    if (
      errors.nickname?.type === 'nicknameTaken' &&
      nicknameStatus.available === true
    ) {
      clearErrors('nickname');
    }
  }, [nicknameStatus.available, errors.nickname?.type, clearErrors]);

  // Image file selection handlers
  const handleImageSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement>, variant: 'avatar' | 'banner') => {
      const file = event.target.files?.[0];
      if (!file) return;

      const validation = validateImageFile(file);
      if (!validation.valid) {
        enqueueSnackbar(validation.error || t`Invalid file`, {
          variant: 'error',
        });
        // Reset the input
        if (variant === 'avatar' && avatarInputRef.current) {
          // eslint-disable-next-line functional/immutable-data
          avatarInputRef.current.value = '';
        } else if (variant === 'banner' && bannerInputRef.current) {
          // eslint-disable-next-line functional/immutable-data
          bannerInputRef.current.value = '';
        }
        return;
      }

      setSelectedImageFile(file);
      setCropDialogVariant(variant);
      setCropDialogOpen(true);

      // Reset file input to allow selecting the same file again
      if (variant === 'avatar' && avatarInputRef.current) {
        // eslint-disable-next-line functional/immutable-data
        avatarInputRef.current.value = '';
      } else if (variant === 'banner' && bannerInputRef.current) {
        // eslint-disable-next-line functional/immutable-data
        bannerInputRef.current.value = '';
      }
    },
    [enqueueSnackbar],
  );

  const handleCropConfirm = useCallback(
    (croppedFile: File) => {
      setCropDialogOpen(false);

      // Create preview URL
      const objectUrl = URL.createObjectURL(croppedFile);

      if (cropDialogVariant === 'avatar') {
        // Revoke old preview URL if exists
        if (avatarPreview) {
          URL.revokeObjectURL(avatarPreview);
        }
        setAvatarFile(croppedFile);
        setAvatarPreview(objectUrl);
      } else {
        // Revoke old preview URL if exists
        if (bannerPreview) {
          URL.revokeObjectURL(bannerPreview);
        }
        setBannerFile(croppedFile);
        setBannerPreview(objectUrl);
      }

      setSelectedImageFile(null);
    },
    [cropDialogVariant, avatarPreview, bannerPreview],
  );

  const handleCropCancel = useCallback(() => {
    setCropDialogOpen(false);
    setSelectedImageFile(null);
  }, []);

  const handleRemoveAvatar = useCallback(() => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(null);
    setAvatarPreview(null);
  }, [avatarPreview]);

  const handleRemoveBanner = useCallback(() => {
    if (bannerPreview) {
      URL.revokeObjectURL(bannerPreview);
    }
    setBannerFile(null);
    setBannerPreview(null);
  }, [bannerPreview]);

  // Cleanup preview URLs on unmount
  useEffect(
    () => () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      if (bannerPreview) {
        URL.revokeObjectURL(bannerPreview);
      }
    },
    [avatarPreview, bannerPreview],
  );

  const steps = [
    t`Personal Details`,
    t`Profile Picture`,
    t`Sports`,
    t`Contact & Social`,
    t`Privacy`,
  ];

  const handleNext = async () => {
    const getFieldsToValidate = (
      step: number,
    ): (keyof ProfileSetupFormInput)[] => {
      switch (step) {
        case 0:
          return ['name', 'surname', 'nickname', 'dateOfBirth'];
        case 1:
          // Profile Picture step - no form validation needed
          return [];
        case 2:
          return ['sportTypes'];
        case 3:
          return ['stravaLink', 'instagramLink'];
        default:
          return [];
      }
    };

    const fieldsToValidate = getFieldsToValidate(activeStep);
    const valid =
      fieldsToValidate.length > 0 ? await trigger(fieldsToValidate) : true;

    // Also check if nickname is taken (for step 0)
    if (activeStep === 0 && nicknameStatus.available === false) {
      setError('nickname', {
        type: 'manual',
        message: t`This nickname is already taken`,
      });
      return;
    }

    if (valid) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleFormSubmit: SubmitHandler<ProfileSetupFormInput> = data => {
    const formData: ProfileSetupFormData = {
      ...data,
      avatarFile: avatarFile || undefined,
      bannerFile: bannerFile || undefined,
    };
    onSubmit(formData);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  backgroundColor: theme.palette.primary.main,
                  fontSize: '2rem',
                  fontWeight: 600,
                }}
              >
                {getInitials(watchedName, watchedSurname) || '?'}
              </Avatar>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <TextField
                  id="name"
                  label={t`First Name`}
                  placeholder={t`Enter your first name`}
                  autoFocus
                  fullWidth
                  variant="outlined"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  {...register('name', {
                    required: t`First name is required`,
                    maxLength: {
                      value: 50,
                      message: t`First name must be 50 characters or less`,
                    },
                  })}
                />
              </FormControl>
              <FormControl fullWidth>
                <TextField
                  id="surname"
                  label={t`Last Name`}
                  placeholder={t`Enter your last name`}
                  fullWidth
                  variant="outlined"
                  error={!!errors.surname}
                  helperText={errors.surname?.message}
                  {...register('surname', {
                    required: t`Last name is required`,
                    maxLength: {
                      value: 50,
                      message: t`Last name must be 50 characters or less`,
                    },
                  })}
                />
              </FormControl>
            </Stack>
            <FormControl fullWidth>
              <TextField
                id="nickname"
                label={t`Nickname`}
                placeholder={t`Choose a unique nickname`}
                fullWidth
                variant="outlined"
                error={!!errors.nickname || nicknameStatus.available === false}
                helperText={
                  errors.nickname?.message ||
                  (nicknameStatus.available === true
                    ? t`This nickname is available`
                    : t`This will be your public username`)
                }
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        {nicknameStatus.checking && (
                          <CircularProgress size={20} />
                        )}
                        {!nicknameStatus.checking &&
                          nicknameStatus.available === true && (
                            <CheckCircleIcon color="success" />
                          )}
                        {!nicknameStatus.checking &&
                          nicknameStatus.available === false && (
                            <ErrorIcon color="error" />
                          )}
                      </InputAdornment>
                    ),
                  },
                  formHelperText: {
                    sx: {
                      color:
                        nicknameStatus.available === true
                          ? 'success.main'
                          : undefined,
                    },
                  },
                }}
                {...register('nickname', {
                  required: t`Nickname is required`,
                  minLength: {
                    value: 3,
                    message: t`Nickname must be at least 3 characters`,
                  },
                  maxLength: {
                    value: 30,
                    message: t`Nickname must be 30 characters or less`,
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: t`Only letters, numbers, and underscores allowed`,
                  },
                })}
              />
            </FormControl>
            <FormControl fullWidth>
              <TextField
                id="dateOfBirth"
                type="date"
                label={t`Date of Birth`}
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: getMaxDateOfBirth() }}
                error={!!errors.dateOfBirth}
                helperText={
                  errors.dateOfBirth?.message ||
                  t`You must be at least 13 years old`
                }
                {...register('dateOfBirth', {
                  required: t`Date of birth is required`,
                  validate: value => {
                    const date = new Date(value);
                    const maxDate = new Date(getMaxDateOfBirth());
                    return (
                      date <= maxDate || t`You must be at least 13 years old`
                    );
                  },
                })}
              />
            </FormControl>
          </Stack>
        );
      case 1:
        // Profile Picture step
        return (
          <Stack spacing={3} alignItems="center">
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
            >
              <Trans>
                Add a profile picture and banner to personalize your profile
              </Trans>
            </Typography>

            {/* Banner Upload */}
            <Box sx={{ width: '100%' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                <Trans>Banner Image</Trans>
              </Typography>
              <Box
                sx={{
                  position: 'relative',
                  height: 120,
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: bannerPreview ? 'transparent' : 'action.hover',
                  backgroundImage: bannerPreview
                    ? `url(${bannerPreview})`
                    : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '2px dashed',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: bannerPreview ? 'transparent' : 'action.selected',
                  },
                }}
                onClick={() => bannerInputRef.current?.click()}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    bannerInputRef.current?.click();
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={t`Upload banner image`}
              >
                {!bannerPreview && (
                  <Stack alignItems="center" spacing={1}>
                    <PhotoCameraIcon color="action" />
                    <Typography variant="caption" color="text.secondary">
                      <Trans>Click to upload banner</Trans>
                    </Typography>
                  </Stack>
                )}
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                  onChange={e => handleImageSelect(e, 'banner')}
                  style={{ display: 'none' }}
                  aria-label={t`Upload banner image`}
                />
              </Box>
              {bannerPreview && (
                <Button
                  size="small"
                  color="error"
                  onClick={handleRemoveBanner}
                  sx={{ mt: 1 }}
                >
                  <Trans>Remove banner</Trans>
                </Button>
              )}
            </Box>

            {/* Avatar Upload */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                <Trans>Profile Picture</Trans>
              </Typography>
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-block',
                  cursor: 'pointer',
                }}
                onClick={() => avatarInputRef.current?.click()}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    avatarInputRef.current?.click();
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={t`Upload profile picture`}
              >
                <Avatar
                  src={avatarPreview || undefined}
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: avatarPreview
                      ? 'transparent'
                      : theme.palette.primary.main,
                    fontSize: '2.5rem',
                    fontWeight: 600,
                    border: '3px dashed',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  {!avatarPreview &&
                    (getInitials(watchedName, watchedSurname) || (
                      <PhotoCameraIcon />
                    ))}
                </Avatar>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                  onChange={e => handleImageSelect(e, 'avatar')}
                  style={{ display: 'none' }}
                  aria-label={t`Upload profile picture`}
                />
              </Box>
              {avatarPreview && (
                <Box>
                  <Button
                    size="small"
                    color="error"
                    onClick={handleRemoveAvatar}
                    sx={{ mt: 1 }}
                  >
                    <Trans>Remove photo</Trans>
                  </Button>
                </Box>
              )}
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="center"
            >
              <Trans>Supports JPG, PNG, WEBP, HEIC. Max 5MB.</Trans>
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="center"
            >
              <Trans>You can skip this step and add photos later.</Trans>
            </Typography>
          </Stack>
        );
      case 2:
        return (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box>
              <FormControl fullWidth error={!!errors.sportTypes}>
                <InputLabel id="sport-types-label">
                  <Trans>Favorite Sports</Trans>
                </InputLabel>
                <Controller
                  name="sportTypes"
                  control={control}
                  rules={{
                    required: t`Please select at least one sport`,
                    validate: value =>
                      (value && value.length <= 5) ||
                      t`You can select up to 5 sports`,
                  }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="sport-types-label"
                      id="sportTypes"
                      multiple
                      input={<OutlinedInput label={t`Favorite Sports`} />}
                      renderValue={selected => (
                        <Box
                          sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
                        >
                          {(selected as SportType[]).map(value => (
                            <Chip
                              key={value}
                              label={getSportTypeLabel(value)}
                              size="small"
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {(Object.values(SportType) as SportType[]).map(sport => (
                        <MenuItem key={sport} value={sport}>
                          <Checkbox checked={field.value.indexOf(sport) > -1} />
                          <Typography>{getSportTypeLabel(sport)}</Typography>
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.sportTypes && (
                  <FormHelperText>{errors.sportTypes.message}</FormHelperText>
                )}
              </FormControl>
            </Box>
          </Stack>
        );
      case 3:
        return (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <TextField
                id="stravaLink"
                label={t`Strava Profile URL`}
                placeholder="https://www.strava.com/athletes/..."
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <StravaIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                error={!!errors.stravaLink}
                helperText={errors.stravaLink?.message}
                {...register('stravaLink', {
                  pattern: {
                    value: /^https?:\/\/(www\.)?strava\.com\/athletes\/[0-9]+$/,
                    message: t`Invalid Strava profile URL`,
                  },
                })}
              />
            </FormControl>
            <FormControl fullWidth>
              <TextField
                id="instagramLink"
                label={t`Instagram Profile URL`}
                placeholder="https://www.instagram.com/..."
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <InstagramIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                error={!!errors.instagramLink}
                helperText={errors.instagramLink?.message}
                {...register('instagramLink', {
                  pattern: {
                    value:
                      /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/,
                    message: t`Invalid Instagram profile URL`,
                  },
                })}
              />
            </FormControl>
          </Stack>
        );
      case 4:
        return (
          <Stack spacing={2}>
            <Typography variant="subtitle1" gutterBottom>
              <Trans>Who can see your information?</Trans>
            </Typography>

            <Controller
              name="privacySettings.email"
              control={control}
              render={({ field }) => (
                <PrivacySelector
                  value={field.value}
                  onChange={field.onChange}
                  label={t`Email Privacy`}
                />
              )}
            />

            <Controller
              name="privacySettings.dateOfBirth"
              control={control}
              render={({ field }) => (
                <PrivacySelector
                  value={field.value}
                  onChange={field.onChange}
                  label={t`Date of Birth Privacy`}
                />
              )}
            />

            <Controller
              name="privacySettings.sportTypes"
              control={control}
              render={({ field }) => (
                <PrivacySelector
                  value={field.value}
                  onChange={field.onChange}
                  label={t`Sports Privacy`}
                />
              )}
            />

            <Controller
              name="privacySettings.socialLinks"
              control={control}
              render={({ field }) => (
                <PrivacySelector
                  value={field.value}
                  onChange={field.onChange}
                  label={t`Social Links Privacy`}
                />
              )}
            />

            <Controller
              name="privacySettings.avatar"
              control={control}
              render={({ field }) => (
                <PrivacySelector
                  value={field.value || PrivacyLevel.PUBLIC}
                  onChange={field.onChange}
                  label={t`Profile Picture Privacy`}
                />
              )}
            />

            <Controller
              name="privacySettings.banner"
              control={control}
              render={({ field }) => (
                <PrivacySelector
                  value={field.value || PrivacyLevel.PUBLIC}
                  onChange={field.onChange}
                  label={t`Banner Privacy`}
                />
              )}
            />
          </Stack>
        );
      default:
        return null;
    }
  };

  return (
    <SignUpContainer direction="column" justifyContent="center">
      <StyledCard sx={{ borderColor: theme.palette.grey[600] }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1, sm: 2 },
              flexShrink: 1,
              minWidth: 0,
            }}
          >
            <img
              src={logo}
              width={isMobile ? 40 : 60}
              style={{ placeSelf: 'center', flexShrink: 0 }}
              alt="BAAA Hub Logo"
            />
            <Typography
              component="h1"
              variant={isMobile ? 'subtitle1' : 'h5'}
              sx={{
                whiteSpace: { xs: 'normal', sm: 'nowrap' },
                fontWeight: 600,
              }}
            >
              <Trans>Complete Your Profile</Trans>
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{ flexShrink: 0, ml: 'auto' }}
          >
            <FormControl size="small" sx={{ minWidth: isMobile ? 70 : 120 }}>
              <Select
                id="language-selector"
                aria-label={t`Select Language`}
                value={language}
                onChange={handleLanguageChange}
                startAdornment={
                  <InputAdornment position="start">
                    <LanguageIcon fontSize="small" aria-hidden="true" />
                  </InputAdornment>
                }
                sx={{ '& .MuiSelect-select': { py: 1 } }}
              >
                <MenuItem value={Language.EN}>
                  {isMobile ? 'EN' : 'English'}
                </MenuItem>
                <MenuItem value={Language.IT}>
                  {isMobile ? 'IT' : 'Italiano'}
                </MenuItem>
              </Select>
            </FormControl>
            <Tooltip title={t`Logout`}>
              <IconButton
                color="error"
                size="small"
                onClick={onLogout}
                disabled={isSubmitting}
                aria-label={t`Logout`}
                sx={{
                  border: 1,
                  borderColor: 'error.main',
                  '&:hover': {
                    bgcolor: 'error.main',
                    color: 'white',
                  },
                }}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {!isMobile && (
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 2,
            mt: 2,
            flexGrow: 1,
            overflowY: 'auto',
            maxHeight: { xs: '55vh', sm: '60vh', md: '65vh' },
            px: 1,
          }}
        >
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {isMobile && (
            <MobileStepper
              variant="dots"
              steps={steps.length}
              position="static"
              activeStep={activeStep}
              sx={{ flexGrow: 1, bgcolor: 'transparent' }}
              nextButton={null}
              backButton={null}
            />
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0 || isSubmitting}
              onClick={handleBack}
              startIcon={<KeyboardArrowLeft />}
            >
              <Trans>Back</Trans>
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit(handleFormSubmit)}
                disabled={isSubmitting}
              >
                {isSubmitting ? t`Creating...` : t`Create Profile`}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<KeyboardArrowRight />}
              >
                <Trans>Next</Trans>
              </Button>
            )}
          </Box>
        </Box>
      </StyledCard>

      {/* Image Crop Dialog */}
      <ImageCropDialog
        open={cropDialogOpen}
        onClose={handleCropCancel}
        onConfirm={handleCropConfirm}
        imageFile={selectedImageFile}
        aspectRatio={cropDialogVariant === 'avatar' ? 1 : 3}
        variant={cropDialogVariant}
      />
    </SignUpContainer>
  );
};
