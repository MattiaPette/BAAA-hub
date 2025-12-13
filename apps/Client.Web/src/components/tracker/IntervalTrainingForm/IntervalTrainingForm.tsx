import { FC, useState } from 'react';
import {
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';

import {
  IntensityLevel,
  IntervalSegment,
  IntervalWorkoutDetails,
} from '../../../types/tracker';
import { IntervalTrainingFormProps } from './IntervalTrainingForm.model';

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
 * IntervalTrainingForm component for detailed interval training tracking
 */
export const IntervalTrainingForm: FC<IntervalTrainingFormProps> = ({
  value,
  onChange,
}) => {
  const [intervals, setIntervals] = useState<IntervalSegment[]>(
    value?.intervals || [],
  );
  const [rounds, setRounds] = useState<number>(value?.rounds || 1);
  const [intensity, setIntensity] = useState<IntensityLevel>(
    value?.intensity || IntensityLevel.MODERATE,
  );
  const [notes, setNotes] = useState<string>(value?.notes || '');

  // Update parent when any field changes
  const updateDetails = (
    updates: Readonly<Partial<IntervalWorkoutDetails>>,
  ) => {
    const newDetails: IntervalWorkoutDetails = {
      intervals: updates.intervals ?? intervals,
      rounds: updates.rounds ?? rounds,
      intensity: updates.intensity ?? intensity,
      notes: updates.notes ?? notes,
    };
    onChange(newDetails);
  };

  // Add new interval
  const handleAddInterval = (type: 'work' | 'rest') => {
    const newInterval: IntervalSegment = {
      id: `interval-${Date.now()}`,
      type,
      durationMinutes: type === 'work' ? 5 : 1,
      durationSeconds: 0,
      distance: undefined,
      targetPace: undefined,
    };
    const newIntervals = [...intervals, newInterval];
    setIntervals(newIntervals);
    updateDetails({ intervals: newIntervals });
  };

  // Remove interval
  const handleRemoveInterval = (intervalId: string) => {
    const newIntervals = intervals.filter(i => i.id !== intervalId);
    setIntervals(newIntervals);
    updateDetails({ intervals: newIntervals });
  };

  // Update interval field
  const handleUpdateInterval = (
    intervalId: string,
    field: keyof IntervalSegment,
    value: number | string | undefined,
  ) => {
    const newIntervals = intervals.map(interval =>
      interval.id === intervalId ? { ...interval, [field]: value } : interval,
    );
    setIntervals(newIntervals);
    updateDetails({ intervals: newIntervals });
  };

  // Handle rounds change
  const handleRoundsChange = (newRounds: number) => {
    setRounds(newRounds);
    updateDetails({ rounds: newRounds });
  };

  // Handle intensity change
  const handleIntensityChange = (newIntensity: IntensityLevel) => {
    setIntensity(newIntensity);
    updateDetails({ intensity: newIntensity });
  };

  // Handle notes change
  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    updateDetails({ notes: newNotes });
  };

  return (
    <Stack spacing={3}>
      {/* Rounds */}
      <TextField
        label={t`Number of Rounds`}
        type="number"
        value={rounds}
        onChange={e => handleRoundsChange(Number(e.target.value))}
        inputProps={{ min: 1, 'aria-label': t`Number of rounds` }}
        fullWidth
        helperText={t`How many times to repeat the interval sequence`}
      />

      {/* Intervals Section */}
      <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6">
            <Trans>Interval Structure</Trans>
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<AddIcon />}
              onClick={() => handleAddInterval('work')}
              variant="outlined"
              size="small"
            >
              <Trans>Add Work Interval</Trans>
            </Button>
            <Button
              startIcon={<AddIcon />}
              onClick={() => handleAddInterval('rest')}
              variant="outlined"
              size="small"
              color="secondary"
            >
              <Trans>Add Rest Interval</Trans>
            </Button>
          </Stack>
        </Box>

        {intervals.length > 0 && (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Trans>Type</Trans>
                  </TableCell>
                  <TableCell>
                    <Trans>Duration (min)</Trans>
                  </TableCell>
                  <TableCell>
                    <Trans>Duration (sec)</Trans>
                  </TableCell>
                  <TableCell>
                    <Trans>Distance (km)</Trans>
                  </TableCell>
                  <TableCell>
                    <Trans>Target Pace</Trans>
                  </TableCell>
                  <TableCell align="right">
                    <Trans>Actions</Trans>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {intervals.map(interval => (
                  <TableRow
                    key={interval.id}
                    sx={{
                      backgroundColor:
                        interval.type === 'work'
                          ? theme => theme.palette.action.hover
                          : theme => theme.palette.grey[50],
                    }}
                  >
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={
                          interval.type === 'work'
                            ? 'primary'
                            : 'text.secondary'
                        }
                      >
                        {interval.type === 'work' ? (
                          <Trans>Work</Trans>
                        ) : (
                          <Trans>Rest</Trans>
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={interval.durationMinutes}
                        onChange={e =>
                          handleUpdateInterval(
                            interval.id,
                            'durationMinutes',
                            Number(e.target.value),
                          )
                        }
                        size="small"
                        inputProps={{
                          min: 0,
                          'aria-label': t`Duration minutes`,
                        }}
                        sx={{ width: '80px' }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={interval.durationSeconds}
                        onChange={e =>
                          handleUpdateInterval(
                            interval.id,
                            'durationSeconds',
                            Number(e.target.value),
                          )
                        }
                        size="small"
                        inputProps={{
                          min: 0,
                          max: 59,
                          'aria-label': t`Duration seconds`,
                        }}
                        sx={{ width: '80px' }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={interval.distance || ''}
                        onChange={e =>
                          handleUpdateInterval(
                            interval.id,
                            'distance',
                            e.target.value ? Number(e.target.value) : undefined,
                          )
                        }
                        size="small"
                        inputProps={{
                          min: 0,
                          step: 0.1,
                          'aria-label': t`Distance in kilometers`,
                        }}
                        placeholder={t`Optional`}
                        sx={{ width: '100px' }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="text"
                        value={interval.targetPace || ''}
                        onChange={e =>
                          handleUpdateInterval(
                            interval.id,
                            'targetPace',
                            e.target.value || undefined,
                          )
                        }
                        size="small"
                        placeholder={t`MM:SS`}
                        inputProps={{
                          'aria-label': t`Target pace per kilometer`,
                        }}
                        sx={{ width: '100px' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleRemoveInterval(interval.id)}
                        size="small"
                        color="error"
                        aria-label={t`Remove interval`}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {intervals.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <Trans>
              No intervals added yet. Click &ldquo;Add Work Interval&rdquo; or
              &ldquo;Add Rest Interval&rdquo; to start.
            </Trans>
          </Typography>
        )}
      </Box>

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

      {/* Notes */}
      <TextField
        label={t`Notes`}
        value={notes}
        onChange={e => handleNotesChange(e.target.value)}
        multiline
        rows={3}
        fullWidth
        placeholder={t`Additional notes about your interval training...`}
      />
    </Stack>
  );
};
