import { FC, useState, useEffect } from 'react';
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
} from '@mui/material';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import InstagramIcon from '@mui/icons-material/Instagram';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import LanguageIcon from '@mui/icons-material/Language';
import { SportType, PrivacyLevel } from '@baaa-hub/shared-types';
import { getSportTypeLabel } from '../../helpers/sportTypes';
import {
  ProfileSetupFormInput,
  ProfileSetupFormProps,
} from './ProfileSetup.model';
import { PrivacySelector } from '../../components/commons/inputs/PrivacySelector/PrivacySelector';
import { checkNicknameAvailability } from '../../services/userService';
import { useLanguageContext } from '../../providers/LanguageProvider/LanguageProvider';
import { Language } from '../../providers/LanguageProvider/LanguageProvider.model';
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
    maxWidth: '600px',
    padding: theme.spacing(4),
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
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const [language, setLanguage] = useLanguageContext();

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

  const steps = [
    t`Personal Details`,
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
          return ['sportTypes'];
        case 2:
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
    onSubmit(data);
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
                      {Object.values(SportType).map(sport => (
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
      case 2:
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
      case 3:
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
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img
              src={logo}
              width={60}
              style={{ placeSelf: 'center' }}
              alt="BAAA Hub Logo"
            />
            <Box>
              <Typography component="h1" variant="h5">
                <Trans>Complete Your Profile</Trans>
              </Typography>
            </Box>
          </Box>
          <FormControl size="small" sx={{ minWidth: 120 }}>
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
              <MenuItem value={Language.EN}>English</MenuItem>
              <MenuItem value={Language.IT}>Italiano</MenuItem>
            </Select>
          </FormControl>
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
            maxHeight: '60vh',
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
    </SignUpContainer>
  );
};
