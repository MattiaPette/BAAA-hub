import { FC, useMemo } from 'react';
import { Box, Paper, Typography, Chip, Stack } from '@mui/material';
import { isToday } from 'date-fns';

import { getWorkoutTypeLabel } from '../../../helpers/workoutTypeLabels/workoutTypeLabels';
import { CalendarDayProps } from './CalendarDay.model';
import { Workout } from '../../../types/tracker';

/**
 * Constants for chip height calculation
 */
const MIN_CHIP_HEIGHT = 20; // px
const BASE_DURATION = 30; // minutes
const HEIGHT_SCALE_FACTOR = 5; // minutes per pixel
const MAX_CHIP_HEIGHT = 60; // px

/**
 * Default calendar color fallback
 */
const DEFAULT_CALENDAR_COLOR = '#1976d2';

/**
 * Calculate duration in minutes for a workout
 */
const getWorkoutDurationMinutes = (workout: Readonly<Workout>): number => {
  const startMinutes = workout.startHour * 60 + workout.startMinute;
  const endMinutes = workout.endHour * 60 + workout.endMinute;
  return endMinutes - startMinutes;
};

/**
 * Calculate chip height based on duration (minimum 20px, scales with duration)
 */
const getChipHeight = (durationMinutes: number): number => {
  // Base height: 20px for 30min workout
  // Scale: +1px per 5 minutes
  const scaleFactor = Math.max(
    0,
    (durationMinutes - BASE_DURATION) / HEIGHT_SCALE_FACTOR,
  );
  return Math.min(MIN_CHIP_HEIGHT + scaleFactor, MAX_CHIP_HEIGHT); // Max 60px
};

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
  calendars = [],
  isCombinedView = false,
  isEditable = true,
}) => {
  const today = isToday(date);
  const hasWorkouts = workouts.length > 0;

  // Sort workouts by start time for better stacking
  const sortedWorkouts = [...workouts].sort((a, b) => {
    const aStart = a.startHour * 60 + a.startMinute;
    const bStart = b.startHour * 60 + b.startMinute;
    return aStart - bStart;
  });

  // Create calendar color map for efficient lookups
  const calendarColorMap = useMemo(
    () =>
      new Map<string, string>(
        calendars.map(calendar => [calendar.id, calendar.color]),
      ),
    [calendars],
  );

  // Get calendar color for a workout
  const getCalendarColor = (calendarId: string): string =>
    calendarColorMap.get(calendarId) || DEFAULT_CALENDAR_COLOR;

  return (
    <Paper
      onClick={() => isEditable && onDayClick(date)}
      sx={{
        height: '100%',
        p: 1,
        cursor: isEditable ? 'pointer' : 'default',
        backgroundColor: theme =>
          !isCurrentMonth
            ? theme.palette.action.disabledBackground
            : theme.palette.background.paper,
        opacity: isCurrentMonth ? 1 : 0.5,
        border: theme =>
          today
            ? `2px solid ${theme.palette.accent.main}`
            : `1px solid ${theme.palette.divider}`,
        '&:hover': isEditable
          ? {
              backgroundColor: theme => theme.palette.action.hover,
            }
          : {},
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
      }}
      elevation={hasWorkouts ? 2 : 0}
      role="button"
      tabIndex={0}
      aria-label={`${date.toLocaleDateString()}, ${workouts.length} workouts`}
      onKeyDown={e => {
        if (isEditable && (e.key === 'Enter' || e.key === ' ')) {
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
          {sortedWorkouts.slice(0, 3).map(workout => {
            const startTime = `${String(workout.startHour).padStart(2, '0')}:${String(workout.startMinute).padStart(2, '0')}`;
            const duration = getWorkoutDurationMinutes(workout);
            const chipHeight = getChipHeight(duration);

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
                  height: chipHeight,
                  fontSize: '0.7rem',
                  backgroundColor: isCombinedView
                    ? getCalendarColor(workout.calendarId)
                    : theme => theme.palette.primary.main,
                  color: theme =>
                    isCombinedView
                      ? theme.palette.getContrastText(
                          getCalendarColor(workout.calendarId),
                        )
                      : (theme.palette.primary.contrastText as string),
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
                    opacity: 0.8,
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
