import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc.js";

import { WeekDay } from "../../generated/prisma/enums.js";

dayjs.extend(utc);

// Índice segue dayjs().day(): 0 = domingo
export const WEEK_DAYS: WeekDay[] = [
  WeekDay.SUNDAY,
  WeekDay.MONDAY,
  WeekDay.TUESDAY,
  WeekDay.WEDNESDAY,
  WeekDay.THURSDAY,
  WeekDay.FRIDAY,
  WeekDay.SATURDAY,
];

export interface DayConsistency {
  workoutDayCompleted: boolean;
  workoutDayStarted: boolean;
}

interface SessionDates {
  startedAt: Date;
  completedAt: Date | null;
}

interface CalculateWorkoutStreakInput {
  completedDays: Set<string>;
  planWeekDays: Set<WeekDay>;
  referenceDate: Dayjs;
}

export const getWeekDay = (date: Dayjs): WeekDay => WEEK_DAYS[date.day()];

export const formatDay = (date: Date | Dayjs): string =>
  dayjs.utc(date).format("YYYY-MM-DD");

export const groupSessionsByDay = (
  sessions: SessionDates[],
): Record<string, DayConsistency> =>
  sessions.reduce<Record<string, DayConsistency>>((acc, session) => {
    const key = formatDay(session.startedAt);
    const current = acc[key];
    acc[key] = {
      workoutDayStarted: true,
      workoutDayCompleted:
        (current?.workoutDayCompleted ?? false) || session.completedAt !== null,
    };
    return acc;
  }, {});

// Conta, a partir da data de referência para trás, os dias seguidos com sessão
// concluída. Dias fora do plano não quebram a sequência; dias do plano
// (inclusive descanso) sem conclusão quebram. A própria data de referência
// ainda pode ser concluída, então não quebra a sequência.
export const calculateWorkoutStreak = ({
  completedDays,
  planWeekDays,
  referenceDate,
}: CalculateWorkoutStreakInput): number => {
  if (completedDays.size === 0) {
    return 0;
  }
  const earliestDay = [...completedDays].sort()[0];
  let day = referenceDate.startOf("day");
  if (!completedDays.has(formatDay(day))) {
    day = day.subtract(1, "day");
  }
  let streak = 0;
  while (formatDay(day) >= earliestDay) {
    if (completedDays.has(formatDay(day))) {
      streak++;
    } else if (planWeekDays.has(getWeekDay(day))) {
      break;
    }
    day = day.subtract(1, "day");
  }
  return streak;
};
