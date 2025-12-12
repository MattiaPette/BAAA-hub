import { FC, useState } from 'react';
import {
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  Box,
} from '@mui/material';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';

import {
  RecoveryActivityType,
  IntensityLevel,
  RecoveryFocusArea,
  RecoveryWorkoutDetails,
} from '../../../types/tracker';
import { RecoveryWorkoutFormProps } from './RecoveryWorkoutForm.model';

/**
 * Get human-readable label for recovery activity type
 */
const getRecoveryActivityTypeLabel = (type: RecoveryActivityType): string => {
  switch (type) {
    case RecoveryActivityType.STRETCHING:
      return t`Stretching`;
    case RecoveryActivityType.FOAM_ROLLING:
      return t`Foam Rolling`;
    case RecoveryActivityType.YOGA:
      return t`Yoga`;
    case RecoveryActivityType.MASSAGE:
      return t`Massage`;
    case RecoveryActivityType.ACTIVE_RECOVERY:
      return t`Active Recovery`;
    case RecoveryActivityType.ICE_BATH:
      return t`Ice Bath`;
    case RecoveryActivityType.SAUNA:
      return t`Sauna`;
    case RecoveryActivityType.OTHER:
      return t`Other`;
    default:
      return t`Unknown`;
  }
};

/**
 * Get human-readable label for recovery focus area
 */
const getRecoveryFocusAreaLabel = (area: RecoveryFocusArea): string => {
  switch (area) {
    case RecoveryFocusArea.FULL_BODY:
      return t`Full Body`;
    case RecoveryFocusArea.UPPER_BODY:
      return t`Upper Body`;
    case RecoveryFocusArea.LOWER_BODY:
      return t`Lower Body`;
    case RecoveryFocusArea.BACK:
      return t`Back`;
    case RecoveryFocusArea.LEGS:
      return t`Legs`;
    case RecoveryFocusArea.SHOULDERS:
      return t`Shoulders`;
    case RecoveryFocusArea.CORE:
      return t`Core`;
    default:
      return t`Unknown`;
  }
};

/**
 * Get human-readable label for intensity level
 */
const getIntensityLevelLabel = (level: IntensityLevel): string => {
  switch (level) {
    case IntensityLevel.LOW:
      return t`Low`;
    case IntensityLevel.MODERATE:
      return t`Moderate`;
    case IntensityLevel.HIGH:
      return t`High`;
    case IntensityLevel.VERY_HIGH:
      return t`Very High`;
    default:
      return t`Unknown`;
  }
};

/**
 * RecoveryWorkoutForm component for detailed recovery session tracking
 */
export const RecoveryWorkoutForm: FC<RecoveryWorkoutFormProps> = ({
  value,
  onChange,
}) => {
  const [activityType, setActivityType] = useState<RecoveryActivityType>(
    value?.activityType || RecoveryActivityType.STRETCHING,
  );
  const [intensity, setIntensity] = useState<IntensityLevel>(
    value?.intensity || IntensityLevel.LOW,
  );
  const [focusAreas, setFocusAreas] = useState<RecoveryFocusArea[]>(
    value?.focusAreas || [],
  );
  const [heartRate, setHeartRate] = useState<number | undefined>(
    value?.heartRate,
  );
  const [notes, setNotes] = useState<string>(value?.notes || '');

  // Update parent when any field changes
  const updateDetails = (
    updates: Readonly<Partial<RecoveryWorkoutDetails>>,
  ) => {
    const newDetails: RecoveryWorkoutDetails = {
      activityType:
        'activityType' in updates ? updates.activityType! : activityType,
      intensity: 'intensity' in updates ? updates.intensity! : intensity,
      focusAreas: 'focusAreas' in updates ? updates.focusAreas! : focusAreas,
      heartRate: 'heartRate' in updates ? updates.heartRate : heartRate,
      notes: 'notes' in updates ? updates.notes! : notes,
    };
    onChange(newDetails);
  };

  // Handle activity type change
  const handleActivityTypeChange = (newActivityType: RecoveryActivityType) => {
    setActivityType(newActivityType);
    updateDetails({ activityType: newActivityType });
  };

  // Handle intensity change
  const handleIntensityChange = (newIntensity: IntensityLevel) => {
    setIntensity(newIntensity);
    updateDetails({ intensity: newIntensity });
  };

  // Handle focus areas change
  const handleFocusAreasChange = (
    event: SelectChangeEvent<typeof focusAreas>,
  ) => {
    const { value } = event.target;
    const newFocusAreas =
      typeof value === 'string'
        ? (value.split(',') as RecoveryFocusArea[])
        : value;
    setFocusAreas(newFocusAreas);
    updateDetails({ focusAreas: newFocusAreas });
  };

  // Handle heart rate change
  const handleHeartRateChange = (newHeartRate: number | undefined) => {
    setHeartRate(newHeartRate);
    updateDetails({ heartRate: newHeartRate });
  };

  // Handle notes change
  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    updateDetails({ notes: newNotes });
  };

  return (
    <Stack spacing={3}>
      {/* Activity Type */}
      <FormControl fullWidth>
        <InputLabel id="activity-type-label">
          <Trans>Recovery Activity Type</Trans>
        </InputLabel>
        <Select
          labelId="activity-type-label"
          value={activityType}
          label={t`Recovery Activity Type`}
          onChange={e =>
            handleActivityTypeChange(e.target.value as RecoveryActivityType)
          }
        >
          {Object.values(RecoveryActivityType).map(type => (
            <MenuItem key={type} value={type}>
              {getRecoveryActivityTypeLabel(type)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Intensity Level */}
      <FormControl fullWidth>
        <InputLabel id="intensity-label">
          <Trans>Intensity Level</Trans>
        </InputLabel>
        <Select
          labelId="intensity-label"
          value={intensity}
          label={t`Intensity Level`}
          onChange={e =>
            handleIntensityChange(e.target.value as IntensityLevel)
          }
        >
          {Object.values(IntensityLevel).map(level => (
            <MenuItem key={level} value={level}>
              {getIntensityLevelLabel(level)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Focus Areas */}
      <FormControl fullWidth>
        <InputLabel id="focus-areas-label">
          <Trans>Focus Areas</Trans>
        </InputLabel>
        <Select
          labelId="focus-areas-label"
          multiple
          value={focusAreas}
          onChange={handleFocusAreasChange}
          input={<OutlinedInput label={t`Focus Areas`} />}
          renderValue={selected => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map(value => (
                <Chip
                  key={value}
                  label={getRecoveryFocusAreaLabel(value)}
                  size="small"
                />
              ))}
            </Box>
          )}
        >
          {Object.values(RecoveryFocusArea).map(area => (
            <MenuItem key={area} value={area}>
              {getRecoveryFocusAreaLabel(area)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Heart Rate (Optional) */}
      <TextField
        label={t`Heart Rate (bpm)`}
        type="number"
        value={heartRate || ''}
        onChange={e =>
          handleHeartRateChange(
            e.target.value ? Number(e.target.value) : undefined,
          )
        }
        inputProps={{ min: 30, max: 220 }}
        fullWidth
        placeholder={t`Optional`}
      />

      {/* Notes */}
      <TextField
        label={t`Notes`}
        value={notes}
        onChange={e => handleNotesChange(e.target.value)}
        multiline
        rows={3}
        fullWidth
        placeholder={t`Additional notes about your recovery session...`}
      />
    </Stack>
  );
};
