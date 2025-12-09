import { FC, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
} from 'date-fns';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';

import { AgendaViewProps, AgendaDay } from './AgendaView.model';
import { WorkoutType } from '../../../types/tracker';

/**
 * AgendaView component displays workouts in a list format for mobile devices
 * Uses date-fns (MIT licensed) for date calculations
 * https://github.com/date-fns/date-fns/blob/main/LICENSE.md
 */
export const AgendaView: FC<AgendaViewProps> = ({
  currentMonth,
  workouts,
  onWorkoutClick,
}) => {
  // Get workout type label
  const getWorkoutTypeLabel = (type: WorkoutType): string => {
    switch (type) {
      case WorkoutType.RUN:
        return t`Run`;
      case WorkoutType.GYM:
        return t`Gym`;
      case WorkoutType.LONG_RUN:
        return t`Long Run`;
      case WorkoutType.RECOVERY:
        return t`Recovery`;
      case WorkoutType.INTERVAL_TRAINING:
        return t`Interval Training`;
      default:
        return type;
    }
  };

  // Get workout type color
  const getWorkoutTypeColor = (
    type: WorkoutType,
  ):
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning' => {
    switch (type) {
      case WorkoutType.RUN:
        return 'primary';
      case WorkoutType.GYM:
        return 'secondary';
      case WorkoutType.LONG_RUN:
        return 'error';
      case WorkoutType.RECOVERY:
        return 'success';
      case WorkoutType.INTERVAL_TRAINING:
        return 'warning';
      default:
        return 'default';
    }
  };

  // Group workouts by day
  const agendaDays = useMemo<AgendaDay[]>(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const allDaysInMonth = eachDayOfInterval({
      start: monthStart,
      end: monthEnd,
    });

    return allDaysInMonth.map(date => ({
      date,
      workouts: workouts.filter(workout => isSameDay(workout.date, date)),
    }));
  }, [currentMonth, workouts]);

  // Filter to only show days with workouts
  const daysWithWorkouts = useMemo(
    () => agendaDays.filter(day => day.workouts.length > 0),
    [agendaDays],
  );

  // Format time as HH:MM
  const formatTime = (hour: number, minute: number): string =>
    `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

  return (
    <Box sx={{ mt: 2 }}>
      {daysWithWorkouts.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            bgcolor: theme => theme.palette.background.default,
          }}
        >
          <Typography variant="body1" color="text.secondary">
            <Trans>No workouts scheduled this month</Trans>
          </Typography>
        </Paper>
      ) : (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {daysWithWorkouts.map((day, dayIndex) => (
            <Box key={day.date.toISOString()}>
              {/* Date Header */}
              <ListItem
                sx={{
                  bgcolor: theme =>
                    isToday(day.date)
                      ? theme.palette.primary.dark
                      : theme.palette.grey[800],
                  color: 'white',
                  py: 1,
                }}
              >
                <ListItemText
                  primary={format(day.date, 'EEEE, MMMM d, yyyy')}
                  primaryTypographyProps={{
                    variant: 'subtitle1',
                    fontWeight: 'bold',
                  }}
                />
                <Chip
                  label={`${day.workouts.length} ${day.workouts.length === 1 ? t`workout` : t`workouts`}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                  }}
                />
              </ListItem>

              {/* Workouts for this day */}
              {day.workouts.map(workout => (
                <ListItemButton
                  key={workout.id}
                  onClick={() => onWorkoutClick(workout)}
                  sx={{
                    pl: 3,
                    pr: 2,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: theme => theme.palette.action.hover,
                    },
                  }}
                  aria-label={`${getWorkoutTypeLabel(workout.type)} from ${formatTime(workout.startHour, workout.startMinute)} to ${formatTime(workout.endHour, workout.endMinute)}`}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <Chip
                        label={getWorkoutTypeLabel(workout.type)}
                        color={getWorkoutTypeColor(workout.type)}
                        size="small"
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 0.5 }}
                    >
                      {formatTime(workout.startHour, workout.startMinute)} -{' '}
                      {formatTime(workout.endHour, workout.endMinute)}
                    </Typography>
                  </Box>
                </ListItemButton>
              ))}

              {/* Divider between days (except last day) */}
              {dayIndex < daysWithWorkouts.length - 1 && (
                <Divider sx={{ my: 1 }} />
              )}
            </Box>
          ))}
        </List>
      )}
    </Box>
  );
};
