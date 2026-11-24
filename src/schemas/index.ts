import z from "zod/v4";

import { WeekDay } from "../generated/prisma/enums.js";

export const ErrorSchema = z.object({
    error: z.string(),
    code: z.string(),
});

export const WorkoutExerciseSchema = z.object({
  name: z.string().trim().min(1),
  order: z.number().min(0),
  sets: z.number().min(1),
  reps: z.number().min(1),
  restTimeInSeconds: z.number().min(1),
});

export const WorkoutDaySchema = z.object({
  name: z.string().trim().min(1),
  weekDay: z.enum(WeekDay),
  isRest: z.boolean().default(false),
  estimatedDurationInSeconds: z.number().min(1),
  coverImageUrl: z.string().url().optional(),
  exercises: z.array(WorkoutExerciseSchema),
});

export const WorkoutPlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  workoutDays: z.array(WorkoutDaySchema),
});

export const WorkoutPlanParamsSchema = z.object({
  workoutPlanId: z.uuid(),
});

export const WorkoutDayParamsSchema = WorkoutPlanParamsSchema.extend({
  workoutDayId: z.uuid(),
});

export const WorkoutSessionParamsSchema = WorkoutDayParamsSchema.extend({
  sessionId: z.uuid(),
});

export const WorkoutSessionResponseSchema = z.object({
  id: z.string().uuid(),
});

export const UpdateWorkoutSessionSchema = z.object({
  completedAt: z.iso.datetime(),
});

export const UpdateWorkoutSessionResponseSchema = z.object({
  id: z.uuid(),
  startedAt: z.iso.datetime(),
  completedAt: z.iso.datetime(),
});

export const ListWorkoutPlansQuerySchema = z.object({
  active: z.stringbool().optional(),
});

export const ListWorkoutPlansResponseSchema = z.array(
  z.object({
    id: z.uuid(),
    name: z.string(),
    isActive: z.boolean(),
    workoutDays: z.array(
      z.object({
        id: z.uuid(),
        name: z.string(),
        weekDay: z.enum(WeekDay),
        isRest: z.boolean(),
        estimatedDurationInSeconds: z.number(),
        coverImageUrl: z.url().optional(),
        exercises: z.array(
          z.object({
            id: z.uuid(),
            order: z.number(),
            name: z.string(),
            sets: z.number(),
            reps: z.number(),
            restTimeInSeconds: z.number(),
          }),
        ),
      }),
    ),
  }),
);

export const GetWorkoutPlanResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  workoutDays: z.array(
    z.object({
      id: z.uuid(),
      weekDay: z.enum(WeekDay),
      name: z.string(),
      isRest: z.boolean(),
      coverImageUrl: z.url().optional(),
      estimatedDurationInSeconds: z.number(),
      exercisesCount: z.number(),
    }),
  ),
});

export const GetWorkoutDayResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  isRest: z.boolean(),
  coverImageUrl: z.url().optional(),
  estimatedDurationInSeconds: z.number(),
  weekDay: z.enum(WeekDay),
  exercises: z.array(
    z.object({
      id: z.uuid(),
      name: z.string(),
      order: z.number(),
      workoutDayId: z.uuid(),
      sets: z.number(),
      reps: z.number(),
      restTimeInSeconds: z.number(),
    }),
  ),
  sessions: z.array(
    z.object({
      id: z.uuid(),
      workoutDayId: z.uuid(),
      startedAt: z.iso.date(),
      completedAt: z.iso.date().optional(),
    }),
  ),
});

const ConsistencyByDaySchema = z.record(
  z.iso.date(),
  z.object({
    workoutDayCompleted: z.boolean(),
    workoutDayStarted: z.boolean(),
  }),
);

export const HomeParamsSchema = z.object({
  date: z.iso.date(),
});

export const HomeDataResponseSchema = z.object({
  activeWorkoutPlanId: z.uuid().optional(),
  todayWorkoutDay: z
    .object({
      workoutPlanId: z.uuid(),
      id: z.uuid(),
      name: z.string(),
      isRest: z.boolean(),
      weekDay: z.enum(WeekDay),
      estimatedDurationInSeconds: z.number(),
      coverImageUrl: z.url().optional(),
      exercisesCount: z.number(),
    })
    .optional(),
  workoutStreak: z.number(),
  consistencyByDay: ConsistencyByDaySchema,
});

export const StatsQuerySchema = z
  .object({
    from: z.iso.date(),
    to: z.iso.date(),
  })
  .refine((query) => query.from <= query.to, {
    message: "`from` must be before or equal to `to`",
    path: ["from"],
  });

export const UpsertUserTrainDataSchema = z.object({
  weightInGrams: z.int().positive(),
  heightInCentimeters: z.int().positive(),
  age: z.int().positive(),
  bodyFatPercentage: z.number().min(0).max(1),
});

export const UpsertUserTrainDataResponseSchema =
  UpsertUserTrainDataSchema.extend({
    userId: z.string(),
  });

export const UserTrainDataResponseSchema = z
  .object({
    userId: z.string(),
    userName: z.string(),
    weightInGrams: z.number(),
    heightInCentimeters: z.number(),
    age: z.number(),
    bodyFatPercentage: z.number(),
  })
  .nullable();

export const StatsResponseSchema = z.object({
  workoutStreak: z.number(),
  consistencyByDay: ConsistencyByDaySchema,
  completedWorkoutsCount: z.number(),
  conclusionRate: z.number(),
  totalTimeInSeconds: z.number(),
});
