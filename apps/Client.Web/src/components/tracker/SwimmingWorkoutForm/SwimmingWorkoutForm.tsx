import { FC, useState } from 'react';
import {
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';

import {
  SwimType,
  IntensityLevel,
  SwimmingWorkoutDetails,
} from '../../../types/tracker';
import { SwimmingWorkoutFormProps } from './SwimmingWorkoutForm.model';

/**
 * Get human-readable label for swim type
 */
const getSwimTypeLabel = (type: SwimType): string => {
  switch (type) {
    case SwimType.FREESTYLE:
      return t`Freestyle`;
    case SwimType.BACKSTROKE:
      return t`Backstroke`;
    case SwimType.BREASTSTROKE:
      return t`Breaststroke`;
    case SwimType.BUTTERFLY:
      return t`Butterfly`;
    case SwimType.INDIVIDUAL_MEDLEY:
      return t`Individual Medley`;
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
 * SwimmingWorkoutForm component for detailed swimming workout tracking
 */
export const SwimmingWorkoutForm: FC<SwimmingWorkoutFormProps> = ({
  value,
  onChange,
}) => {
  const [distanceGoal, setDistanceGoal] = useState<number>(
    value?.distanceGoal || 1000,
  );
  const [lapCount, setLapCount] = useState<number>(value?.lapCount || 20);
  const [timePerLap, setTimePerLap] = useState<number>(value?.timePerLap || 60);
  const [swimType, setSwimType] = useState<SwimType>(
    value?.swimType || SwimType.FREESTYLE,
  );
  const [intensity, setIntensity] = useState<IntensityLevel>(
    value?.intensity || IntensityLevel.MODERATE,
  );
  const [heartRate, setHeartRate] = useState<number | undefined>(
    value?.heartRate,
  );
  const [notes, setNotes] = useState<string>(value?.notes || '');

  // Update parent when any field changes
  const updateDetails = (
    updates: Readonly<Partial<SwimmingWorkoutDetails>>,
  ) => {
    const newDetails: SwimmingWorkoutDetails = {
      distanceGoal: updates.distanceGoal ?? distanceGoal,
      lapCount: updates.lapCount ?? lapCount,
      timePerLap: updates.timePerLap ?? timePerLap,
      swimType: updates.swimType ?? swimType,
      intensity: updates.intensity ?? intensity,
      heartRate: updates.heartRate ?? heartRate,
      notes: updates.notes ?? notes,
    };
    onChange(newDetails);
  };

  // Handle distance goal change
  const handleDistanceGoalChange = (newDistanceGoal: number) => {
    setDistanceGoal(newDistanceGoal);
    updateDetails({ distanceGoal: newDistanceGoal });
  };

  // Handle lap count change
  const handleLapCountChange = (newLapCount: number) => {
    setLapCount(newLapCount);
    updateDetails({ lapCount: newLapCount });
  };

  // Handle time per lap change
  const handleTimePerLapChange = (newTimePerLap: number) => {
    setTimePerLap(newTimePerLap);
    updateDetails({ timePerLap: newTimePerLap });
  };

  // Handle swim type change
  const handleSwimTypeChange = (newSwimType: SwimType) => {
    setSwimType(newSwimType);
    updateDetails({ swimType: newSwimType });
  };

  // Handle intensity change
  const handleIntensityChange = (newIntensity: IntensityLevel) => {
    setIntensity(newIntensity);
    updateDetails({ intensity: newIntensity });
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
      {/* Distance Goal */}
      <TextField
        label={t`Distance Goal (meters)`}
        type="number"
        value={distanceGoal}
        onChange={e => handleDistanceGoalChange(Number(e.target.value))}
        inputProps={{ min: 0, step: 50 }}
        fullWidth
        placeholder={t`e.g., 1000`}
      />

      {/* Lap Count */}
      <TextField
        label={t`Lap Count`}
        type="number"
        value={lapCount}
        onChange={e => handleLapCountChange(Number(e.target.value))}
        inputProps={{ min: 1, step: 1 }}
        fullWidth
        placeholder={t`e.g., 20`}
      />

      {/* Time per Lap */}
      <TextField
        label={t`Time per Lap (seconds)`}
        type="number"
        value={timePerLap}
        onChange={e => handleTimePerLapChange(Number(e.target.value))}
        inputProps={{ min: 1, step: 1 }}
        fullWidth
        placeholder={t`e.g., 60`}
      />

      {/* Swim Type */}
      <FormControl fullWidth>
        <InputLabel id="swim-type-label">
          <Trans>Type of Swim</Trans>
        </InputLabel>
        <Select
          labelId="swim-type-label"
          value={swimType}
          label={t`Type of Swim`}
          onChange={e => handleSwimTypeChange(e.target.value as SwimType)}
        >
          {Object.values(SwimType).map(type => (
            <MenuItem key={type} value={type}>
              {getSwimTypeLabel(type)}
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

      {/* Heart Rate */}
      <TextField
        label={t`Heart Rate (optional, bpm)`}
        type="number"
        value={heartRate || ''}
        onChange={e =>
          handleHeartRateChange(
            e.target.value ? Number(e.target.value) : undefined,
          )
        }
        inputProps={{ min: 30, max: 220, step: 1 }}
        fullWidth
        placeholder={t`e.g., 140`}
      />

      {/* Notes */}
      <TextField
        label={t`Notes`}
        value={notes}
        onChange={e => handleNotesChange(e.target.value)}
        multiline
        rows={3}
        fullWidth
        placeholder={t`Additional notes about your swimming session...`}
      />
    </Stack>
  );
};
