import { FC } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  IconButton,
  Box,
  Divider,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { format } from 'date-fns';
import { enUS, it } from 'date-fns/locale';
import { useLingui } from '@lingui/react';

import { getWorkoutTypeLabel } from '../../../helpers/workoutTypeLabels/workoutTypeLabels';
import {
  WorkoutType,
  SwimType,
  IntensityLevel,
  ExerciseType,
  MuscleGroup,
  RecoveryActivityType,
  RecoveryFocusArea,
  HeartRateZone,
} from '../../../types/tracker';
import { WorkoutDetailsDialogProps } from './WorkoutDetailsDialog.model';

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
 * Get human-readable label for exercise type
 */
const getExerciseTypeLabel = (type: ExerciseType): string => {
  switch (type) {
    case ExerciseType.BARBELL:
      return t`Barbell`;
    case ExerciseType.DUMBBELL:
      return t`Dumbbell`;
    case ExerciseType.MACHINE:
      return t`Machine`;
    case ExerciseType.BODYWEIGHT:
      return t`Bodyweight`;
    case ExerciseType.CABLE:
      return t`Cable`;
    case ExerciseType.KETTLEBELL:
      return t`Kettlebell`;
    case ExerciseType.OTHER:
      return t`Other`;
    default:
      return t`Unknown`;
  }
};

/**
 * Get human-readable label for muscle group
 */
const getMuscleGroupLabel = (group: MuscleGroup): string => {
  switch (group) {
    case MuscleGroup.CHEST:
      return t`Chest`;
    case MuscleGroup.BACK:
      return t`Back`;
    case MuscleGroup.SHOULDERS:
      return t`Shoulders`;
    case MuscleGroup.BICEPS:
      return t`Biceps`;
    case MuscleGroup.TRICEPS:
      return t`Triceps`;
    case MuscleGroup.LEGS:
      return t`Legs`;
    case MuscleGroup.CORE:
      return t`Core`;
    case MuscleGroup.GLUTES:
      return t`Glutes`;
    case MuscleGroup.CARDIO:
      return t`Cardio`;
    default:
      return t`Unknown`;
  }
};

/**
 * Get human-readable label for recovery activity type
 */
const getRecoveryActivityLabel = (type: RecoveryActivityType): string => {
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
 * Get human-readable label for heart rate zone
 */
const getHeartRateZoneLabel = (zone: HeartRateZone): string => {
  switch (zone) {
    case HeartRateZone.Z1:
      return t`Zone 1`;
    case HeartRateZone.Z2:
      return t`Zone 2`;
    case HeartRateZone.Z3:
      return t`Zone 3`;
    case HeartRateZone.Z4:
      return t`Zone 4`;
    case HeartRateZone.Z5:
      return t`Zone 5`;
    case HeartRateZone.Z6:
      return t`Zone 6`;
    case HeartRateZone.Z7:
      return t`Zone 7`;
    case HeartRateZone.CUSTOM:
      return t`Custom`;
    default:
      return t`Unknown`;
  }
};

/**
 * WorkoutDetailsDialog component for viewing and managing workout details
 * Allows users to view, edit, and delete workout events
 */
export const WorkoutDetailsDialog: FC<WorkoutDetailsDialogProps> = ({
  open,
  onClose,
  workout,
  onEdit,
  onDelete,
}) => {
  const { i18n } = useLingui();

  if (!workout) {
    return null;
  }

  const handleEdit = () => {
    onEdit(workout);
    onClose();
  };

  const handleDelete = () => {
    onDelete(workout.id);
    onClose();
  };

  const startTime = `${String(workout.startHour).padStart(2, '0')}:${String(workout.startMinute).padStart(2, '0')}`;
  const endTime = `${String(workout.endHour).padStart(2, '0')}:${String(workout.endMinute).padStart(2, '0')}`;

  // Map lingui locale to date-fns locale
  const dateFnsLocale = i18n.locale === 'it' ? it : enUS;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="workout-details-dialog-title"
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

      <DialogTitle id="workout-details-dialog-title">
        <Trans>Workout Details</Trans>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Date */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              <Trans>Date</Trans>
            </Typography>
            <Typography variant="body1">
              {format(workout.date, 'PPP', { locale: dateFnsLocale })}
            </Typography>
          </Box>

          <Divider />

          {/* Workout Type */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              <Trans>Workout Type</Trans>
            </Typography>
            <Typography variant="body1">
              {getWorkoutTypeLabel(workout.type)}
            </Typography>
          </Box>

          <Divider />

          {/* Time */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              <Trans>Time</Trans>
            </Typography>
            <Typography variant="body1">
              {startTime} - {endTime}
            </Typography>
          </Box>

          {/* Swimming Workout Details */}
          {workout.type === WorkoutType.SWIMMING && workout.swimmingDetails && (
            <>
              <Divider />
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  <Trans>Swimming Details</Trans>
                </Typography>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      <Trans>Distance Goal</Trans>
                    </Typography>
                    <Typography variant="body2">
                      {workout.swimmingDetails.distanceGoal}{' '}
                      <Trans>meters</Trans>
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      <Trans>Lap Count</Trans>
                    </Typography>
                    <Typography variant="body2">
                      {workout.swimmingDetails.lapCount}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      <Trans>Time per Lap</Trans>
                    </Typography>
                    <Typography variant="body2">
                      {workout.swimmingDetails.timePerLap}{' '}
                      <Trans>seconds</Trans>
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      <Trans>Type of Swim</Trans>
                    </Typography>
                    <Typography variant="body2">
                      {getSwimTypeLabel(workout.swimmingDetails.swimType)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      <Trans>Intensity Level</Trans>
                    </Typography>
                    <Typography variant="body2">
                      <Chip
                        label={getIntensityLevelLabel(
                          workout.swimmingDetails.intensity,
                        )}
                        size="small"
                        color={(() => {
                          const { intensity } = workout.swimmingDetails;
                          if (
                            intensity === IntensityLevel.VERY_HIGH ||
                            intensity === IntensityLevel.HIGH
                          ) {
                            return 'error';
                          }
                          if (intensity === IntensityLevel.MODERATE) {
                            return 'warning';
                          }
                          return 'success';
                        })()}
                      />
                    </Typography>
                  </Box>
                  {workout.swimmingDetails.heartRate && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        <Trans>Heart Rate</Trans>
                      </Typography>
                      <Typography variant="body2">
                        {workout.swimmingDetails.heartRate} <Trans>bpm</Trans>
                      </Typography>
                    </Box>
                  )}
                  {workout.swimmingDetails.notes && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        <Trans>Notes</Trans>
                      </Typography>
                      <Typography variant="body2">
                        {workout.swimmingDetails.notes}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </>
          )}

          {/* Cycling Details - Only shown for CYCLING type */}
          {workout.type === WorkoutType.CYCLING && workout.cyclingDetails && (
            <>
              <Divider />
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  <Trans>Cycling Details</Trans>
                </Typography>
                <Stack spacing={1}>
                  {workout.cyclingDetails.distance !== undefined && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        <Trans>Distance:</Trans>
                      </Typography>
                      <Typography variant="body2">
                        {workout.cyclingDetails.distance} km
                      </Typography>
                    </Box>
                  )}
                  {workout.cyclingDetails.averageSpeed !== undefined && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        <Trans>Average Speed:</Trans>
                      </Typography>
                      <Typography variant="body2">
                        {workout.cyclingDetails.averageSpeed} km/h
                      </Typography>
                    </Box>
                  )}
                  {workout.cyclingDetails.elevationGain !== undefined && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        <Trans>Elevation Gain:</Trans>
                      </Typography>
                      <Typography variant="body2">
                        {workout.cyclingDetails.elevationGain} m
                      </Typography>
                    </Box>
                  )}
                  {workout.cyclingDetails.averageHeartRate !== undefined && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        <Trans>Average Heart Rate:</Trans>
                      </Typography>
                      <Typography variant="body2">
                        {workout.cyclingDetails.averageHeartRate} bpm
                      </Typography>
                    </Box>
                  )}
                  {workout.cyclingDetails.notes && (
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        <Trans>Notes:</Trans>
                      </Typography>
                      <Typography variant="body2">
                        {workout.cyclingDetails.notes}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </>
          )}

          {/* Gym Details - Only shown for GYM type */}
          {workout.type === WorkoutType.GYM && workout.gymDetails && (
            <>
              <Divider />
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  <Trans>Gym Details</Trans>
                </Typography>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      <Trans>Intensity Level</Trans>
                    </Typography>
                    <Typography variant="body2">
                      <Chip
                        label={getIntensityLevelLabel(
                          workout.gymDetails.intensity,
                        )}
                        size="small"
                        color={(() => {
                          const { intensity } = workout.gymDetails;
                          if (
                            intensity === IntensityLevel.VERY_HIGH ||
                            intensity === IntensityLevel.HIGH
                          ) {
                            return 'error';
                          }
                          if (intensity === IntensityLevel.MODERATE) {
                            return 'warning';
                          }
                          return 'success';
                        })()}
                      />
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      <Trans>Rest Time Between Sets</Trans>
                    </Typography>
                    <Typography variant="body2">
                      {workout.gymDetails.restTimeBetweenSets}{' '}
                      <Trans>seconds</Trans>
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      <Trans>Muscle Groups</Trans>
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {workout.gymDetails.muscleGroups.map(group => (
                        <Chip
                          key={group}
                          label={getMuscleGroupLabel(group)}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      <Trans>Exercises</Trans>
                    </Typography>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                      {workout.gymDetails.exercises.map(exercise => (
                        <Box
                          key={exercise.id}
                          sx={{
                            p: 1.5,
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="body2" fontWeight="bold">
                            {exercise.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.5 }}
                          >
                            {getExerciseTypeLabel(exercise.type)}
                          </Typography>
                          <Stack spacing={0.5} sx={{ mt: 1 }}>
                            {exercise.sets.map((set, idx) => (
                              <Typography
                                key={idx}
                                variant="caption"
                                sx={{ display: 'block' }}
                              >
                                <Trans>Set</Trans> {idx + 1}: {set.reps}{' '}
                                <Trans>reps</Trans>
                                {set.weight && (
                                  <>
                                    {' '}
                                    × {set.weight} <Trans>kg</Trans>
                                  </>
                                )}
                              </Typography>
                            ))}
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                  {workout.gymDetails.notes && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        <Trans>Notes</Trans>
                      </Typography>
                      <Typography variant="body2">
                        {workout.gymDetails.notes}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </>
          )}

          {/* Long Run Details - Only shown for LONG_RUN type */}
          {workout.type === WorkoutType.LONG_RUN && workout.longRunDetails && (
            <>
              <Divider />
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  <Trans>Long Run Details</Trans>
                </Typography>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      <Trans>Distance Goal</Trans>
                    </Typography>
                    <Typography variant="body2">
                      {workout.longRunDetails.distanceGoal} <Trans>km</Trans>
                    </Typography>
                  </Box>
                  {workout.longRunDetails.paceGoal !== undefined && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        <Trans>Pace Goal</Trans>
                      </Typography>
                      <Typography variant="body2">
                        {workout.longRunDetails.paceGoal} <Trans>min/km</Trans>
                      </Typography>
                    </Box>
                  )}
                  {workout.longRunDetails.averageHeartRate !== undefined && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        <Trans>Average Heart Rate</Trans>
                      </Typography>
                      <Typography variant="body2">
                        {workout.longRunDetails.averageHeartRate}{' '}
                        <Trans>bpm</Trans>
                      </Typography>
                    </Box>
                  )}
                  {workout.longRunDetails.peakHeartRate !== undefined && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        <Trans>Peak Heart Rate</Trans>
                      </Typography>
                      <Typography variant="body2">
                        {workout.longRunDetails.peakHeartRate}{' '}
                        <Trans>bpm</Trans>
                      </Typography>
                    </Box>
                  )}
                  {workout.longRunDetails.hydrationNotes && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        <Trans>Hydration Notes</Trans>
                      </Typography>
                      <Typography variant="body2">
                        {workout.longRunDetails.hydrationNotes}
                      </Typography>
                    </Box>
                  )}
                  {workout.longRunDetails.notes && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        <Trans>Notes</Trans>
                      </Typography>
                      <Typography variant="body2">
                        {workout.longRunDetails.notes}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </>
          )}

          {/* Run Details - Only shown for RUN type */}
          {workout.type === WorkoutType.RUN && workout.runDetails && (
            <>
              <Divider />
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  <Trans>Run Details</Trans>
                </Typography>
                <Stack spacing={1.5}>
                  {workout.runDetails.distanceGoal !== undefined && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        <Trans>Distance Goal</Trans>
                      </Typography>
                      <Typography variant="body2">
                        {workout.runDetails.distanceGoal} <Trans>km</Trans>
                      </Typography>
                    </Box>
                  )}
                  {workout.runDetails.paceGoal !== undefined && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        <Trans>Pace Goal</Trans>
                      </Typography>
                      <Typography variant="body2">
                        {workout.runDetails.paceGoal} <Trans>min/km</Trans>
                      </Typography>
                    </Box>
                  )}
                  {workout.runDetails.heartRateZone && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        <Trans>Heart Rate Zone</Trans>
                      </Typography>
                      <Typography variant="body2">
                        {getHeartRateZoneLabel(
                          workout.runDetails.heartRateZone,
                        )}
                      </Typography>
                    </Box>
                  )}
                  {workout.runDetails.heartRateZone ===
                    HeartRateZone.CUSTOM && (
                    <>
                      {workout.runDetails.customHeartRateMin !== undefined && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            <Trans>Custom HR Min</Trans>
                          </Typography>
                          <Typography variant="body2">
                            {workout.runDetails.customHeartRateMin}{' '}
                            <Trans>bpm</Trans>
                          </Typography>
                        </Box>
                      )}
                      {workout.runDetails.customHeartRateMax !== undefined && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            <Trans>Custom HR Max</Trans>
                          </Typography>
                          <Typography variant="body2">
                            {workout.runDetails.customHeartRateMax}{' '}
                            <Trans>bpm</Trans>
                          </Typography>
                        </Box>
                      )}
                    </>
                  )}
                  {workout.runDetails.notes && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        <Trans>Notes</Trans>
                      </Typography>
                      <Typography variant="body2">
                        {workout.runDetails.notes}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </>
          )}

          {/* Recovery Details - Only shown for RECOVERY type */}
          {workout.type === WorkoutType.RECOVERY && workout.recoveryDetails && (
            <>
              <Divider />
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  <Trans>Recovery Details</Trans>
                </Typography>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      <Trans>Activity Type</Trans>
                    </Typography>
                    <Typography variant="body2">
                      {getRecoveryActivityLabel(
                        workout.recoveryDetails.activityType,
                      )}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      <Trans>Intensity Level</Trans>
                    </Typography>
                    <Typography variant="body2">
                      <Chip
                        label={getIntensityLevelLabel(
                          workout.recoveryDetails.intensity,
                        )}
                        size="small"
                        color={(() => {
                          const { intensity } = workout.recoveryDetails;
                          if (
                            intensity === IntensityLevel.VERY_HIGH ||
                            intensity === IntensityLevel.HIGH
                          ) {
                            return 'error';
                          }
                          if (intensity === IntensityLevel.MODERATE) {
                            return 'warning';
                          }
                          return 'success';
                        })()}
                      />
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      <Trans>Focus Areas</Trans>
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {workout.recoveryDetails.focusAreas.map(area => (
                        <Chip
                          key={area}
                          label={getRecoveryFocusAreaLabel(area)}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                  {workout.recoveryDetails.heartRate !== undefined && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        <Trans>Heart Rate</Trans>
                      </Typography>
                      <Typography variant="body2">
                        {workout.recoveryDetails.heartRate} <Trans>bpm</Trans>
                      </Typography>
                    </Box>
                  )}
                  {workout.recoveryDetails.notes && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        <Trans>Notes</Trans>
                      </Typography>
                      <Typography variant="body2">
                        {workout.recoveryDetails.notes}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </>
          )}

          {/* Interval Training Details - Only shown for INTERVAL_TRAINING type */}
          {workout.type === WorkoutType.INTERVAL_TRAINING &&
            workout.intervalDetails && (
              <>
                <Divider />
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    <Trans>Interval Training Details</Trans>
                  </Typography>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        <Trans>Number of Rounds</Trans>
                      </Typography>
                      <Typography variant="body2">
                        {workout.intervalDetails.rounds}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        <Trans>Intensity Level</Trans>
                      </Typography>
                      <Typography variant="body2">
                        <Chip
                          label={getIntensityLevelLabel(
                            workout.intervalDetails.intensity,
                          )}
                          size="small"
                          color={(() => {
                            const { intensity } = workout.intervalDetails;
                            if (
                              intensity === IntensityLevel.VERY_HIGH ||
                              intensity === IntensityLevel.HIGH
                            ) {
                              return 'error';
                            }
                            if (intensity === IntensityLevel.MODERATE) {
                              return 'warning';
                            }
                            return 'success';
                          })()}
                        />
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        <Trans>Intervals</Trans>
                      </Typography>
                      <Stack spacing={1} sx={{ mt: 1 }}>
                        {workout.intervalDetails.intervals.map(
                          (interval, idx) => (
                            <Box
                              key={interval.id}
                              sx={{
                                p: 1.5,
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 1,
                                backgroundColor:
                                  interval.type === 'work'
                                    ? 'action.hover'
                                    : 'background.paper',
                              }}
                            >
                              <Typography variant="body2" fontWeight="bold">
                                <Trans>Interval</Trans> {idx + 1} -{' '}
                                {interval.type === 'work' ? (
                                  <Trans>Work</Trans>
                                ) : (
                                  <Trans>Rest</Trans>
                                )}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ display: 'block', mt: 0.5 }}
                              >
                                <Trans>Duration</Trans>:{' '}
                                {interval.durationMinutes}:
                                {String(interval.durationSeconds).padStart(
                                  2,
                                  '0',
                                )}
                              </Typography>
                              {interval.distance !== undefined && (
                                <Typography
                                  variant="caption"
                                  sx={{ display: 'block' }}
                                >
                                  <Trans>Distance</Trans>: {interval.distance}{' '}
                                  <Trans>km</Trans>
                                </Typography>
                              )}
                              {interval.targetPace && (
                                <Typography
                                  variant="caption"
                                  sx={{ display: 'block' }}
                                >
                                  <Trans>Target Pace</Trans>:{' '}
                                  {interval.targetPace} <Trans>per km</Trans>
                                </Typography>
                              )}
                              {interval.notes && (
                                <Typography
                                  variant="caption"
                                  sx={{ display: 'block', mt: 0.5 }}
                                  color="text.secondary"
                                >
                                  {interval.notes}
                                </Typography>
                              )}
                            </Box>
                          ),
                        )}
                      </Stack>
                    </Box>
                    {workout.intervalDetails.notes && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          <Trans>Notes</Trans>
                        </Typography>
                        <Typography variant="body2">
                          {workout.intervalDetails.notes}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>
              </>
            )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', margin: 2 }}>
        <Button
          onClick={handleDelete}
          startIcon={<DeleteIcon />}
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
          <Trans>Delete</Trans>
        </Button>

        <Button
          onClick={handleEdit}
          startIcon={<EditIcon />}
          color="primary"
          variant="text"
          sx={{
            color: theme => theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme => theme.palette.primary.main,
              color: theme => theme.palette.primary.contrastText,
            },
          }}
        >
          <Trans>Edit</Trans>
        </Button>
      </DialogActions>
    </Dialog>
  );
};
