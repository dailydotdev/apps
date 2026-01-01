import z from 'zod';

export enum SocialMediaType {
  Facebook = 'facebook',
  X = 'x',
  GitHub = 'github',
  Crunchbase = 'crunchbase',
  LinkedIn = 'linkedin',
  Wellfound = 'wellfound',
  Glassdoor = 'glassdoor',
  Instagram = 'instagram',
  YouTube = 'youtube',
  GitLab = 'gitlab',
  Medium = 'medium',
  DevTo = 'devto',
  StackOverflow = 'stackoverflow',
}

/**
 * Schema for editing organization data by recruiters.
 * Used by the organization edit modal and form.
 */
export const recruiterOrganizationEditSchema = z.object({
  name: z
    .string()
    .nonempty('Company name is required')
    .max(60, 'Company name is too long (max 60 characters)'),
  website: z
    .url('Enter a valid URL (e.g., https://company.com)')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(2000, 'Description is too long (max 2000 characters)')
    .optional(),
  perks: z
    .array(z.string().max(240, 'Each perk must be under 240 characters'))
    .optional(),
  founded: z
    .int('Enter a 4-digit year (e.g., 2015)')
    .min(1900, 'Year must be 1900 or later')
    .max(new Date().getFullYear(), 'Year cannot be in the future')
    .optional(),
  location: z.string().max(240).optional(),
  externalLocationId: z.string().optional(),
  category: z
    .string()
    .max(240, 'Industry is too long (max 240 characters)')
    .optional(),
  size: z.number().optional(),
  stage: z.number().optional(),
  links: z
    .array(
      z.object({
        type: z.enum(['custom', 'social', 'press']),
        socialType: z.string().nullish(),
        title: z
          .string()
          .max(240, 'Label is too long (max 240 characters)')
          .nullish(),
        link: z.string().nonempty('Please enter a URL'),
      }),
    )
    .optional(),
});
