import z from 'zod';
import { labels } from '../labels';
import { isNullOrUndefined } from '../func';

const MAX_SALARY = 100_000_000;
const MAX_TEAM_SIZE = 1_000_000;

const processSalaryValue = (val: unknown) => {
  if (Number.isNaN(val) || isNullOrUndefined(val)) {
    return undefined;
  }

  return val;
};

const locationEntrySchema = z.object({
  externalLocationId: z.string().optional(),
  locationType: z.number().optional(),
  locationData: z
    .object({
      id: z.string(),
      city: z.string().nullish(),
      country: z.string(),
      subdivision: z.string().nullish(),
    })
    .nullable()
    .optional(),
});

export type LocationEntry = z.infer<typeof locationEntrySchema>;

export const opportunityEditInfoSchema = z.object({
  title: z.string().nonempty('Add a job title').max(240),
  tldr: z.string().nonempty('Add a short description').max(480),
  keywords: z
    .array(
      z.object({
        keyword: z.string().nonempty(),
      }),
    )
    .min(1, 'Add at least one skill')
    .max(100),
  locations: z.array(locationEntrySchema).optional().default([]),
  meta: z.object({
    employmentType: z.coerce.number().min(1, 'Select an employment type'),
    teamSize: z
      .number({ message: 'Enter the team size' })
      .int()
      .nonnegative()
      .min(1, 'Enter the team size')
      .max(MAX_TEAM_SIZE),
    salary: z
      .object({
        min: z.preprocess(
          processSalaryValue,
          z.number().int().nonnegative().max(MAX_SALARY).optional(),
        ),
        max: z.preprocess(
          processSalaryValue,
          z.number().int().nonnegative().max(MAX_SALARY).optional(),
        ),
        period: z
          .number()
          .nullish()
          .transform((val) => val ?? undefined)
          .default(0),
      })
      .nullish()
      .refine(
        (data) => {
          if (data?.min && data?.max) {
            return data.max >= data.min && data.min >= data.max * 0.75;
          }

          return true;
        },
        {
          message: 'Salary range must be within 25% of maximum salary',
        },
      ),
    seniorityLevel: z.number({ message: 'Select a seniority level' }),
    roleType: z.union(
      [0, 0.5, 1].map((item) =>
        z.literal(item, {
          error: 'Select a role type',
        }),
      ),
    ),
  }),
});

export const createOpportunityEditContentSchema = ({
  optional = false,
  errorLabel = labels.form.required,
}: {
  optional?: boolean;
  errorLabel?: string;
} = {}) => {
  const contentSchema = z.string().max(2000);

  const schema = z.preprocess(
    (val) => {
      return val ?? {};
    },
    z.object({
      content: z.preprocess(
        (val) => val || '',
        optional ? contentSchema : contentSchema.nonempty(errorLabel),
      ),
    }),
  );

  return schema;
};

export const opportunityEditContentSchema = z.object({
  content: z.object({
    overview: createOpportunityEditContentSchema({
      errorLabel: 'Overview is required',
    }),
    responsibilities: createOpportunityEditContentSchema({
      errorLabel: 'Responsibilities are required',
    }),
    requirements: createOpportunityEditContentSchema({
      errorLabel: 'Requirements are required',
    }),
    whatYoullDo: createOpportunityEditContentSchema({ optional: true }),
    interviewProcess: createOpportunityEditContentSchema({ optional: true }),
  }),
});

export const opportunityEditQuestionsSchema = z.object({
  questions: z.array(
    z.object({
      id: z.uuid().optional(),
      title: z.string().nonempty('Add a question title').max(480, {
        error: 'Question title is too long',
      }),
      placeholder: z
        .string()
        .max(480, {
          error: 'Placeholder is too long',
        })
        .nullable()
        .optional(),
    }),
  ),
});

export const opportunityEditStep1Schema = opportunityEditInfoSchema.extend({
  content: opportunityEditContentSchema.shape.content,
  organization: z.object(
    {
      name: z.string().nonempty('Add a company name'),
    },
    {
      error: 'Add a company name',
    },
  ),
});

export const opportunityEditStep2Schema = opportunityEditQuestionsSchema.extend(
  {
    questions: opportunityEditQuestionsSchema.shape.questions,
  },
);

// TypeScript types for GraphQL inputs
export interface LocationInput {
  country?: string;
  city?: string;
  subdivision?: string;
  type?: number;
  externalLocationId?: string;
}

export interface SalaryInput {
  min?: number;
  max?: number;
  period?: number;
  currency?: string;
}

export interface OpportunityMetaInput {
  salary?: SalaryInput;
  employmentType?: number;
  teamSize?: number;
  seniorityLevel?: number;
  roleType?: number;
}

export interface OpportunityContentInput {
  overview?: string;
  responsibilities?: string;
  requirements?: string;
  whatYoullDo?: string;
  interviewProcess?: string;
}

export const maxRecruiterSeats = 50;

export const addOpportunitySeatsSchema = z.object({
  seats: z
    .array(
      z.object({
        priceId: z.string().nonempty('Select a price option'),
        quantity: z
          .number()
          .nonnegative()
          .min(1, 'Enter the number of seats')
          .max(maxRecruiterSeats, {
            error: `You can add up to ${maxRecruiterSeats} seats at a time`,
          }),
      }),
      {
        error: 'At least one seat is required',
      },
    )
    .min(1, {
      error: 'At least one seat is required',
    })
    // number of pricing ids that can be in cart, just arbitrarily limit to 10
    .max(10, {
      error: 'You can add up to 10 different price options at a time',
    }),
});
