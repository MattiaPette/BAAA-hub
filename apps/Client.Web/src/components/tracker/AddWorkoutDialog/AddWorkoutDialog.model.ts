import {
  WorkoutType,
  Workout,
  GymWorkoutDetails,
  CyclingWorkoutDetails,
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
      cyclingDetails?: CyclingWorkoutDetails;
    }>,
  ) => void;
  selectedDate: Date | null;
  editingWorkout?: Workout | null;
  existingWorkouts: Workout[];
}
