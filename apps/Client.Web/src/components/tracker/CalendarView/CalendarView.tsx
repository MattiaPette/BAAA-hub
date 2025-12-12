import { FC, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { Trans } from '@lingui/react/macro';

import { CalendarDay } from '../CalendarDay/CalendarDay';
import { CalendarViewProps } from './CalendarView.model';

/**
 * CalendarView component displays the monthly calendar grid
 * Uses date-fns (MIT licensed) for date calculations
 */
export const CalendarView: FC<CalendarViewProps> = ({
  currentMonth,
  workouts,
  onDayClick,
  onWorkoutClick,
  calendars = [],
  isCombinedView = false,
  isEditable = true,
}) => {
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const weekDays = [
    <Trans key="mon">Mon</Trans>,
    <Trans key="tue">Tue</Trans>,
    <Trans key="wed">Wed</Trans>,
    <Trans key="thu">Thu</Trans>,
    <Trans key="fri">Fri</Trans>,
    <Trans key="sat">Sat</Trans>,
    <Trans key="sun">Sun</Trans>,
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Week day headers */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 1,
          mb: 1,
        }}
      >
        {weekDays.map((day, index) => (
          <Box key={index}>
            <Typography
              variant="subtitle2"
              sx={{
                textAlign: 'center',
                fontWeight: 'bold',
                color: theme => theme.palette.text.secondary,
              }}
            >
              {day}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Calendar days grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gridTemplateRows: `repeat(${Math.ceil(days.length / 7)}, 1fr)`,
          gap: 1,
          width: '100%',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {days.map(day => {
          const dayWorkouts = workouts.filter(workout =>
            isSameDay(workout.date, day),
          );
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <CalendarDay
              key={day.toISOString()}
              date={day}
              isCurrentMonth={isCurrentMonth}
              workouts={dayWorkouts}
              onDayClick={onDayClick}
              onWorkoutClick={onWorkoutClick}
              calendars={calendars}
              isCombinedView={isCombinedView}
              isEditable={isEditable}
            />
          );
        })}
      </Box>
    </Box>
  );
};
