import z from 'zod';
import { labels } from '../labels';
import { SalaryPeriod } from '../../features/opportunity/protobuf/opportunity';
import { isNullOrUndefined } from '../func';

const processSalaryValue = (val: unknown) => {
  if (Number.isNaN(val) || isNullOrUndefined(val)) {
    return undefined;
  }

  return val;
};

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
      type: z.coerce.number(labels.form.required).min(1),
    }),
  ),
  meta: z.object({
    employmentType: z.coerce.number().min(1, {
      error: labels.form.required,
    }),
    teamSize: z
      .number(labels.form.required)
      .int()
      .nonnegative()
      .min(1)
      .max(1_000_000),
    salary: z
      .object({
        min: z.preprocess(
          processSalaryValue,
          z.number().int().nonnegative().max(100_000_000).optional(),
        ),
        max: z.preprocess(
          processSalaryValue,
          z.number().int().nonnegative().max(100_000_000).optional(),
        ),
        period: z
          .number()
          .nullish()
          .transform((val) => val ?? undefined)
          .default(SalaryPeriod.UNSPECIFIED),
      })
      .nullish(),
    seniorityLevel: z.number(labels.form.required),
    roleType: z.union(
      [0, 0.5, 1].map((item) =>
        z.literal(item, {
          error: labels.form.required,
        }),
      ),
    ),
  }),
});

export const createOpportunityEditContentSchema = ({
  optional = false,
}: {
  optional?: boolean;
} = {}) => {
  const contentSchema = z.string().max(1440);

  const schema = z.preprocess(
    (val) => {
      return val ?? {};
    },
    z.object({
      content: z.preprocess(
        (val) => val || '',
        optional ? contentSchema : contentSchema.nonempty(labels.form.required),
      ),
    }),
  );

  return schema;
};

export const opportunityEditContentSchema = z.object({
  content: z.object({
    overview: createOpportunityEditContentSchema(),
    responsibilities: createOpportunityEditContentSchema(),
    requirements: createOpportunityEditContentSchema(),
    whatYoullDo: createOpportunityEditContentSchema({ optional: true }),
    interviewProcess: createOpportunityEditContentSchema({ optional: true }),
  }),
});

export const opportunityEditQuestionsSchema = z.object({
  questions: z.array(
    z.object({
      id: z.uuid().optional(),
      title: z.string().nonempty(labels.form.required).max(480),
      placeholder: z.string().max(480).nullable().optional(),
    }),
  ),
});

export const opportunityEditStep1Schema = opportunityEditInfoSchema.extend({
  content: opportunityEditContentSchema.shape.content,
});

export const opportunityEditStep2Schema = opportunityEditQuestionsSchema.extend(
  {
    questions: opportunityEditQuestionsSchema.shape.questions,
  },
);
