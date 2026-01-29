export type PlanLevel = "Beginner" | "Intermediate" | "Advanced";
export type PlanSport = "Swim" | "Bike" | "Run" | "Strength" | "Brick";

export type PlannedSessionDraft = {
  id: string;
  date: string;
  sport: PlanSport;
  sessionType: string;
  description: string;
  durationMin: number;
  intensity: string;
  distanceKm?: number;
  notes?: string;
};

export type TrainingPlanWeekDraft = {
  week: number;
  period: string;
  startDate: string;
  sessions: PlannedSessionDraft[];
};

export type TrainingPlanDraft = {
  name: string;
  eventDate: string;
  level: PlanLevel;
  distanceGoal: string;
  weekCount: number;
  sessionsPerWeek: number;
  weeks: TrainingPlanWeekDraft[];
};
