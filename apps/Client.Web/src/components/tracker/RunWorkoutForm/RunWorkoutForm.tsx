import { FC, useState } from 'react';
import {
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
} from '@mui/material';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';

import { HeartRateZone, RunWorkoutDetails } from '../../../types/tracker';
import { RunWorkoutFormProps } from './RunWorkoutForm.model';

/**
 * Get human-readable label for heart rate zone
 */
const getHeartRateZoneLabel = (zone: HeartRateZone): string => {
  switch (zone) {
    case HeartRateZone.Z1:
      return t`Zone 1 - Recovery`;
    case HeartRateZone.Z2:
      return t`Zone 2 - Endurance`;
    case HeartRateZone.Z3:
      return t`Zone 3 - Tempo`;
    case HeartRateZone.Z4:
      return t`Zone 4 - Threshold`;
    case HeartRateZone.Z5:
      return t`Zone 5 - VO2 Max`;
    case HeartRateZone.Z6:
      return t`Zone 6 - Anaerobic`;
    case HeartRateZone.Z7:
      return t`Zone 7 - Maximum`;
    case HeartRateZone.CUSTOM:
      return t`Custom Range`;
    default:
      return t`Unknown`;
  }
};

/**
 * RunWorkoutForm component for detailed run workout tracking
 */
export const RunWorkoutForm: FC<RunWorkoutFormProps> = ({
  value,
  onChange,
}) => {
  const [distanceGoal, setDistanceGoal] = useState<number | undefined>(
    value?.distanceGoal,
  );
  const [paceGoal, setPaceGoal] = useState<number | undefined>(value?.paceGoal);
  const [heartRateZone, setHeartRateZone] = useState<HeartRateZone | undefined>(
    value?.heartRateZone,
  );
  const [customHeartRateMin, setCustomHeartRateMin] = useState<
    number | undefined
  >(value?.customHeartRateMin);
  const [customHeartRateMax, setCustomHeartRateMax] = useState<
    number | undefined
  >(value?.customHeartRateMax);
  const [notes, setNotes] = useState<string>(value?.notes || '');

  // Update parent when any field changes
  const updateDetails = (updates: Readonly<Partial<RunWorkoutDetails>>) => {
    const newDetails: RunWorkoutDetails = {
      distanceGoal:
        'distanceGoal' in updates ? updates.distanceGoal : distanceGoal,
      paceGoal: 'paceGoal' in updates ? updates.paceGoal : paceGoal,
      heartRateZone:
        'heartRateZone' in updates ? updates.heartRateZone : heartRateZone,
      customHeartRateMin:
        'customHeartRateMin' in updates
          ? updates.customHeartRateMin
          : customHeartRateMin,
      customHeartRateMax:
        'customHeartRateMax' in updates
          ? updates.customHeartRateMax
          : customHeartRateMax,
      notes: 'notes' in updates ? updates.notes : notes,
    };
    onChange(newDetails);
  };

  // Handle distance goal change
  const handleDistanceGoalChange = (newDistance: number | undefined) => {
    setDistanceGoal(newDistance);
    updateDetails({ distanceGoal: newDistance });
  };

  // Handle pace goal change
  const handlePaceGoalChange = (newPace: number | undefined) => {
    setPaceGoal(newPace);
    updateDetails({ paceGoal: newPace });
  };

  // Handle heart rate zone change
  const handleHeartRateZoneChange = (newZone: HeartRateZone | undefined) => {
    setHeartRateZone(newZone);
    // Clear custom values if not using custom zone
    if (newZone !== HeartRateZone.CUSTOM) {
      setCustomHeartRateMin(undefined);
      setCustomHeartRateMax(undefined);
      updateDetails({
        heartRateZone: newZone,
        customHeartRateMin: undefined,
        customHeartRateMax: undefined,
      });
    } else {
      updateDetails({ heartRateZone: newZone });
    }
  };

  // Handle custom heart rate min change
  const handleCustomHeartRateMinChange = (newMin: number | undefined) => {
    setCustomHeartRateMin(newMin);
    updateDetails({ customHeartRateMin: newMin });
  };

  // Handle custom heart rate max change
  const handleCustomHeartRateMaxChange = (newMax: number | undefined) => {
    setCustomHeartRateMax(newMax);
    updateDetails({ customHeartRateMax: newMax });
  };

  // Handle notes change
  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    updateDetails({ notes: newNotes });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h6">
        <Trans>Run Details</Trans>
      </Typography>

      {/* Distance Goal */}
      <TextField
        label={t`Distance Goal (km)`}
        type="number"
        value={distanceGoal ?? ''}
        onChange={e =>
          handleDistanceGoalChange(
            e.target.value ? Number(e.target.value) : undefined,
          )
        }
        inputProps={{ min: 0, step: 0.1 }}
        fullWidth
        placeholder={t`e.g., 5, 10, 21.1`}
      />

      {/* Pace Goal */}
      <TextField
        label={t`Pace Goal (min/km)`}
        type="number"
        value={paceGoal ?? ''}
        onChange={e =>
          handlePaceGoalChange(
            e.target.value ? Number(e.target.value) : undefined,
          )
        }
        inputProps={{ min: 0, step: 0.1 }}
        fullWidth
        placeholder={t`e.g., 5.5, 6.0`}
        helperText={t`Minutes per kilometer`}
      />

      {/* Heart Rate Zone */}
      <FormControl fullWidth>
        <InputLabel id="heart-rate-zone-label">
          <Trans>Heart Rate Zone</Trans>
        </InputLabel>
        <Select
          labelId="heart-rate-zone-label"
          value={heartRateZone || ''}
          label={t`Heart Rate Zone`}
          onChange={e =>
            handleHeartRateZoneChange(
              e.target.value ? (e.target.value as HeartRateZone) : undefined,
            )
          }
        >
          <MenuItem value="">
            <em>
              <Trans>None</Trans>
            </em>
          </MenuItem>
          {Object.values(HeartRateZone).map(zone => (
            <MenuItem key={zone} value={zone}>
              {getHeartRateZoneLabel(zone)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Custom Heart Rate Range - Only shown when CUSTOM is selected */}
      {heartRateZone === HeartRateZone.CUSTOM && (
        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <Trans>Custom Heart Rate Range (BPM)</Trans>
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              label={t`Min BPM`}
              type="number"
              value={customHeartRateMin ?? ''}
              onChange={e =>
                handleCustomHeartRateMinChange(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              inputProps={{ min: 0, max: 220 }}
              fullWidth
            />
            <TextField
              label={t`Max BPM`}
              type="number"
              value={customHeartRateMax ?? ''}
              onChange={e =>
                handleCustomHeartRateMaxChange(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              inputProps={{ min: 0, max: 220 }}
              fullWidth
            />
          </Stack>
        </Box>
      )}

      {/* Notes */}
      <TextField
        label={t`Notes`}
        value={notes}
        onChange={e => handleNotesChange(e.target.value)}
        multiline
        rows={3}
        fullWidth
        placeholder={t`Additional notes about your run...`}
      />
    </Stack>
  );
};
