import z from 'zod';
import { labels } from '../labels';

export const opportunityEditInfoSchema = z.object({
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
  location: z.array(
    z.object({
      country: z.string().nonempty(labels.form.required).max(240),
      city: z.string().nonempty(labels.form.required).max(240).optional(),
      subdivision: z
        .string()
        .nonempty(labels.form.required)
        .max(240)
        .optional(),
      type: z.coerce.number().min(1),
    }),
  ),
  meta: z.object({
    employmentType: z.coerce.number().min(1),
    teamSize: z.number().int().nonnegative().min(1).max(1_000_000),
    salary: z.object({
      min: z.number().int().nonnegative().max(100_000_000),
      max: z.number().int().nonnegative().max(100_000_000),
      period: z.number(),
    }),
    seniorityLevel: z.number(),
    roleType: z.union([z.literal(0), z.literal(0.5), z.literal(1)]),
  }),
});

export const opportunityContentSchema = z.string().max(1440);

export const opportunityEditContentSchema = z.object({
  content: z
    .object({
      overview: opportunityContentSchema,
      responsibilities: opportunityContentSchema,
      requirements: opportunityContentSchema,
      whatYoullDo: opportunityContentSchema,
      interviewProcess: opportunityContentSchema,
    })
    .partial(),
});

export const opportunityEditQuestionsSchema = z.object({
  questions: z.array(
    z.object({
      id: z.uuid().optional(),
      title: z.string().nonempty(labels.form.required).max(240),
      placeholder: z.string().max(480).nullable().optional(),
    }),
  ),
});
