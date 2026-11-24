import dayjs from "dayjs";

import { prisma } from "../lib/db.js";
import {
  calculateWorkoutStreak,
  DayConsistency,
  formatDay,
  groupSessionsByDay,
  WEEK_DAYS,
} from "./helpers/workout-consistency.js";

interface InputDto {
  userId: string;
  from: string;
  to: string;
}

interface OutputDto {
  workoutStreak: number;
  consistencyByDay: Record<string, DayConsistency>;
  completedWorkoutsCount: number;
  conclusionRate: number;
  totalTimeInSeconds: number;
}

export class GetStats {
  async execute(dto: InputDto): Promise<OutputDto> {
    const from = dayjs.utc(dto.from).startOf("day");
    const to = dayjs.utc(dto.to).endOf("day");

    const sessions = await prisma.workoutSession.findMany({
      where: {
        workoutDay: { workoutPlan: { userId: dto.userId } },
        startedAt: { gte: from.toDate(), lte: to.toDate() },
      },
    });

    const activeWorkoutPlan = await prisma.workoutPlan.findFirst({
      where: { userId: dto.userId, isActive: true },
      select: { workoutDays: { select: { weekDay: true } } },
    });

    const completedSessions = sessions.filter(
      (session): session is typeof session & { completedAt: Date } =>
        session.completedAt !== null,
    );

    // Dias futuros ainda não podem ter sido concluídos, então não quebram a sequência
    const today = dayjs.utc();
    const streakReferenceDate = to.isAfter(today) ? today : to;

    // Sem plano ativo, todo dia da semana conta para a sequência
    const planWeekDays = new Set(
      activeWorkoutPlan
        ? activeWorkoutPlan.workoutDays.map((day) => day.weekDay)
        : WEEK_DAYS,
    );

    return {
      workoutStreak: calculateWorkoutStreak({
        completedDays: new Set(
          completedSessions.map((session) => formatDay(session.startedAt)),
        ),
        planWeekDays,
        referenceDate: streakReferenceDate,
      }),
      consistencyByDay: groupSessionsByDay(sessions),
      completedWorkoutsCount: completedSessions.length,
      conclusionRate:
        sessions.length === 0 ? 0 : completedSessions.length / sessions.length,
      totalTimeInSeconds: completedSessions.reduce(
        (total, session) =>
          total + dayjs(session.completedAt).diff(session.startedAt, "second"),
        0,
      ),
    };
  }
}
