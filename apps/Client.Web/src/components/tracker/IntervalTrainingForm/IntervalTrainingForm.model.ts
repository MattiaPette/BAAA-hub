import { IntervalWorkoutDetails } from '../../../types/tracker';

export interface IntervalTrainingFormProps {
  value: IntervalWorkoutDetails | undefined;
  onChange: (details: Readonly<IntervalWorkoutDetails>) => void;
}
