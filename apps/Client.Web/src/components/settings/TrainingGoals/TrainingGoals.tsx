import { FC, useState, useEffect } from 'react';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  IconButton,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { useSnackbar } from 'notistack';

import {
  SportType,
  WorkoutGoals,
  ActivityTypeGoal,
} from '@baaa-hub/shared-types';
import { useUser } from '../../../providers/UserProvider/UserProvider';
import { updateUserProfile } from '../../../services/userService';
import { getSportTypeLabels } from '../../../helpers/sportTypes/sportTypeLabels';
import { useAuth } from '../../../providers/AuthProvider/AuthProvider';

/**
 * Training Goals component for managing user workout goals
 * Allows users to set weekly/monthly/yearly km goals, activity count goals,
 * and activity type-specific goals
 */
export const TrainingGoals: FC = () => {
  const { user, refreshUser } = useUser();
  const { token } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  // Distance goals
  const [weeklyKm, setWeeklyKm] = useState<number | ''>('');
  const [monthlyKm, setMonthlyKm] = useState<number | ''>('');
  const [yearlyKm, setYearlyKm] = useState<number | ''>('');

  // Activity count goals
  const [weeklyActivities, setWeeklyActivities] = useState<number | ''>('');
  const [monthlyActivities, setMonthlyActivities] = useState<number | ''>('');
  const [yearlyActivities, setYearlyActivities] = useState<number | ''>('');

  // Activity type-specific goals
  const [weeklyActivityTypeGoals, setWeeklyActivityTypeGoals] = useState<
    ActivityTypeGoal[]
  >([]);
  const [monthlyActivityTypeGoals, setMonthlyActivityTypeGoals] = useState<
    ActivityTypeGoal[]
  >([]);

  const [isSaving, setIsSaving] = useState(false);

  // Get sport type labels
  const sportTypeLabels = getSportTypeLabels();

  // Initialize state from user data
  useEffect(() => {
    if (user?.workoutGoals) {
      const goals = user.workoutGoals;
      setWeeklyKm(goals.weeklyKm ?? '');
      setMonthlyKm(goals.monthlyKm ?? '');
      setYearlyKm(goals.yearlyKm ?? '');
      setWeeklyActivities(goals.weeklyActivities ?? '');
      setMonthlyActivities(goals.monthlyActivities ?? '');
      setYearlyActivities(goals.yearlyActivities ?? '');
      setWeeklyActivityTypeGoals(goals.weeklyActivityTypeGoals ?? []);
      setMonthlyActivityTypeGoals(goals.monthlyActivityTypeGoals ?? []);
    }
  }, [user]);

  const handleAddWeeklyActivityTypeGoal = () => {
    setWeeklyActivityTypeGoals([
      ...weeklyActivityTypeGoals,
      { type: SportType.RUNNING, count: 1 },
    ]);
  };

  const handleAddMonthlyActivityTypeGoal = () => {
    setMonthlyActivityTypeGoals([
      ...monthlyActivityTypeGoals,
      { type: SportType.RUNNING, count: 1 },
    ]);
  };

  const handleRemoveWeeklyActivityTypeGoal = (index: number) => {
    setWeeklyActivityTypeGoals(
      weeklyActivityTypeGoals.filter((_, i) => i !== index),
    );
  };

  const handleRemoveMonthlyActivityTypeGoal = (index: number) => {
    setMonthlyActivityTypeGoals(
      monthlyActivityTypeGoals.filter((_, i) => i !== index),
    );
  };

  const handleUpdateWeeklyActivityTypeGoal = (
    index: number,
    field: 'type' | 'count',
    value: SportType | number,
  ) => {
    const updated = weeklyActivityTypeGoals.map((goal, i) => {
      if (i === index) {
        if (field === 'type') {
          return { ...goal, type: value as SportType };
        }
        return { ...goal, count: value as number };
      }
      return goal;
    });
    setWeeklyActivityTypeGoals(updated);
  };

  const handleUpdateMonthlyActivityTypeGoal = (
    index: number,
    field: 'type' | 'count',
    value: SportType | number,
  ) => {
    const updated = monthlyActivityTypeGoals.map((goal, i) => {
      if (i === index) {
        if (field === 'type') {
          return { ...goal, type: value as SportType };
        }
        return { ...goal, count: value as number };
      }
      return goal;
    });
    setMonthlyActivityTypeGoals(updated);
  };

  const handleSave = async () => {
    if (!token?.accessToken) {
      enqueueSnackbar(t`Authentication required`, { variant: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      const workoutGoals: WorkoutGoals = {
        weeklyKm: weeklyKm === '' ? undefined : weeklyKm,
        monthlyKm: monthlyKm === '' ? undefined : monthlyKm,
        yearlyKm: yearlyKm === '' ? undefined : yearlyKm,
        weeklyActivities:
          weeklyActivities === '' ? undefined : weeklyActivities,
        monthlyActivities:
          monthlyActivities === '' ? undefined : monthlyActivities,
        yearlyActivities:
          yearlyActivities === '' ? undefined : yearlyActivities,
        weeklyActivityTypeGoals:
          weeklyActivityTypeGoals.length > 0
            ? weeklyActivityTypeGoals
            : undefined,
        monthlyActivityTypeGoals:
          monthlyActivityTypeGoals.length > 0
            ? monthlyActivityTypeGoals
            : undefined,
      };

      await updateUserProfile(token.accessToken, { workoutGoals });
      await refreshUser();
      enqueueSnackbar(t`Training goals updated successfully!`, {
        variant: 'success',
      });
    } catch (err) {
      // Log error for debugging while showing user-friendly message
      console.error('Failed to update training goals:', err);
      enqueueSnackbar(t`Failed to update training goals. Please try again.`, {
        variant: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const availableSportTypes = Object.values(SportType);

  return (
    <Stack spacing={3}>
      {/* Distance Goals */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Trans>Distance Goals</Trans>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <Trans>
              Set your weekly, monthly, and yearly distance goals in kilometers
            </Trans>
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label={t`Weekly Km`}
              type="number"
              value={weeklyKm}
              onChange={e =>
                setWeeklyKm(e.target.value === '' ? '' : Number(e.target.value))
              }
              inputProps={{ min: 0, step: 1 }}
            />
            <TextField
              fullWidth
              label={t`Monthly Km`}
              type="number"
              value={monthlyKm}
              onChange={e =>
                setMonthlyKm(
                  e.target.value === '' ? '' : Number(e.target.value),
                )
              }
              inputProps={{ min: 0, step: 1 }}
            />
            <TextField
              fullWidth
              label={t`Yearly Km`}
              type="number"
              value={yearlyKm}
              onChange={e =>
                setYearlyKm(e.target.value === '' ? '' : Number(e.target.value))
              }
              inputProps={{ min: 0, step: 1 }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Activity Count Goals */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Trans>Activity Count Goals</Trans>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <Trans>
              Set your weekly, monthly, and yearly activity count goals
            </Trans>
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label={t`Weekly Activities`}
              type="number"
              value={weeklyActivities}
              onChange={e =>
                setWeeklyActivities(
                  e.target.value === '' ? '' : Number(e.target.value),
                )
              }
              inputProps={{ min: 0, step: 1 }}
            />
            <TextField
              fullWidth
              label={t`Monthly Activities`}
              type="number"
              value={monthlyActivities}
              onChange={e =>
                setMonthlyActivities(
                  e.target.value === '' ? '' : Number(e.target.value),
                )
              }
              inputProps={{ min: 0, step: 1 }}
            />
            <TextField
              fullWidth
              label={t`Yearly Activities`}
              type="number"
              value={yearlyActivities}
              onChange={e =>
                setYearlyActivities(
                  e.target.value === '' ? '' : Number(e.target.value),
                )
              }
              inputProps={{ min: 0, step: 1 }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Weekly Activity Type Goals */}
      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h6">
                <Trans>Weekly Activity Type Goals</Trans>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <Trans>Set goals for specific activity types per week</Trans>
              </Typography>
            </Box>
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddWeeklyActivityTypeGoal}
              size="small"
            >
              <Trans>Add Goal</Trans>
            </Button>
          </Box>
          {weeklyActivityTypeGoals.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              <Trans>
                No weekly activity type goals set. Click &quot;Add Goal&quot; to
                create one.
              </Trans>
            </Typography>
          ) : (
            <Stack spacing={2}>
              {weeklyActivityTypeGoals.map((goal, index) => (
                <Stack
                  key={index}
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  alignItems="center"
                >
                  <FormControl fullWidth sx={{ flex: { sm: 2 } }}>
                    <InputLabel>{t`Activity Type`}</InputLabel>
                    <Select
                      value={goal.type}
                      label={t`Activity Type`}
                      onChange={e =>
                        handleUpdateWeeklyActivityTypeGoal(
                          index,
                          'type',
                          e.target.value as SportType,
                        )
                      }
                    >
                      {availableSportTypes.map(type => (
                        <MenuItem key={type} value={type}>
                          {sportTypeLabels[type]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    sx={{ flex: { sm: 1 } }}
                    label={t`Count`}
                    type="number"
                    value={goal.count}
                    onChange={e =>
                      handleUpdateWeeklyActivityTypeGoal(
                        index,
                        'count',
                        Number(e.target.value),
                      )
                    }
                    inputProps={{ min: 0, step: 1 }}
                  />
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveWeeklyActivityTypeGoal(index)}
                    aria-label={t`Remove goal`}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Monthly Activity Type Goals */}
      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h6">
                <Trans>Monthly Activity Type Goals</Trans>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <Trans>Set goals for specific activity types per month</Trans>
              </Typography>
            </Box>
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddMonthlyActivityTypeGoal}
              size="small"
            >
              <Trans>Add Goal</Trans>
            </Button>
          </Box>
          {monthlyActivityTypeGoals.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              <Trans>
                No monthly activity type goals set. Click &quot;Add Goal&quot;
                to create one.
              </Trans>
            </Typography>
          ) : (
            <Stack spacing={2}>
              {monthlyActivityTypeGoals.map((goal, index) => (
                <Stack
                  key={index}
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  alignItems="center"
                >
                  <FormControl fullWidth sx={{ flex: { sm: 2 } }}>
                    <InputLabel>{t`Activity Type`}</InputLabel>
                    <Select
                      value={goal.type}
                      label={t`Activity Type`}
                      onChange={e =>
                        handleUpdateMonthlyActivityTypeGoal(
                          index,
                          'type',
                          e.target.value as SportType,
                        )
                      }
                    >
                      {availableSportTypes.map(type => (
                        <MenuItem key={type} value={type}>
                          {sportTypeLabels[type]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    sx={{ flex: { sm: 1 } }}
                    label={t`Count`}
                    type="number"
                    value={goal.count}
                    onChange={e =>
                      handleUpdateMonthlyActivityTypeGoal(
                        index,
                        'count',
                        Number(e.target.value),
                      )
                    }
                    inputProps={{ min: 0, step: 1 }}
                  />
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveMonthlyActivityTypeGoal(index)}
                    aria-label={t`Remove goal`}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? <Trans>Saving...</Trans> : <Trans>Save Goals</Trans>}
        </Button>
      </Box>
    </Stack>
  );
};
