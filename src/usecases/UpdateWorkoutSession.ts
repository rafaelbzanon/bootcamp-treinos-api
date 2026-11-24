import dayjs from "dayjs";

import { InvalidSessionCompletionError, NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
  sessionId: string;
  completedAt: string;
}

interface OutputDto {
  id: string;
  startedAt: string;
  completedAt: string;
}

export class UpdateWorkoutSession {
  async execute(dto: InputDto): Promise<OutputDto> {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: dto.workoutPlanId },
    });

    if (!workoutPlan || workoutPlan.userId !== dto.userId) {
      throw new NotFoundError("Workout plan not found");
    }

    const session = await prisma.workoutSession.findUnique({
      where: { id: dto.sessionId },
      include: { workoutDay: true },
    });

    if (
      !session ||
      session.workoutDayId !== dto.workoutDayId ||
      session.workoutDay.workoutPlanId !== dto.workoutPlanId
    ) {
      throw new NotFoundError("Workout session not found");
    }

    const completedAt = dayjs(dto.completedAt).toDate();

    if (dayjs(completedAt).isBefore(session.startedAt)) {
      throw new InvalidSessionCompletionError(
        "Workout session cannot be completed before it was started",
      );
    }

    const updatedSession = await prisma.workoutSession.update({
      where: { id: session.id },
      data: { completedAt },
    });

    return {
      id: updatedSession.id,
      startedAt: updatedSession.startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
    };
  }
}
