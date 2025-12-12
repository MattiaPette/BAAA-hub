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
  Alert,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { isSameDay } from 'date-fns';

import {
  WorkoutType,
  GymWorkoutDetails,
  CyclingWorkoutDetails,
  RecoveryWorkoutDetails,
  IntervalWorkoutDetails,
  RunWorkoutDetails,
} from '../../../types/tracker';
import { getWorkoutTypeOptions } from '../../../helpers/workoutTypeLabels/workoutTypeLabels';
import { AddWorkoutDialogProps } from './AddWorkoutDialog.model';
import { GymWorkoutForm } from '../GymWorkoutForm';
import { CyclingWorkoutForm } from '../CyclingWorkoutForm';
import { RecoveryWorkoutForm } from '../RecoveryWorkoutForm';
import { IntervalTrainingForm } from '../IntervalTrainingForm';
import { RunWorkoutForm } from '../RunWorkoutForm';

/**
 * AddWorkoutDialog component for adding or editing workouts
 * Allows users to specify start time, end time, and workout type
 * Validates that workouts don't overlap with existing workouts on the same day
 */
export const AddWorkoutDialog: FC<AddWorkoutDialogProps> = ({
  open,
  onClose,
  onSubmit,
  selectedDate,
  editingWorkout,
  existingWorkouts,
}) => {
  const [startHour, setStartHour] = useState<number>(6);
  const [startMinute, setStartMinute] = useState<number>(0);
  const [endHour, setEndHour] = useState<number>(7);
  const [endMinute, setEndMinute] = useState<number>(0);
  const [workoutType, setWorkoutType] = useState<WorkoutType>(WorkoutType.RUN);
  const [gymDetails, setGymDetails] = useState<GymWorkoutDetails | undefined>(
    undefined,
  );
  const [cyclingDetails, setCyclingDetails] = useState<
    CyclingWorkoutDetails | undefined
  >(undefined);

  const [recoveryDetails, setRecoveryDetails] = useState<
    RecoveryWorkoutDetails | undefined
  >(undefined);

  const [intervalDetails, setIntervalDetails] = useState<
    IntervalWorkoutDetails | undefined
  >(undefined);

  const [runDetails, setRunDetails] = useState<RunWorkoutDetails | undefined>(
    undefined,
  );

  const [validationError, setValidationError] = useState<string | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (editingWorkout && open) {
      setStartHour(editingWorkout.startHour);
      setStartMinute(editingWorkout.startMinute);
      setEndHour(editingWorkout.endHour);
      setEndMinute(editingWorkout.endMinute);
      setWorkoutType(editingWorkout.type);
      setGymDetails(editingWorkout.gymDetails);
      setCyclingDetails(editingWorkout.cyclingDetails);
      setRecoveryDetails(editingWorkout.recoveryDetails);
      setIntervalDetails(editingWorkout.intervalDetails);
      setRunDetails(editingWorkout.runDetails);
      setValidationError(null);
    } else if (!editingWorkout && open) {
      // Reset to defaults when adding new
      setStartHour(6);
      setStartMinute(0);
      setEndHour(7);
      setEndMinute(0);
      setWorkoutType(WorkoutType.RUN);
      setGymDetails(undefined);
      setCyclingDetails(undefined);
      setRecoveryDetails(undefined);
      setIntervalDetails(undefined);
      setRunDetails(undefined);
      setValidationError(null);
    }
  }, [editingWorkout, open]);

  /**
   * Checks if the new workout time overlaps with existing workouts
   * Returns true if there's an overlap, false otherwise
   */
  const checkTimeOverlap = (): boolean => {
    if (!selectedDate) return false;

    // Convert times to minutes for easier comparison
    const newStartMinutes = startHour * 60 + startMinute;
    const newEndMinutes = endHour * 60 + endMinute;

    // Get workouts for the selected day (excluding the one being edited)
    const dayWorkouts = existingWorkouts.filter(
      w =>
        isSameDay(w.date, selectedDate) &&
        (!editingWorkout || w.id !== editingWorkout.id),
    );

    // Check if any existing workout overlaps with the new time
    return dayWorkouts.some(workout => {
      const existingStartMinutes = workout.startHour * 60 + workout.startMinute;
      const existingEndMinutes = workout.endHour * 60 + workout.endMinute;

      // Check if times overlap:
      // New workout starts before existing ends AND new workout ends after existing starts
      return (
        newStartMinutes < existingEndMinutes &&
        newEndMinutes > existingStartMinutes
      );
    });
  };

  const handleSubmit = () => {
    // Clear previous errors
    setValidationError(null);

    // Validate end time is after start time
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (endMinutes <= startMinutes) {
      setValidationError(t`End time must be after start time`);
      return;
    }

    // Check for overlapping workouts
    if (checkTimeOverlap()) {
      setValidationError(
        t`This workout overlaps with an existing workout. The previous workout must finish before this one starts.`,
      );
      return;
    }

    // Validate gym details if workout type is GYM
    if (workoutType === WorkoutType.GYM) {
      if (!gymDetails || gymDetails.exercises.length === 0) {
        setValidationError(
          t`Please add at least one exercise for gym workouts`,
        );
        return;
      }

      // Validate each exercise has a name
      const hasEmptyName = gymDetails.exercises.some(
        exercise => !exercise.name.trim(),
      );
      if (hasEmptyName) {
        setValidationError(t`All exercises must have a name`);
        return;
      }
    }

    // Validate recovery details if workout type is RECOVERY
    if (workoutType === WorkoutType.RECOVERY) {
      if (!recoveryDetails) {
        setValidationError(t`Please provide recovery session details`);
      }
    }

    // Validate interval details if workout type is INTERVAL_TRAINING
    if (workoutType === WorkoutType.INTERVAL_TRAINING) {
      if (!intervalDetails || intervalDetails.intervals.length === 0) {
        setValidationError(
          t`Please add at least one interval for interval training`,
        );
        return;
      }

      // Validate rounds
      if (intervalDetails.rounds < 1) {
        setValidationError(t`Number of rounds must be at least 1`);
        return;
      }
    }

    onSubmit({
      startHour,
      startMinute,
      endHour,
      endMinute,
      type: workoutType,
      gymDetails: workoutType === WorkoutType.GYM ? gymDetails : undefined,
      cyclingDetails:
        workoutType === WorkoutType.CYCLING ? cyclingDetails : undefined,
      recoveryDetails:
        workoutType === WorkoutType.RECOVERY ? recoveryDetails : undefined,
      intervalDetails:
        workoutType === WorkoutType.INTERVAL_TRAINING
          ? intervalDetails
          : undefined,
      runDetails: workoutType === WorkoutType.RUN ? runDetails : undefined,
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
          {/* Validation Error */}
          {validationError && (
            <Alert severity="error" onClose={() => setValidationError(null)}>
              {validationError}
            </Alert>
          )}

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

          {/* Gym Workout Details - Only shown for GYM type */}
          {workoutType === WorkoutType.GYM && (
            <>
              <Divider sx={{ my: 2 }} />
              <GymWorkoutForm value={gymDetails} onChange={setGymDetails} />
            </>
          )}

          {/* Cycling Workout Details - Only shown for CYCLING type */}
          {workoutType === WorkoutType.CYCLING && (
            <>
              <Divider sx={{ my: 2 }} />
              <CyclingWorkoutForm
                value={cyclingDetails}
                onChange={setCyclingDetails}
              />
            </>
          )}

          {/* Recovery Workout Details - Only shown for RECOVERY type */}
          {workoutType === WorkoutType.RECOVERY && (
            <>
              <Divider sx={{ my: 2 }} />
              <RecoveryWorkoutForm
                value={recoveryDetails}
                onChange={setRecoveryDetails}
              />
            </>
          )}

          {/* Interval Training Details - Only shown for INTERVAL_TRAINING type */}
          {workoutType === WorkoutType.INTERVAL_TRAINING && (
            <>
              <Divider sx={{ my: 2 }} />
              <IntervalTrainingForm
                value={intervalDetails}
                onChange={setIntervalDetails}
              />
            </>
          )}

          {/* Run Workout Details - Only shown for RUN type */}
          {workoutType === WorkoutType.RUN && (
            <>
              <Divider sx={{ my: 2 }} />
              <RunWorkoutForm value={runDetails} onChange={setRunDetails} />
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'flex-start', margin: 2 }}>
        <Stack direction="row" spacing={2}>
          <Button
            onClick={onClose}
            startIcon={<CloseIcon />}
            color="error"
            variant="text"
            sx={{
              color: theme => theme.palette.error.main,
              '&:hover': {
                backgroundColor: theme => theme.palette.error.main,
                color: theme => theme.palette.error.contrastText,
              },
            }}
          >
            <Trans>Cancel</Trans>
          </Button>
          <Button
            onClick={handleSubmit}
            startIcon={<CheckIcon />}
            color="success"
            variant="contained"
            sx={{
              backgroundColor: theme => theme.palette.success.main,
              color: theme => theme.palette.success.contrastText,
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
