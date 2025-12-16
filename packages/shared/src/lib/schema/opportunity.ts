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
  externalLocationId: z.string().optional(),
  locationType: z.number().optional(),
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
  const contentSchema = z.string().max(2000);

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
  organization: z.object({
    name: z.string().nonempty().max(60),
  }),
});

export const opportunityEditStep2Schema = opportunityEditQuestionsSchema.extend(
  {
    questions: opportunityEditQuestionsSchema.shape.questions,
  },
);

export enum OrganizationLinkType {
  Custom = 'custom',
  Social = 'social',
  Press = 'press',
}

export enum SocialMediaType {
  Facebook = 'facebook',
  X = 'x',
  GitHub = 'github',
  Crunchbase = 'crunchbase',
  LinkedIn = 'linkedin',
}

export const opportunityEditOrganizationSchema = z.object({
  organization: z.object({
    website: z.string().url().optional().or(z.literal('')),
    description: z.string().max(2000).optional(),
    perks: z.array(z.string().max(240)).optional(),
    founded: z
      .number()
      .int()
      .min(1800)
      .max(new Date().getFullYear())
      .optional(),
    location: z.string().max(240).optional(),
    category: z.string().max(240).optional(),
    size: z.number().optional(),
    stage: z.number().optional(),
    links: z
      .array(
        z.object({
          type: z.enum(['custom', 'social', 'press']),
          socialType: z.string().nullish(),
          title: z.string().max(240).nullish(),
          link: z.string(),
        }),
      )
      .optional(),
  }),
});

export const opportunityCreateOrganizationSchema =
  opportunityEditOrganizationSchema.extend({
    organization: opportunityEditOrganizationSchema.shape.organization.extend({
      name: z.string().nonempty().max(60),
    }),
  });

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

export interface OpportunityPreviewInput {
  title: string;
  tldr: string;
  content?: OpportunityContentInput;
  meta?: OpportunityMetaInput;
  location?: LocationInput[];
  state?: number;
  type?: number;
  keywords?: string[];
}
