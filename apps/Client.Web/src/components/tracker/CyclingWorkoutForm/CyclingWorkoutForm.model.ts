import { CyclingWorkoutDetails } from '../../../types/tracker';

export interface CyclingWorkoutFormProps {
  value: CyclingWorkoutDetails | undefined;
  onChange: (details: Readonly<CyclingWorkoutDetails>) => void;
}
