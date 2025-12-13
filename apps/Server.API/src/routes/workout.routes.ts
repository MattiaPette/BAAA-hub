import Router from '@koa/router';
import { authMiddleware, AuthContext } from '../middleware/auth.js';
import {
  createWorkout,
  getWorkouts,
  getWorkout,
  updateWorkout,
  deleteWorkout,
} from '../controllers/workout.controller.js';

const workoutRouter = new Router({ prefix: '/api/workouts' });

// All workout routes require authentication
workoutRouter.post('/', authMiddleware, async ctx => {
  await createWorkout(ctx as AuthContext);
});

workoutRouter.get('/', authMiddleware, async ctx => {
  await getWorkouts(ctx as AuthContext);
});

workoutRouter.get('/:workoutId', authMiddleware, async ctx => {
  await getWorkout(ctx as AuthContext);
});

workoutRouter.patch('/:workoutId', authMiddleware, async ctx => {
  await updateWorkout(ctx as AuthContext);
});

workoutRouter.delete('/:workoutId', authMiddleware, async ctx => {
  await deleteWorkout(ctx as AuthContext);
});

export { workoutRouter };
