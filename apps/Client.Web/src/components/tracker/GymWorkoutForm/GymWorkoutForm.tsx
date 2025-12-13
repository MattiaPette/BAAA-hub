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
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';

import {
  ExerciseType,
  MuscleGroup,
  IntensityLevel,
  Exercise,
  ExerciseSet,
  GymWorkoutDetails,
} from '../../../types/tracker';
import { GymWorkoutFormProps } from './GymWorkoutForm.model';

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
 * GymWorkoutForm component for detailed gym workout tracking
 */
export const GymWorkoutForm: FC<GymWorkoutFormProps> = ({
  value,
  onChange,
}) => {
  const [exercises, setExercises] = useState<Exercise[]>(
    value?.exercises || [],
  );
  const [intensity, setIntensity] = useState<IntensityLevel>(
    value?.intensity || IntensityLevel.MODERATE,
  );
  const [restTime, setRestTime] = useState<number>(
    value?.restTimeBetweenSets || 60,
  );
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>(
    value?.muscleGroups || [],
  );
  const [notes, setNotes] = useState<string>(value?.notes || '');

  // Update parent when any field changes
  const updateDetails = (updates: Readonly<Partial<GymWorkoutDetails>>) => {
    const newDetails: GymWorkoutDetails = {
      exercises: updates.exercises ?? exercises,
      intensity: updates.intensity ?? intensity,
      restTimeBetweenSets: updates.restTimeBetweenSets ?? restTime,
      muscleGroups: updates.muscleGroups ?? muscleGroups,
      notes: updates.notes ?? notes,
    };
    onChange(newDetails);
  };

  // Add new exercise
  const handleAddExercise = () => {
    const newExercise: Exercise = {
      id: `exercise-${Date.now()}`,
      name: '',
      type: ExerciseType.BARBELL,
      sets: [{ reps: 10, weight: 0 }],
    };
    const newExercises = [...exercises, newExercise];
    setExercises(newExercises);
    updateDetails({ exercises: newExercises });
  };

  // Remove exercise
  const handleRemoveExercise = (exerciseId: string) => {
    const newExercises = exercises.filter(e => e.id !== exerciseId);
    setExercises(newExercises);
    updateDetails({ exercises: newExercises });
  };

  // Update exercise field
  const handleUpdateExercise = (
    exerciseId: string,
    field: keyof Exercise,
    value: string | ExerciseType | ExerciseSet[],
  ) => {
    const newExercises = exercises.map(ex =>
      ex.id === exerciseId ? { ...ex, [field]: value } : ex,
    );
    setExercises(newExercises);
    updateDetails({ exercises: newExercises });
  };

  // Add set to exercise
  const handleAddSet = (exerciseId: string) => {
    const newExercises = exercises.map(ex =>
      ex.id === exerciseId
        ? { ...ex, sets: [...ex.sets, { reps: 10, weight: 0 }] }
        : ex,
    );
    setExercises(newExercises);
    updateDetails({ exercises: newExercises });
  };

  // Remove set from exercise
  const handleRemoveSet = (exerciseId: string, setIndex: number) => {
    const newExercises = exercises.map(ex =>
      ex.id === exerciseId
        ? { ...ex, sets: ex.sets.filter((_, i) => i !== setIndex) }
        : ex,
    );
    setExercises(newExercises);
    updateDetails({ exercises: newExercises });
  };

  // Update set values
  const handleUpdateSet = (
    exerciseId: string,
    setIndex: number,
    field: keyof ExerciseSet,
    value: number,
  ) => {
    const newExercises = exercises.map(ex =>
      ex.id === exerciseId
        ? {
            ...ex,
            sets: ex.sets.map((set, i) =>
              i === setIndex ? { ...set, [field]: value } : set,
            ),
          }
        : ex,
    );
    setExercises(newExercises);
    updateDetails({ exercises: newExercises });
  };

  // Handle intensity change
  const handleIntensityChange = (newIntensity: IntensityLevel) => {
    setIntensity(newIntensity);
    updateDetails({ intensity: newIntensity });
  };

  // Handle rest time change
  const handleRestTimeChange = (newRestTime: number) => {
    setRestTime(newRestTime);
    updateDetails({ restTimeBetweenSets: newRestTime });
  };

  // Handle muscle groups change
  const handleMuscleGroupsChange = (
    event: SelectChangeEvent<typeof muscleGroups>,
  ) => {
    const { value } = event.target;
    const newMuscleGroups =
      typeof value === 'string' ? (value.split(',') as MuscleGroup[]) : value;
    setMuscleGroups(newMuscleGroups);
    updateDetails({ muscleGroups: newMuscleGroups });
  };

  // Handle notes change
  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    updateDetails({ notes: newNotes });
  };

  return (
    <Stack spacing={3}>
      {/* Exercises Section */}
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
            <Trans>Exercises</Trans>
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddExercise}
            variant="outlined"
            size="small"
          >
            <Trans>Add Exercise</Trans>
          </Button>
        </Box>

        {exercises.map((exercise, exerciseIndex) => (
          <Paper key={exercise.id} sx={{ p: 2, mb: 2 }}>
            <Stack spacing={2}>
              {/* Exercise header */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="subtitle1">
                  <Trans>Exercise {exerciseIndex + 1}</Trans>
                </Typography>
                <IconButton
                  onClick={() => handleRemoveExercise(exercise.id)}
                  size="small"
                  color="error"
                  aria-label={t`Remove exercise`}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>

              {/* Exercise name and type */}
              <Stack direction="row" spacing={2}>
                <TextField
                  label={t`Exercise Name`}
                  value={exercise.name}
                  onChange={e =>
                    handleUpdateExercise(exercise.id, 'name', e.target.value)
                  }
                  fullWidth
                  placeholder={t`e.g., Bench Press`}
                />
                <FormControl fullWidth>
                  <InputLabel id={`exercise-type-${exercise.id}`}>
                    <Trans>Type</Trans>
                  </InputLabel>
                  <Select
                    labelId={`exercise-type-${exercise.id}`}
                    value={exercise.type}
                    label={t`Type`}
                    onChange={e =>
                      handleUpdateExercise(
                        exercise.id,
                        'type',
                        e.target.value as ExerciseType,
                      )
                    }
                  >
                    {Object.values(ExerciseType).map(type => (
                      <MenuItem key={type} value={type}>
                        {getExerciseTypeLabel(type)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              {/* Sets table */}
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    <Trans>Sets</Trans>
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => handleAddSet(exercise.id)}
                    size="small"
                  >
                    <Trans>Add Set</Trans>
                  </Button>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <Trans>Set</Trans>
                        </TableCell>
                        <TableCell>
                          <Trans>Reps</Trans>
                        </TableCell>
                        <TableCell>
                          <Trans>Weight (kg)</Trans>
                        </TableCell>
                        <TableCell align="right">
                          <Trans>Actions</Trans>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {exercise.sets.map((set, setIndex) => (
                        <TableRow key={setIndex}>
                          <TableCell>{setIndex + 1}</TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={set.reps}
                              onChange={e =>
                                handleUpdateSet(
                                  exercise.id,
                                  setIndex,
                                  'reps',
                                  Number(e.target.value),
                                )
                              }
                              size="small"
                              inputProps={{ min: 1 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={set.weight || 0}
                              onChange={e =>
                                handleUpdateSet(
                                  exercise.id,
                                  setIndex,
                                  'weight',
                                  Number(e.target.value),
                                )
                              }
                              size="small"
                              inputProps={{ min: 0, step: 0.5 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              onClick={() =>
                                handleRemoveSet(exercise.id, setIndex)
                              }
                              size="small"
                              disabled={exercise.sets.length === 1}
                              color="error"
                              aria-label={t`Remove set`}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Stack>
          </Paper>
        ))}

        {exercises.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <Trans>
              No exercises added yet. Click &ldquo;Add Exercise&rdquo; to start.
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

      {/* Rest Time */}
      <TextField
        label={t`Rest Time Between Sets (seconds)`}
        type="number"
        value={restTime}
        onChange={e => handleRestTimeChange(Number(e.target.value))}
        inputProps={{ min: 0, step: 5 }}
        fullWidth
      />

      {/* Muscle Groups */}
      <FormControl fullWidth>
        <InputLabel id="muscle-groups-label">
          <Trans>Muscle Groups Focus</Trans>
        </InputLabel>
        <Select
          labelId="muscle-groups-label"
          multiple
          value={muscleGroups}
          onChange={handleMuscleGroupsChange}
          input={<OutlinedInput label={t`Muscle Groups Focus`} />}
          renderValue={selected => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map(value => (
                <Chip
                  key={value}
                  label={getMuscleGroupLabel(value)}
                  size="small"
                />
              ))}
            </Box>
          )}
        >
          {Object.values(MuscleGroup).map(group => (
            <MenuItem key={group} value={group}>
              {getMuscleGroupLabel(group)}
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
        placeholder={t`Additional notes about your workout...`}
      />
    </Stack>
  );
};
