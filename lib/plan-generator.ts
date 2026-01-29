import { addDays, addWeeks, differenceInCalendarWeeks, formatISO, startOfWeek } from "date-fns";

import type { PlanLevel, PlanSport, TrainingPlanDraft } from "@/types/training";

const PERIODS = ["Base", "Build", "Peak", "Taper"] as const;

function getWeeksUntil(eventDate: Date) {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const diff = differenceInCalendarWeeks(eventDate, start);
  return Math.max(12, Math.min(20, diff));
}

function intensityForWeek(week: number, totalWeeks: number) {
  const taperStart = totalWeeks - 2;
  if (week >= taperStart) return "Easy";
  if (week >= totalWeeks - 5) return "Hard";
  if (week >= 4) return "Moderate";
  return "Easy";
}

function sessionsForLevel(level: PlanLevel) {
  switch (level) {
    case "Beginner":
      return 5;
    case "Intermediate":
      return 7;
    case "Advanced":
      return 9;
    default:
      return 6;
  }
}

const sportRotation: PlanSport[] = ["Swim", "Bike", "Run", "Strength", "Brick"];

export function generateTrainingPlanDraft(
  eventDate: Date,
  level: PlanLevel,
  distanceGoal: string
): TrainingPlanDraft {
  const weekCount = getWeeksUntil(eventDate);
  const sessionsPerWeek = sessionsForLevel(level);
  const weeks = Array.from({ length: weekCount }).map((_, weekIndex) => {
    const startDate = addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), weekIndex);
    const intensity = intensityForWeek(weekIndex, weekCount);
    const period = PERIODS[Math.min(PERIODS.length - 1, Math.floor((weekIndex / weekCount) * 4))];
    const sessions = Array.from({ length: sessionsPerWeek }).map((__, sessionIndex) => {
      const sport = sportRotation[sessionIndex % sportRotation.length];
      const dayOffset = sessionIndex;
      return {
        id: `${weekIndex}-${sessionIndex}`,
        date: formatISO(addDays(startDate, dayOffset), { representation: "date" }),
        sport,
        sessionType: sport === "Brick" ? "Bike + Run" : "Endurance",
        description: `${sport} ${intensity.toLowerCase()} session`,
        durationMin: 45 + weekIndex * 2,
        intensity,
        distanceKm: sport === "Swim" ? 1.5 : sport === "Run" ? 8 : sport === "Bike" ? 30 : undefined,
        notes: period
      };
    });

    return {
      week: weekIndex + 1,
      period,
      startDate: formatISO(startDate, { representation: "date" }),
      sessions
    };
  });

  return {
    name: `${distanceGoal} Plan ${level}`,
    eventDate: formatISO(eventDate, { representation: "date" }),
    level,
    distanceGoal,
    weekCount,
    sessionsPerWeek,
    weeks
  };
}
