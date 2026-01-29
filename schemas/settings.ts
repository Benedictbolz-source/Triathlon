import { z } from "zod";

export const settingsSchema = z.object({
  units: z.enum(["Metric"]),
  rpeDefault: z.number().min(1).max(10),
  hrZones: z
    .array(
      z.object({
        name: z.string(),
        min: z.number().min(0),
        max: z.number().min(0)
      })
    )
    .optional()
});

export type SettingsInput = z.infer<typeof settingsSchema>;
