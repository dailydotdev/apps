import z from 'zod';
import { labels } from '../labels';

export const opportunityEditSchema = z.object({
  title: z.string().nonempty(labels.form.required).max(240),
  tldr: z.string().nonempty(labels.form.required).max(480),
  keywords: z
    .array(
      z.object({
        keyword: z.string().nonempty(),
      }),
    )
    .min(1, labels.form.required)
    .max(100),
  country: z.string().nonempty(labels.form.required).max(240),
  city: z.string().nonempty(labels.form.required).max(240),
  subdivision: z.string().nonempty(labels.form.required).max(240),
  roleLocation: z.coerce.number().min(1),
  employmentType: z.coerce.number().min(1),
  teamSize: z.number().int().nonnegative().min(1).max(1_000_000),
  salaryMin: z.number().int().nonnegative().max(100_000_000),
  salaryMax: z.number().int().nonnegative().max(100_000_000),
  salaryPeriod: z.number(),
  seniorityLevel: z.number(),
  roleType: z.union([z.literal(0), z.literal(0.5), z.literal(1)]),
});
