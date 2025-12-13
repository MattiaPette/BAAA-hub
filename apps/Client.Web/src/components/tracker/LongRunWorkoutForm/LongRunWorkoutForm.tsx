import { FC, useState } from 'react';
import { Stack, TextField } from '@mui/material';
import { t } from '@lingui/core/macro';

import { LongRunWorkoutDetails } from '../../../types/tracker';
import { LongRunWorkoutFormProps } from './LongRunWorkoutForm.model';

/**
 * LongRunWorkoutForm component for detailed long run workout tracking
 */
export const LongRunWorkoutForm: FC<LongRunWorkoutFormProps> = ({
  value,
  onChange,
}) => {
  const [distanceGoal, setDistanceGoal] = useState<number>(
    value?.distanceGoal || 0,
  );
  const [paceGoal, setPaceGoal] = useState<number | undefined>(value?.paceGoal);
  const [hydrationNotes, setHydrationNotes] = useState<string>(
    value?.hydrationNotes || '',
  );
  const [averageHeartRate, setAverageHeartRate] = useState<number | undefined>(
    value?.averageHeartRate,
  );
  const [peakHeartRate, setPeakHeartRate] = useState<number | undefined>(
    value?.peakHeartRate,
  );
  const [notes, setNotes] = useState<string>(value?.notes || '');

  // Update parent when any field changes
  const updateDetails = (updates: Readonly<Partial<LongRunWorkoutDetails>>) => {
    const newDetails: LongRunWorkoutDetails = {
      distanceGoal: updates.distanceGoal ?? distanceGoal,
      paceGoal: updates.paceGoal ?? paceGoal,
      hydrationNotes: updates.hydrationNotes ?? hydrationNotes,
      averageHeartRate: updates.averageHeartRate ?? averageHeartRate,
      peakHeartRate: updates.peakHeartRate ?? peakHeartRate,
      notes: updates.notes ?? notes,
    };
    onChange(newDetails);
  };

  // Handle distance goal change
  const handleDistanceGoalChange = (newDistance: number) => {
    setDistanceGoal(newDistance);
    updateDetails({ distanceGoal: newDistance });
  };

  // Handle pace goal change
  const handlePaceGoalChange = (newPace: number | undefined) => {
    setPaceGoal(newPace);
    updateDetails({ paceGoal: newPace });
  };

  // Handle hydration notes change
  const handleHydrationNotesChange = (newNotes: string) => {
    setHydrationNotes(newNotes);
    updateDetails({ hydrationNotes: newNotes });
  };

  // Handle average heart rate change
  const handleAverageHeartRateChange = (newRate: number | undefined) => {
    setAverageHeartRate(newRate);
    updateDetails({ averageHeartRate: newRate });
  };

  // Handle peak heart rate change
  const handlePeakHeartRateChange = (newRate: number | undefined) => {
    setPeakHeartRate(newRate);
    updateDetails({ peakHeartRate: newRate });
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
        label={t`Distance Goal (km)`}
        type="number"
        value={distanceGoal}
        onChange={e => handleDistanceGoalChange(Number(e.target.value))}
        inputProps={{ min: 0, step: 0.1 }}
        fullWidth
        required
        placeholder={t`e.g., 21.1 for half-marathon`}
      />

      {/* Pace/Tempo Goal */}
      <TextField
        label={t`Pace/Tempo Goal (min/km)`}
        type="number"
        value={paceGoal || ''}
        onChange={e =>
          handlePaceGoalChange(
            e.target.value ? Number(e.target.value) : undefined,
          )
        }
        inputProps={{ min: 0, step: 0.1 }}
        fullWidth
        placeholder={t`e.g., 5.5 for 5:30 min/km`}
      />

      {/* Hydration/Refueling Notes */}
      <TextField
        label={t`Hydration/Refueling Notes`}
        value={hydrationNotes}
        onChange={e => handleHydrationNotesChange(e.target.value)}
        multiline
        rows={3}
        fullWidth
        placeholder={t`e.g., Water every 5km, energy gel at 15km...`}
      />

      {/* Average Heart Rate */}
      <TextField
        label={t`Average Heart Rate (bpm)`}
        type="number"
        value={averageHeartRate || ''}
        onChange={e =>
          handleAverageHeartRateChange(
            e.target.value ? Number(e.target.value) : undefined,
          )
        }
        inputProps={{ min: 0, max: 250 }}
        fullWidth
        placeholder={t`e.g., 150`}
      />

      {/* Peak Heart Rate */}
      <TextField
        label={t`Peak Heart Rate (bpm)`}
        type="number"
        value={peakHeartRate || ''}
        onChange={e =>
          handlePeakHeartRateChange(
            e.target.value ? Number(e.target.value) : undefined,
          )
        }
        inputProps={{ min: 0, max: 250 }}
        fullWidth
        placeholder={t`e.g., 180`}
      />

      {/* Notes */}
      <TextField
        label={t`Notes`}
        value={notes}
        onChange={e => handleNotesChange(e.target.value)}
        multiline
        rows={3}
        fullWidth
        placeholder={t`Additional notes about your long run...`}
      />
    </Stack>
  );
};
