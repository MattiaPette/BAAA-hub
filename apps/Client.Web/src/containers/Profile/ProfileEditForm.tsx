import { FC } from 'react';
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
} from '@mui/material';
import { SportType } from '@baaa-hub/shared-types';
import {
  getSportTypeLabel,
  getSportTypeLabels,
} from '../../helpers/sportTypes';
import { ProfileEditFormInput, ProfileEditProps } from './Profile.model';

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
              (value && value.length > 0) || t`Select at least one sport type`,
          }}
          render={({ field }) => {
            const sportTypeLabels = getSportTypeLabels();
            return (
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
            );
          }}
        />
        <FormHelperText>{errors.sportTypes?.message}</FormHelperText>
      </FormControl>

      {/* Social Links */}
      <FormControl fullWidth>
        <TextField
          id="stravaLink"
          label={t`Strava Profile`}
          placeholder="https://www.strava.com/athletes/12345"
          fullWidth
          variant="outlined"
          error={!!errors.stravaLink}
          helperText={errors.stravaLink?.message}
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
          {...register('instagramLink', {
            pattern: {
              value: /^(https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?)?$/,
              message: t`Invalid Instagram profile URL`,
            },
          })}
        />
      </FormControl>

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
