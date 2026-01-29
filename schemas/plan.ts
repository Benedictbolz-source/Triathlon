import { z } from "zod";

export const planWizardSchema = z.object({
  distanceGoal: z.enum(["Sprint", "Olympic", "70.3", "Ironman"]),
  eventDate: z.string().min(1),
  level: z.enum(["Beginner", "Intermediate", "Advanced"])
});

export type PlanWizardInput = z.infer<typeof planWizardSchema>;
