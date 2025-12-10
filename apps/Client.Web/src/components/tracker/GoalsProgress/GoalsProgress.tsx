import { FC } from 'react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import {
  Box,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Typography,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { WorkoutGoals } from '@baaa-hub/shared-types';

interface GoalsProgressProps {
  goals: WorkoutGoals;
  currentWeekKm?: number;
  currentMonthKm?: number;
  currentYearKm?: number;
  currentWeekActivities?: number;
  currentMonthActivities?: number;
  currentYearActivities?: number;
}

/**
 * GoalsProgress component displays progress towards workout goals
 * Shows weekly, monthly, and yearly progress with visual indicators
 */
export const GoalsProgress: FC<GoalsProgressProps> = ({
  goals,
  currentWeekKm = 0,
  currentMonthKm = 0,
  currentYearKm = 0,
  currentWeekActivities = 0,
  currentMonthActivities = 0,
  currentYearActivities = 0,
}) => {
  const hasAnyGoals =
    goals.weeklyKm ||
    goals.monthlyKm ||
    goals.yearlyKm ||
    goals.weeklyActivities ||
    goals.monthlyActivities ||
    goals.yearlyActivities;

  if (!hasAnyGoals) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            <Trans>
              No goals set yet. Visit Settings → Training Goals to set your
              workout goals.
            </Trans>
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const renderProgressItem = (
    label: string,
    current: number,
    target: number | undefined,
    unit: string,
  ) => {
    if (!target) return null;

    const progress = Math.min((current / target) * 100, 100);
    const isComplete = current >= target;

    return (
      <Box sx={{ mb: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 0.5 }}
        >
          <Typography variant="body2" fontWeight="medium">
            {label}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {current} / {target} {unit}
            </Typography>
            {isComplete && (
              <Chip
                icon={<CheckCircleIcon />}
                label={t`Complete`}
                color="success"
                size="small"
              />
            )}
          </Stack>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={progress}
          color={isComplete ? 'success' : 'primary'}
          sx={{ height: 8, borderRadius: 1 }}
        />
      </Box>
    );
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <Trans>Goals Progress</Trans>
        </Typography>

        {/* Weekly Goals */}
        {(goals.weeklyKm || goals.weeklyActivities) && (
          <>
            <Typography
              variant="subtitle2"
              color="primary"
              sx={{ mt: 2, mb: 1 }}
            >
              <Trans>This Week</Trans>
            </Typography>
            {renderProgressItem(
              t`Distance`,
              currentWeekKm,
              goals.weeklyKm,
              'km',
            )}
            {renderProgressItem(
              t`Activities`,
              currentWeekActivities,
              goals.weeklyActivities,
              '',
            )}
          </>
        )}

        {/* Monthly Goals */}
        {(goals.monthlyKm || goals.monthlyActivities) && (
          <>
            <Typography
              variant="subtitle2"
              color="primary"
              sx={{ mt: 2, mb: 1 }}
            >
              <Trans>This Month</Trans>
            </Typography>
            {renderProgressItem(
              t`Distance`,
              currentMonthKm,
              goals.monthlyKm,
              'km',
            )}
            {renderProgressItem(
              t`Activities`,
              currentMonthActivities,
              goals.monthlyActivities,
              '',
            )}
          </>
        )}

        {/* Yearly Goals */}
        {(goals.yearlyKm || goals.yearlyActivities) && (
          <>
            <Typography
              variant="subtitle2"
              color="primary"
              sx={{ mt: 2, mb: 1 }}
            >
              <Trans>This Year</Trans>
            </Typography>
            {renderProgressItem(
              t`Distance`,
              currentYearKm,
              goals.yearlyKm,
              'km',
            )}
            {renderProgressItem(
              t`Activities`,
              currentYearActivities,
              goals.yearlyActivities,
              '',
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
