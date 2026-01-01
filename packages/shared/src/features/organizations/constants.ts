/**
 * Company size options for organization forms
 * Index + 1 is used as the stored value
 */
export const companySizeOptions = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1,000',
  '1,001-5,000',
  '5,000+',
] as const;

/**
 * Company funding stage options for organization forms
 * Index + 1 is used as the stored value
 */
export const companyStageOptions = [
  'Pre-seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C',
  'Series D',
  'Public',
  'Bootstrapped',
  'Non-profit',
  'Government',
] as const;

export type CompanySize = (typeof companySizeOptions)[number];
export type CompanyStage = (typeof companyStageOptions)[number];
