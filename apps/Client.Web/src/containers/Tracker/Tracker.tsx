import { FC, useState, useMemo, useEffect } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { addMonths, subMonths } from 'date-fns';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';

import { useBreadcrum } from '../../providers/BreadcrumProvider/BreadcrumProvider';
import { CalendarHeader } from '../../components/tracker/CalendarHeader/CalendarHeader';
import { CalendarView } from '../../components/tracker/CalendarView/CalendarView';
import { AgendaView } from '../../components/tracker/AgendaView/AgendaView';
import { CalendarLegend } from '../../components/tracker/CalendarLegend/CalendarLegend';
import { AddWorkoutDialog } from '../../components/tracker/AddWorkoutDialog/AddWorkoutDialog';
import { WorkoutDetailsDialog } from '../../components/tracker/WorkoutDetailsDialog/WorkoutDetailsDialog';
import {
  mockCalendars,
  mockWorkouts as initialMockWorkouts,
} from '../../data/mockTrackerData';
import { WorkoutType, Workout } from '../../types/tracker';

/**
 * Tracker container component
 * Displays a monthly calendar view for tracking workouts
 * Uses mocked data with working add/edit/delete functionality
 *
 * NOTE: This component uses date-fns (MIT licensed) for date manipulation
 * https://github.com/date-fns/date-fns/blob/main/LICENSE.md
 */
export const Tracker: FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { setTitle } = useBreadcrum();
  const { i18n } = useLingui();

  // Set breadcrumb title
  useEffect(() => {
    setTitle(t`Tracker`);
  }, [setTitle, i18n.locale]);

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>(
    mockCalendars[0].id,
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [workouts, setWorkouts] = useState<Workout[]>(initialMockWorkouts);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] =
    useState<boolean>(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [isCombinedView, setIsCombinedView] = useState<boolean>(false);
  const [enabledCalendarIds, setEnabledCalendarIds] = useState<Set<string>>(
    new Set(mockCalendars.map(c => c.id)),
  );

  // Filter workouts by selected calendar or enabled calendars in combined view
  const filteredWorkouts = useMemo(
    () =>
      workouts.filter(workout =>
        isCombinedView
          ? enabledCalendarIds.has(workout.calendarId)
          : workout.calendarId === selectedCalendarId,
      ),
    [workouts, selectedCalendarId, isCombinedView, enabledCalendarIds],
  );

  const handleToggleCombinedView = () => {
    setIsCombinedView(prev => !prev);
  };

  const handleToggleCalendar = (calendarId: string) => {
    setEnabledCalendarIds(prev => {
      if (prev.has(calendarId)) {
        // Create new set without the calendar
        const filtered = Array.from(prev).filter(id => id !== calendarId);
        return new Set(filtered);
      }
      // Create new set with the calendar added
      return new Set([...prev, calendarId]);
    });
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setEditingWorkout(null);
    setIsDialogOpen(true);
  };

  const handleWorkoutClick = (workout: Readonly<Workout>) => {
    setSelectedWorkout(workout);
    setIsDetailsDialogOpen(true);
  };

  const handleAddWorkout = (
    newWorkoutData: Readonly<{
      startHour: number;
      startMinute: number;
      endHour: number;
      endMinute: number;
      type: WorkoutType;
      gymDetails?: import('../../types/tracker').GymWorkoutDetails;
      intervalDetails?: import('../../types/tracker').IntervalWorkoutDetails;
    }>,
  ) => {
    if (!selectedDate) return;

    if (editingWorkout) {
      // Update existing workout
      setWorkouts(prev =>
        prev.map(w =>
          w.id === editingWorkout.id
            ? {
                ...w,
                startHour: newWorkoutData.startHour,
                startMinute: newWorkoutData.startMinute,
                endHour: newWorkoutData.endHour,
                endMinute: newWorkoutData.endMinute,
                type: newWorkoutData.type,
                gymDetails: newWorkoutData.gymDetails,
                intervalDetails: newWorkoutData.intervalDetails,
              }
            : w,
        ),
      );
    } else {
      // Add new workout
      const newWorkout: Workout = {
        id: `workout-${Date.now()}`,
        date: selectedDate,
        startHour: newWorkoutData.startHour,
        startMinute: newWorkoutData.startMinute,
        endHour: newWorkoutData.endHour,
        endMinute: newWorkoutData.endMinute,
        type: newWorkoutData.type,
        calendarId: selectedCalendarId,
        gymDetails: newWorkoutData.gymDetails,
        intervalDetails: newWorkoutData.intervalDetails,
      };
      setWorkouts(prev => [...prev, newWorkout]);
    }
  };

  const handleEditWorkout = (workout: Readonly<Workout>) => {
    setSelectedDate(workout.date);
    setEditingWorkout(workout);
    setIsDialogOpen(true);
  };

  const handleDeleteWorkout = (workoutId: string) => {
    setWorkouts(prev => prev.filter(w => w.id !== workoutId));
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        p: { xs: 2, md: 3 },
      }}
    >
      {/* Main calendar area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <CalendarHeader
          currentMonth={currentMonth}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          calendars={mockCalendars}
          selectedCalendarId={selectedCalendarId}
          onCalendarSelect={setSelectedCalendarId}
          isCombinedView={isCombinedView}
          onToggleCombinedView={handleToggleCombinedView}
        />

        {/* Calendar legend for combined view */}
        {isCombinedView && (
          <CalendarLegend
            calendars={mockCalendars}
            enabledCalendarIds={enabledCalendarIds}
            onToggleCalendar={handleToggleCalendar}
          />
        )}

        {/* Conditionally render CalendarView or AgendaView based on viewport */}
        {isMobile ? (
          <AgendaView
            currentMonth={currentMonth}
            workouts={filteredWorkouts}
            onDayClick={handleDayClick}
            onWorkoutClick={handleWorkoutClick}
          />
        ) : (
          <CalendarView
            currentMonth={currentMonth}
            workouts={filteredWorkouts}
            onDayClick={handleDayClick}
            onWorkoutClick={handleWorkoutClick}
            calendars={mockCalendars}
            isCombinedView={isCombinedView}
          />
        )}
      </Box>

      {/* Add/Edit Workout Dialog */}
      <AddWorkoutDialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingWorkout(null);
        }}
        onSubmit={handleAddWorkout}
        selectedDate={selectedDate}
        editingWorkout={editingWorkout}
        existingWorkouts={workouts}
      />

      {/* Workout Details Dialog */}
      <WorkoutDetailsDialog
        open={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        workout={selectedWorkout}
        onEdit={handleEditWorkout}
        onDelete={handleDeleteWorkout}
      />
    </Box>
  );
};
