import { FC, useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import {
  Box,
  Button,
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
  TextField,
  InputAdornment,
  SvgIcon,
  SvgIconProps,
  Tooltip,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import PublicIcon from '@mui/icons-material/Public';
import GroupIcon from '@mui/icons-material/Group';
import LockIcon from '@mui/icons-material/Lock';
import { SportType, PrivacyLevel } from '@baaa-hub/shared-types';
import { ProfileEditFormInput, ProfileEditProps } from './Profile.model';

const StravaIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.477 0 4.51 11.173h4.171" />
  </SvgIcon>
);

/**
 * Sport type labels for display
 */
const sportTypeLabels: Record<SportType, string> = {
  [SportType.RUNNING]: 'Running',
  [SportType.CYCLING]: 'Cycling',
  [SportType.SWIMMING]: 'Swimming',
  [SportType.TRIATHLON]: 'Triathlon',
  [SportType.TRAIL_RUNNING]: 'Trail Running',
  [SportType.HIKING]: 'Hiking',
  [SportType.WALKING]: 'Walking',
  [SportType.GYM]: 'Gym',
  [SportType.CROSS_FIT]: 'CrossFit',
  [SportType.OTHER]: 'Other',
};

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
 * Privacy selector component
 */
interface PrivacySelectorProps {
  value: PrivacyLevel;
  onChange: (value: PrivacyLevel) => void;
}

const PrivacySelector: FC<PrivacySelectorProps> = ({ value, onChange }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (newValue: PrivacyLevel) => {
    onChange(newValue);
    handleClose();
  };

  const getIcon = (level: PrivacyLevel) => {
    switch (level) {
      case PrivacyLevel.PUBLIC:
        return <PublicIcon fontSize="small" />;
      case PrivacyLevel.FOLLOWERS:
        return <GroupIcon fontSize="small" />;
      case PrivacyLevel.PRIVATE:
        return <LockIcon fontSize="small" />;
      default:
        return <PublicIcon fontSize="small" />;
    }
  };

  const getLabel = (level: PrivacyLevel) => {
    switch (level) {
      case PrivacyLevel.PUBLIC:
        return t`Public`;
      case PrivacyLevel.FOLLOWERS:
        return t`Followers`;
      case PrivacyLevel.PRIVATE:
        return t`Private`;
      default:
        return t`Public`;
    }
  };

  return (
    <>
      <Tooltip title={t`Privacy: ${getLabel(value)}`}>
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ ml: 1, color: 'text.secondary' }}
        >
          {getIcon(value)}
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {Object.values(PrivacyLevel).map(level => (
          <MenuItem
            key={level}
            onClick={() => handleSelect(level)}
            selected={value === level}
          >
            <ListItemIcon>{getIcon(level)}</ListItemIcon>
            <ListItemText>{getLabel(level)}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

/**
 * Profile edit form component
 */
export const ProfileEditForm: FC<ProfileEditProps> = ({
  user,
  onUpdate,
  onCancel,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfileEditFormInput>({
    mode: 'onBlur',
    defaultValues: {
      name: user.name,
      surname: user.surname,
      dateOfBirth: user.dateOfBirth.split('T')[0], // Format for date input
      sportTypes: user.sportTypes as SportType[],
      stravaLink: user.stravaLink || '',
      instagramLink: user.instagramLink || '',
      privacySettings: user.privacySettings || {
        email: PrivacyLevel.PUBLIC,
        dateOfBirth: PrivacyLevel.PUBLIC,
        sportTypes: PrivacyLevel.PUBLIC,
        socialLinks: PrivacyLevel.PUBLIC,
      },
    },
  });

  const handleFormSubmit: SubmitHandler<ProfileEditFormInput> = data => {
    onUpdate(data);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        mt: 2,
      }}
    >
      {/* Name Fields */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <FormControl fullWidth>
          <TextField
            id="name"
            label={t`First Name`}
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

      {/* Date of Birth */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
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
            helperText={errors.dateOfBirth?.message}
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
        <Controller
          name="privacySettings.dateOfBirth"
          control={control}
          render={({ field }) => (
            <PrivacySelector value={field.value} onChange={field.onChange} />
          )}
        />
      </Box>

      {/* Sport Types */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
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
                        label={sportTypeLabels[value]}
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
          <FormHelperText>{errors.sportTypes?.message}</FormHelperText>
        </FormControl>
        <Controller
          name="privacySettings.sportTypes"
          control={control}
          render={({ field }) => (
            <PrivacySelector value={field.value} onChange={field.onChange} />
          )}
        />
      </Box>

      {/* Social Links */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Stack spacing={2} sx={{ width: '100%' }}>
          <FormControl fullWidth>
            <TextField
              id="stravaLink"
              label={t`Strava Profile`}
              placeholder="https://www.strava.com/athletes/12345"
              fullWidth
              variant="outlined"
              error={!!errors.stravaLink}
              helperText={errors.stravaLink?.message}
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
              helperText={errors.instagramLink?.message}
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
        </Stack>
        <Controller
          name="privacySettings.socialLinks"
          control={control}
          render={({ field }) => (
            <PrivacySelector value={field.value} onChange={field.onChange} />
          )}
        />
      </Box>

      {/* Email Privacy */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: 1,
        }}
      >
        <Typography variant="body1">{t`Email Privacy`}</Typography>
        <Controller
          name="privacySettings.email"
          control={control}
          render={({ field }) => (
            <PrivacySelector value={field.value} onChange={field.onChange} />
          )}
        />
      </Box>

      {/* Action Buttons */}
      <Stack
        direction="row"
        spacing={2}
        justifyContent="flex-end"
        sx={{ mt: 2 }}
      >
        <Button onClick={onCancel} disabled={isSubmitting}>
          <Trans>Cancel</Trans>
        </Button>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? t`Saving...` : t`Save Changes`}
        </Button>
      </Stack>
    </Box>
  );
};
