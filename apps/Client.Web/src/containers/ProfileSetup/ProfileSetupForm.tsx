import { FC, useState, useMemo } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  styled,
  TextField,
  Typography,
  useTheme,
  Alert,
  Avatar,
  InputAdornment,
  SvgIcon,
  SvgIconProps,
} from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import { SportType } from '@baaa-hub/shared-types';
import {
  getSportTypeLabel,
  getSportTypeLabels,
} from '../../helpers/sportTypes';
import {
  ProfileSetupFormInput,
  ProfileSetupFormProps,
} from './ProfileSetup.model';
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
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '600px',
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

/**
 * Calculate minimum date of birth (13 years ago)
 */
const getMaxDateOfBirth = (): string => {
  const today = new Date();
  const minDate = new Date(
    today.getFullYear() - 13,
    today.getMonth(),
    today.getDate(),
  );
  return minDate.toISOString().split('T')[0];
};

/**
 * Generate initials from name and surname
 */
const getInitials = (name: string, surname: string): string => {
  const firstInitial = name ? name.charAt(0).toUpperCase() : '';
  const lastInitial = surname ? surname.charAt(0).toUpperCase() : '';
  return `${firstInitial}${lastInitial}`;
};

/**
 * Profile setup form component
 */
export const ProfileSetupForm: FC<ProfileSetupFormProps> = ({
  defaultEmail = '',
  defaultName = '',
  isSubmitting,
  errorMessage,
  onSubmit,
}) => {
  const theme = useTheme();
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
    },
  });

  // Memoize translated sport type labels to avoid re-computation on every render
  const sportTypeLabels = useMemo(getSportTypeLabels, []);

  const watchedName = watch('name');
  const watchedSurname = watch('surname');

  const handleFormSubmit: SubmitHandler<ProfileSetupFormInput> = data => {
    onSubmit(data);
  };

  return (
    <SignUpContainer direction="column" justifyContent="center">
      <StyledCard sx={{ borderColor: theme.palette.grey[600] }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img
            src={logo}
            width={80}
            style={{ placeSelf: 'center' }}
            alt="BAAA Hub Logo"
          />
          <Box>
            <Typography
              component="h1"
              variant="h4"
              sx={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}
            >
              <Trans>Complete Your Profile</Trans>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Trans>Set up your profile to get started</Trans>
            </Typography>
          </Box>
        </Box>

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
          }}
        >
          {/* Avatar Preview */}
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

          {/* Name Fields */}
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

          {/* Nickname */}
          <FormControl fullWidth>
            <TextField
              id="nickname"
              label={t`Nickname`}
              placeholder={t`Choose a unique nickname`}
              fullWidth
              variant="outlined"
              error={!!errors.nickname}
              helperText={
                errors.nickname?.message || t`This will be your public username`
              }
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

          {/* Email */}
          <FormControl fullWidth>
            <TextField
              id="email"
              type="email"
              label={t`Email`}
              placeholder={t`Enter your email`}
              fullWidth
              variant="outlined"
              disabled={!!defaultEmail}
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register('email', {
                required: t`Email is required`,
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t`Invalid email address`,
                },
              })}
            />
          </FormControl>

          {/* Date of Birth */}
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
                  const dob = new Date(value);
                  const maxDate = new Date(getMaxDateOfBirth());
                  if (dob > maxDate) {
                    return t`You must be at least 13 years old`;
                  }
                  return true;
                },
              })}
            />
          </FormControl>

          {/* Sport Types */}
          <FormControl fullWidth error={!!errors.sportTypes}>
            <InputLabel id="sport-types-label">
              <Trans>Sport Types</Trans>
            </InputLabel>
            <Controller
              name="sportTypes"
              control={control}
              rules={{
                validate: value =>
                  (value && value.length > 0) ||
                  t`Select at least one sport type`,
              }}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="sport-types-label"
                  id="sportTypes"
                  multiple
                  input={<OutlinedInput label={t`Sport Types`} />}
                  renderValue={selected => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
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
                      <FormControlLabel
                        control={
                          <Checkbox checked={field.value?.includes(sport)} />
                        }
                        label={sportTypeLabels[sport]}
                        sx={{ m: 0 }}
                      />
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <FormHelperText>
              {errors.sportTypes?.message ||
                t`Select the sports you participate in`}
            </FormHelperText>
          </FormControl>

          {/* Optional Social Links */}
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            <Trans>Social Links (Optional)</Trans>
          </Typography>

          <FormControl fullWidth>
            <TextField
              id="stravaLink"
              label={t`Strava Profile`}
              placeholder="https://www.strava.com/athletes/12345"
              fullWidth
              variant="outlined"
              error={!!errors.stravaLink}
              helperText={
                errors.stravaLink?.message ||
                t`Link to your Strava athlete profile`
              }
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <StravaIcon sx={{ color: '#FC4C02' }} />
                    </InputAdornment>
                  ),
                },
              }}
              {...register('stravaLink', {
                pattern: {
                  value: /^(https:\/\/(www\.)?strava\.com\/athletes\/\d+)?$/,
                  message: t`Invalid Strava profile URL`,
                },
              })}
            />
          </FormControl>

          <FormControl fullWidth>
            <TextField
              id="instagramLink"
              label={t`Instagram Profile`}
              placeholder="https://www.instagram.com/username"
              fullWidth
              variant="outlined"
              error={!!errors.instagramLink}
              helperText={
                errors.instagramLink?.message ||
                t`Link to your Instagram profile`
              }
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <InstagramIcon sx={{ color: '#E1306C' }} />
                    </InputAdornment>
                  ),
                },
              }}
              {...register('instagramLink', {
                pattern: {
                  value:
                    /^(https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?)?$/,
                  message: t`Invalid Instagram profile URL`,
                },
              })}
            />
          </FormControl>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isSubmitting}
            sx={{ mt: 2 }}
          >
            {isSubmitting ? t`Creating Profile...` : t`Complete Setup`}
          </Button>
        </Box>
      </StyledCard>
    </SignUpContainer>
  );
};
