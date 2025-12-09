import { FC, useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';

import { WorkoutType } from '../../../types/tracker';
import { getWorkoutTypeOptions } from '../../../helpers/workoutTypeLabels/workoutTypeLabels';
import { AddWorkoutDialogProps } from './AddWorkoutDialog.model';

/**
 * AddWorkoutDialog component for adding or editing workouts
 * Allows users to specify start time, end time, and workout type
 */
export const AddWorkoutDialog: FC<AddWorkoutDialogProps> = ({
  open,
  onClose,
  onSubmit,
  selectedDate,
  editingWorkout,
}) => {
  const [startHour, setStartHour] = useState<number>(6);
  const [startMinute, setStartMinute] = useState<number>(0);
  const [endHour, setEndHour] = useState<number>(7);
  const [endMinute, setEndMinute] = useState<number>(0);
  const [workoutType, setWorkoutType] = useState<WorkoutType>(WorkoutType.RUN);

  // Populate form when editing
  useEffect(() => {
    if (editingWorkout && open) {
      setStartHour(editingWorkout.startHour);
      setStartMinute(editingWorkout.startMinute);
      setEndHour(editingWorkout.endHour);
      setEndMinute(editingWorkout.endMinute);
      setWorkoutType(editingWorkout.type);
    } else if (!editingWorkout && open) {
      // Reset to defaults when adding new
      setStartHour(6);
      setStartMinute(0);
      setEndHour(7);
      setEndMinute(0);
      setWorkoutType(WorkoutType.RUN);
    }
  }, [editingWorkout, open]);

  const handleSubmit = () => {
    onSubmit({
      startHour,
      startMinute,
      endHour,
      endMinute,
      type: workoutType,
    });
    onClose();
  };

  const workoutTypeOptions = getWorkoutTypeOptions();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="add-workout-dialog-title"
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme => theme.palette.grey[500],
          '&:hover': {
            backgroundColor: theme => theme.palette.action.hover,
          },
        }}
        aria-label={t`Close dialog`}
      >
        <CloseIcon />
      </IconButton>

      <DialogTitle id="add-workout-dialog-title">
        {editingWorkout ? (
          <Trans>Edit Workout</Trans>
        ) : (
          <Trans>Add Workout</Trans>
        )}
        {selectedDate && ` - ${selectedDate.toLocaleDateString()}`}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Workout Type */}
          <FormControl fullWidth>
            <InputLabel id="workout-type-label">
              <Trans>Workout Type</Trans>
            </InputLabel>
            <Select
              labelId="workout-type-label"
              id="workout-type"
              value={workoutType}
              label={t`Workout Type`}
              onChange={e => setWorkoutType(e.target.value as WorkoutType)}
            >
              {workoutTypeOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Start Time */}
          <Stack direction="row" spacing={2}>
            <TextField
              label={t`Start Hour`}
              type="number"
              value={startHour}
              onChange={e => setStartHour(Number(e.target.value))}
              inputProps={{ min: 0, max: 23, 'aria-label': t`Start hour` }}
              fullWidth
            />
            <TextField
              label={t`Start Minute`}
              type="number"
              value={startMinute}
              onChange={e => setStartMinute(Number(e.target.value))}
              inputProps={{ min: 0, max: 59, 'aria-label': t`Start minute` }}
              fullWidth
            />
          </Stack>

          {/* End Time */}
          <Stack direction="row" spacing={2}>
            <TextField
              label={t`End Hour`}
              type="number"
              value={endHour}
              onChange={e => setEndHour(Number(e.target.value))}
              inputProps={{ min: 0, max: 23, 'aria-label': t`End hour` }}
              fullWidth
            />
            <TextField
              label={t`End Minute`}
              type="number"
              value={endMinute}
              onChange={e => setEndMinute(Number(e.target.value))}
              inputProps={{ min: 0, max: 59, 'aria-label': t`End minute` }}
              fullWidth
            />
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'flex-start', margin: 2 }}>
        <Stack direction="row" spacing={2}>
          <Button
            onClick={onClose}
            startIcon={<CloseIcon />}
            sx={{
              '&:hover': {
                backgroundColor: theme => theme.palette.error.dark,
              },
            }}
          >
            <Trans>Cancel</Trans>
          </Button>
          <Button
            onClick={handleSubmit}
            startIcon={<CheckIcon />}
            sx={{
              '& .MuiSvgIcon-root': {
                color: theme => theme.palette.accent.main,
              },
              '&:hover .MuiSvgIcon-root': {
                color: theme => theme.palette.text.primary,
              },
              '&:hover': {
                backgroundColor: theme => theme.palette.success.dark,
              },
            }}
          >
            {editingWorkout ? (
              <Trans>Update Workout</Trans>
            ) : (
              <Trans>Add Workout</Trans>
            )}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
