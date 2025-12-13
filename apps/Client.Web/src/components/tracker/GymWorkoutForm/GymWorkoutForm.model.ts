import { GymWorkoutDetails } from '../../../types/tracker';

export interface GymWorkoutFormProps {
  value: GymWorkoutDetails | undefined;
  onChange: (details: Readonly<GymWorkoutDetails>) => void;
}
