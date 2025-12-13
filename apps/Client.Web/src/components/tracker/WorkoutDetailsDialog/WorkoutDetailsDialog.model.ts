import { Workout } from '../../../types/tracker';

export interface WorkoutDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  workout: Workout | null;
  onEdit: (workout: Readonly<Workout>) => void;
  onDelete: (workoutId: string) => void;
  isEditable?: boolean;
}
