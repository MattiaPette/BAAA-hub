import { FC, useMemo, useState } from 'react';
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
  Autocomplete,
} from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import LanguageIcon from '@mui/icons-material/Language';
import PublicIcon from '@mui/icons-material/Public';
import GroupIcon from '@mui/icons-material/Group';
import LockIcon from '@mui/icons-material/Lock';
import { SportType, PrivacyLevel } from '@baaa-hub/shared-types';
import { getSportTypeLabels } from '../../helpers/sportTypes';
import { countries, getCountryFlag } from '../../helpers/countries';
import { ProfileEditFormInput, ProfileEditProps } from './Profile.model';

const StravaIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.477 0 4.51 11.173h4.171" />
  </SvgIcon>
);

const GarminIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M12.9 2.6c-.5-.6-1.3-.6-1.9 0L2.6 11.1c-.6.6-.6 1.3 0 1.9l8.5 8.4c.5.6 1.3.6 1.9 0l8.4-8.4c.6-.6.6-1.3 0-1.9L12.9 2.6zM12 17.2l-5.2-5.2L12 6.8l5.2 5.2-5.2 5.2z" />
  </SvgIcon>
);

const TikTokIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </SvgIcon>
);

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
      youtubeLink: user.youtubeLink || '',
      garminLink: user.garminLink || '',
      tiktokLink: user.tiktokLink || '',
      personalWebsiteLink: user.personalWebsiteLink || '',
      country: user.country || '',
      description: user.description || '',
      cityRegion: user.cityRegion || '',
      personalStats: {
        height: user.personalStats?.height || undefined,
        weight: user.personalStats?.weight || undefined,
      },
      personalAchievements: {
        time5k: user.personalAchievements?.time5k || '',
        time10k: user.personalAchievements?.time10k || '',
        timeHalfMarathon: user.personalAchievements?.timeHalfMarathon || '',
        timeMarathon: user.personalAchievements?.timeMarathon || '',
      },
      privacySettings: {
        email: user.privacySettings?.email || PrivacyLevel.PUBLIC,
        dateOfBirth: user.privacySettings?.dateOfBirth || PrivacyLevel.PUBLIC,
        sportTypes: user.privacySettings?.sportTypes || PrivacyLevel.PUBLIC,
        socialLinks: user.privacySettings?.socialLinks || PrivacyLevel.PUBLIC,
        avatar: user.privacySettings?.avatar || PrivacyLevel.PUBLIC,
        banner: user.privacySettings?.banner || PrivacyLevel.PUBLIC,
        description: user.privacySettings?.description || PrivacyLevel.PUBLIC,
        cityRegion: user.privacySettings?.cityRegion || PrivacyLevel.PUBLIC,
        personalStats:
          user.privacySettings?.personalStats || PrivacyLevel.PUBLIC,
        personalAchievements:
          user.privacySettings?.personalAchievements || PrivacyLevel.PUBLIC,
      },
    },
  });

  // Memoize translated sport type labels to avoid re-computation on every render
  const sportTypeLabels = useMemo(getSportTypeLabels, []);

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

          <FormControl fullWidth>
            <TextField
              id="youtubeLink"
              label={t`YouTube Channel`}
              placeholder="https://www.youtube.com/@username"
              fullWidth
              variant="outlined"
              error={!!errors.youtubeLink}
              helperText={errors.youtubeLink?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <YouTubeIcon sx={{ color: '#FF0000' }} />
                    </InputAdornment>
                  ),
                },
              }}
              {...register('youtubeLink', {
                pattern: {
                  value:
                    /^(https:\/\/(www\.)?youtube\.com\/(channel\/UC[\w-]{22}|c\/[\w-]+|user\/[\w-]+|@[\w-]+)\/?)?$/,
                  message: t`Invalid YouTube profile URL`,
                },
              })}
            />
          </FormControl>

          <FormControl fullWidth>
            <TextField
              id="garminLink"
              label={t`Garmin Connect Profile`}
              placeholder="https://connect.garmin.com/modern/profile/username"
              fullWidth
              variant="outlined"
              error={!!errors.garminLink}
              helperText={errors.garminLink?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <GarminIcon sx={{ color: '#007CC3' }} />
                    </InputAdornment>
                  ),
                },
              }}
              {...register('garminLink', {
                pattern: {
                  value:
                    /^(https:\/\/connect\.garmin\.com\/modern\/profile\/[\w-]+)?$/,
                  message: t`Invalid Garmin Connect profile URL`,
                },
              })}
            />
          </FormControl>

          <FormControl fullWidth>
            <TextField
              id="tiktokLink"
              label={t`TikTok Profile`}
              placeholder="https://www.tiktok.com/@username"
              fullWidth
              variant="outlined"
              error={!!errors.tiktokLink}
              helperText={errors.tiktokLink?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <TikTokIcon />
                    </InputAdornment>
                  ),
                },
              }}
              {...register('tiktokLink', {
                pattern: {
                  value: /^(https:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/?)?$/,
                  message: t`Invalid TikTok profile URL`,
                },
              })}
            />
          </FormControl>

          <FormControl fullWidth>
            <TextField
              id="personalWebsiteLink"
              label={t`Personal Website`}
              placeholder="https://www.example.com"
              fullWidth
              variant="outlined"
              error={!!errors.personalWebsiteLink}
              helperText={errors.personalWebsiteLink?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LanguageIcon />
                    </InputAdornment>
                  ),
                },
              }}
              {...register('personalWebsiteLink', {
                pattern: {
                  value: /^(https?:\/\/.+\..+)?$/,
                  message: t`Invalid website URL`,
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

      {/* Country */}
      <FormControl fullWidth>
        <Controller
          name="country"
          control={control}
          render={({ field }) => (
            <Autocomplete
              {...field}
              options={countries}
              getOptionLabel={option =>
                typeof option === 'string'
                  ? countries.find(c => c.code === option)?.name || option
                  : option.name
              }
              value={countries.find(c => c.code === field.value) || null}
              onChange={(_event, newValue) => {
                field.onChange(newValue?.code || '');
              }}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <span style={{ marginRight: 8 }}>
                    {getCountryFlag(option.code)}
                  </span>
                  {option.name}
                </Box>
              )}
              renderInput={params => (
                <TextField
                  {...params}
                  label={t`Country`}
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      startAdornment: field.value ? (
                        <InputAdornment position="start">
                          {getCountryFlag(field.value)}
                        </InputAdornment>
                      ) : null,
                    },
                  }}
                />
              )}
            />
          )}
        />
      </FormControl>

      {/* Description */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <FormControl fullWidth>
          <TextField
            id="description"
            label={t`About Me`}
            placeholder={t`Tell us about yourself...`}
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            error={!!errors.description}
            helperText={errors.description?.message || t`Max 500 characters`}
            {...register('description', {
              maxLength: {
                value: 500,
                message: t`Description must be 500 characters or less`,
              },
            })}
          />
        </FormControl>
        <Controller
          name="privacySettings.description"
          control={control}
          render={({ field }) => (
            <PrivacySelector
              value={field.value || PrivacyLevel.PUBLIC}
              onChange={field.onChange}
            />
          )}
        />
      </Box>

      {/* City/Region */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <FormControl fullWidth>
          <TextField
            id="cityRegion"
            label={t`City / Region`}
            placeholder={t`e.g., Milan, Lombardy`}
            fullWidth
            variant="outlined"
            error={!!errors.cityRegion}
            helperText={errors.cityRegion?.message}
            {...register('cityRegion', {
              maxLength: {
                value: 100,
                message: t`City/Region must be 100 characters or less`,
              },
            })}
          />
        </FormControl>
        <Controller
          name="privacySettings.cityRegion"
          control={control}
          render={({ field }) => (
            <PrivacySelector
              value={field.value || PrivacyLevel.PUBLIC}
              onChange={field.onChange}
            />
          )}
        />
      </Box>

      {/* Personal Stats */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Stack spacing={2} sx={{ width: '100%' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            <Trans>Personal Stats</Trans>
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl fullWidth>
              <TextField
                id="height"
                label={t`Height (cm)`}
                type="number"
                fullWidth
                variant="outlined"
                error={!!errors.personalStats?.height}
                helperText={errors.personalStats?.height?.message}
                {...register('personalStats.height', {
                  valueAsNumber: true,
                  min: {
                    value: 0,
                    message: t`Height must be positive`,
                  },
                })}
              />
            </FormControl>
            <FormControl fullWidth>
              <TextField
                id="weight"
                label={t`Weight (kg)`}
                type="number"
                fullWidth
                variant="outlined"
                error={!!errors.personalStats?.weight}
                helperText={errors.personalStats?.weight?.message}
                {...register('personalStats.weight', {
                  valueAsNumber: true,
                  min: {
                    value: 0,
                    message: t`Weight must be positive`,
                  },
                })}
              />
            </FormControl>
          </Stack>
        </Stack>
        <Controller
          name="privacySettings.personalStats"
          control={control}
          render={({ field }) => (
            <PrivacySelector
              value={field.value || PrivacyLevel.PUBLIC}
              onChange={field.onChange}
            />
          )}
        />
      </Box>

      {/* Personal Achievements */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Stack spacing={2} sx={{ width: '100%' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            <Trans>Personal Achievements</Trans>
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl fullWidth>
              <TextField
                id="time5k"
                label={t`5K Time`}
                placeholder="MM:SS"
                fullWidth
                variant="outlined"
                error={!!errors.personalAchievements?.time5k}
                helperText={
                  errors.personalAchievements?.time5k?.message ||
                  t`Format: MM:SS or HH:MM:SS`
                }
                {...register('personalAchievements.time5k', {
                  pattern: {
                    value: /^(\d{2}:\d{2}:\d{2}|\d{2}:\d{2})$/,
                    message: t`Invalid time format (use MM:SS or HH:MM:SS)`,
                  },
                })}
              />
            </FormControl>
            <FormControl fullWidth>
              <TextField
                id="time10k"
                label={t`10K Time`}
                placeholder="MM:SS or HH:MM:SS"
                fullWidth
                variant="outlined"
                error={!!errors.personalAchievements?.time10k}
                helperText={
                  errors.personalAchievements?.time10k?.message ||
                  t`Format: MM:SS or HH:MM:SS`
                }
                {...register('personalAchievements.time10k', {
                  pattern: {
                    value: /^(\d{2}:\d{2}:\d{2}|\d{2}:\d{2})$/,
                    message: t`Invalid time format (use MM:SS or HH:MM:SS)`,
                  },
                })}
              />
            </FormControl>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl fullWidth>
              <TextField
                id="timeHalfMarathon"
                label={t`Half Marathon Time`}
                placeholder="HH:MM:SS or MM:SS"
                fullWidth
                variant="outlined"
                error={!!errors.personalAchievements?.timeHalfMarathon}
                helperText={
                  errors.personalAchievements?.timeHalfMarathon?.message ||
                  t`Format: HH:MM:SS or MM:SS`
                }
                {...register('personalAchievements.timeHalfMarathon', {
                  pattern: {
                    value: /^(\d{2}:\d{2}:\d{2}|\d{2}:\d{2})$/,
                    message: t`Invalid time format (use HH:MM:SS or MM:SS)`,
                  },
                })}
              />
            </FormControl>
            <FormControl fullWidth>
              <TextField
                id="timeMarathon"
                label={t`Marathon Time`}
                placeholder="HH:MM:SS or MM:SS"
                fullWidth
                variant="outlined"
                error={!!errors.personalAchievements?.timeMarathon}
                helperText={
                  errors.personalAchievements?.timeMarathon?.message ||
                  t`Format: HH:MM:SS or MM:SS`
                }
                {...register('personalAchievements.timeMarathon', {
                  pattern: {
                    value: /^(\d{2}:\d{2}:\d{2}|\d{2}:\d{2})$/,
                    message: t`Invalid time format (use HH:MM:SS or MM:SS)`,
                  },
                })}
              />
            </FormControl>
          </Stack>
        </Stack>
        <Controller
          name="privacySettings.personalAchievements"
          control={control}
          render={({ field }) => (
            <PrivacySelector
              value={field.value || PrivacyLevel.PUBLIC}
              onChange={field.onChange}
            />
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

      {/* Profile Picture Privacy */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="body1">{t`Profile Picture Privacy`}</Typography>
        <Controller
          name="privacySettings.avatar"
          control={control}
          render={({ field }) => (
            <PrivacySelector
              value={field.value || PrivacyLevel.PUBLIC}
              onChange={field.onChange}
            />
          )}
        />
      </Box>

      {/* Banner Privacy */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="body1">{t`Banner Privacy`}</Typography>
        <Controller
          name="privacySettings.banner"
          control={control}
          render={({ field }) => (
            <PrivacySelector
              value={field.value || PrivacyLevel.PUBLIC}
              onChange={field.onChange}
            />
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
