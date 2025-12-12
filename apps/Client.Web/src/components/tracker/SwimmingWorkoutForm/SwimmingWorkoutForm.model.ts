import { SwimmingWorkoutDetails } from '../../../types/tracker';

export interface SwimmingWorkoutFormProps {
  value?: SwimmingWorkoutDetails;
  onChange: (details: Readonly<SwimmingWorkoutDetails>) => void;
}
