import {
  WorkoutType,
  Workout,
  GymWorkoutDetails,
  LongRunWorkoutDetails,
} from '../../../types/tracker';

export interface AddWorkoutDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    workout: Readonly<{
      startHour: number;
      startMinute: number;
      endHour: number;
      endMinute: number;
      type: WorkoutType;
      gymDetails?: GymWorkoutDetails;
      longRunDetails?: LongRunWorkoutDetails;
    }>,
  ) => void;
  selectedDate: Date | null;
  editingWorkout?: Workout | null;
  existingWorkouts: Workout[];
}
