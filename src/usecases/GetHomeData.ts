import dayjs from "dayjs";

import { NotFoundError } from "../errors/index.js";
import { WeekDay } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";
import {
  calculateWorkoutStreak,
  DayConsistency,
  formatDay,
  getWeekDay,
  groupSessionsByDay,
} from "./helpers/workout-consistency.js";

interface InputDto {
  userId: string;
  date: string;
}

interface OutputDto {
  activeWorkoutPlanId: string;
  todayWorkoutDay?: {
    workoutPlanId: string;
    id: string;
    name: string;
    isRest: boolean;
    weekDay: WeekDay;
    estimatedDurationInSeconds: number;
    coverImageUrl?: string;
    exercisesCount: number;
  };
  workoutStreak: number;
  consistencyByDay: Record<string, DayConsistency>;
}

export class GetHomeData {
  async execute(dto: InputDto): Promise<OutputDto> {
    const date = dayjs.utc(dto.date);
    const weekStart = date.startOf("week");
    const weekEnd = date.endOf("week");

    const activeWorkoutPlan = await prisma.workoutPlan.findFirst({
      where: { userId: dto.userId, isActive: true },
      include: {
        workoutDays: {
          include: { _count: { select: { exercises: true } } },
        },
      },
    });

    if (!activeWorkoutPlan) {
      throw new NotFoundError("Active workout plan not found");
    }

    const userSessionsFilter = {
      workoutDay: { workoutPlan: { userId: dto.userId } },
    };

    const weekSessions = await prisma.workoutSession.findMany({
      where: {
        ...userSessionsFilter,
        startedAt: { gte: weekStart.toDate(), lte: weekEnd.toDate() },
      },
    });

    const completedSessions = await prisma.workoutSession.findMany({
      where: {
        ...userSessionsFilter,
        completedAt: { not: null },
        startedAt: { lte: date.endOf("day").toDate() },
      },
      select: { startedAt: true },
    });

    const sessionsByDay = groupSessionsByDay(weekSessions);
    const consistencyByDay = Object.fromEntries(
      Array.from({ length: 7 }, (_, index) => {
        const key = formatDay(weekStart.add(index, "day"));
        return [
          key,
          sessionsByDay[key] ?? {
            workoutDayCompleted: false,
            workoutDayStarted: false,
          },
        ];
      }),
    );

    const todayWorkoutDay = activeWorkoutPlan.workoutDays.find(
      (day) => day.weekDay === getWeekDay(date),
    );

    return {
      activeWorkoutPlanId: activeWorkoutPlan.id,
      todayWorkoutDay: todayWorkoutDay && {
        workoutPlanId: todayWorkoutDay.workoutPlanId,
        id: todayWorkoutDay.id,
        name: todayWorkoutDay.name,
        isRest: todayWorkoutDay.isRest,
        weekDay: todayWorkoutDay.weekDay,
        estimatedDurationInSeconds: todayWorkoutDay.estimatedDurationInSeconds,
        coverImageUrl: todayWorkoutDay.coverImageUrl ?? undefined,
        exercisesCount: todayWorkoutDay._count.exercises,
      },
      workoutStreak: calculateWorkoutStreak({
        completedDays: new Set(
          completedSessions.map((session) => formatDay(session.startedAt)),
        ),
        planWeekDays: new Set(
          activeWorkoutPlan.workoutDays.map((day) => day.weekDay),
        ),
        referenceDate: date,
      }),
      consistencyByDay,
    };
  }
}
