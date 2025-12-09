import { FC } from 'react';
import { Box, Paper, Typography, Chip, Stack } from '@mui/material';
import { isToday } from 'date-fns';

import { getWorkoutTypeLabel } from '../../../helpers/workoutTypeLabels/workoutTypeLabels';
import { CalendarDayProps } from './CalendarDay.model';

/**
 * CalendarDay component displays a single day in the calendar
 * Shows the day number and up to 3 workouts
 */
export const CalendarDay: FC<CalendarDayProps> = ({
  date,
  isCurrentMonth,
  workouts,
  onDayClick,
  onWorkoutClick,
}) => {
  const today = isToday(date);
  const hasWorkouts = workouts.length > 0;

  return (
    <Paper
      onClick={() => onDayClick(date)}
      sx={{
        minHeight: { xs: 80, sm: 100, md: 120 },
        p: 1,
        cursor: 'pointer',
        backgroundColor: theme =>
          !isCurrentMonth
            ? theme.palette.action.disabledBackground
            : theme.palette.background.paper,
        opacity: isCurrentMonth ? 1 : 0.5,
        border: theme =>
          today
            ? `2px solid ${theme.palette.accent.main}`
            : `1px solid ${theme.palette.divider}`,
        '&:hover': {
          backgroundColor: theme => theme.palette.action.hover,
        },
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
      }}
      elevation={hasWorkouts ? 2 : 0}
      role="button"
      tabIndex={0}
      aria-label={`${date.toLocaleDateString()}, ${workouts.length} workouts`}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onDayClick(date);
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* Day number */}
        <Typography
          variant="body2"
          sx={{
            fontWeight: today ? 'bold' : 'normal',
            color: theme => {
              if (today) {
                return theme.palette.accent.main;
              }
              if (isCurrentMonth) {
                return theme.palette.text.primary;
              }
              return theme.palette.text.disabled;
            },
          }}
        >
          {date.getDate()}
        </Typography>

        {/* Workout chips - max 3 */}
        <Stack spacing={0.5} sx={{ mt: 0.5, overflow: 'hidden' }}>
          {workouts.slice(0, 3).map(workout => {
            const startTime = `${String(workout.startHour).padStart(2, '0')}:${String(workout.startMinute).padStart(2, '0')}`;
            return (
              <Chip
                key={workout.id}
                label={`${startTime} ${getWorkoutTypeLabel(workout.type)}`}
                size="small"
                onClick={e => {
                  e.stopPropagation();
                  onWorkoutClick(workout);
                }}
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  backgroundColor: theme => theme.palette.primary.main,
                  color: theme => theme.palette.primary.contrastText,
                  cursor: 'pointer',
                  maxWidth: '100%',
                  width: '100%',
                  '& .MuiChip-label': {
                    px: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                  },
                  '&:hover': {
                    backgroundColor: theme => theme.palette.primary.dark,
                  },
                }}
              />
            );
          })}
          {workouts.length > 3 && (
            <Typography variant="caption" sx={{ pl: 1 }}>
              +{workouts.length - 3} more
            </Typography>
          )}
        </Stack>
      </Box>
    </Paper>
  );
};
