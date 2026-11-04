// daily.dev for Startups plans, mirrored from the API
// (`common/schema/squadSubscription.ts`): seats and cashback per plan.
export enum SquadPlan {
  Starter = 'starter',
  Team = 'team',
}

export const squadPlans = [SquadPlan.Starter, SquadPlan.Team];

export const isSquadPlan = (value: unknown): value is SquadPlan =>
  squadPlans.includes(value as SquadPlan);

export const SQUAD_PLAN_SEATS: Record<SquadPlan, number> = {
  [SquadPlan.Starter]: 1,
  [SquadPlan.Team]: 5,
};

export const SQUAD_PLAN_CASHBACK_PERCENTAGE: Record<SquadPlan, number> = {
  [SquadPlan.Starter]: 100,
  [SquadPlan.Team]: 200,
};

// The live Paddle prices of the daily.dev for Startups product, one per plan.
// No Paddle sandbox is wired to any environment, so there is no sandbox copy.
const squadPlanPriceIds: Record<SquadPlan, string> = {
  [SquadPlan.Starter]: 'pri_01m6jyq2cr5w4dftg464y4b3me',
  [SquadPlan.Team]: 'pri_01m6jyrj7bt74x5h7dr5bec2jt',
};

export const getSquadPlanPriceId = (plan: SquadPlan): string =>
  squadPlanPriceIds[plan];

// Copy mirrors the plan table on daily.dev/startups/ (recruiter-landing
// `StartupPlanTable.astro`); change both together.
export interface SquadPlanDetails {
  title: string;
  tagline: string;
  /** The line above the features: what you get, or what the plan adds. */
  featuresTitle: string;
  features: string[];
}

export const squadPlanDetails: Record<SquadPlan, SquadPlanDetails> = {
  [SquadPlan.Starter]: {
    title: 'Starter',
    tagline: 'For founders finding their first users.',
    featuresTitle: 'What you get:',
    features: [
      'Company page with a link to your site',
      'In the feed and search, cited by AI answers',
      'Weekly brief on up to 5 topics',
      'Skills for Claude Code and any agent',
      'API, so your agent posts and boosts',
      '1 seat',
    ],
  },
  [SquadPlan.Team]: {
    title: 'Team',
    tagline: 'For a small team or a first marketer.',
    featuresTitle: 'Everything in Starter, plus:',
    features: [
      'Weekly brief on up to 20 topics',
      'Seniority filter for the brief',
      'A CTA on your page header',
      '5 seats',
    ],
  },
};

export const startupsEnterpriseDetails = {
  tagline: 'For established teams with a marketer.',
  featuresTitle: 'Everything in Team, plus:',
  features: [
    'Weekly brief on up to 40 topics',
    'Region filter, plus your keywords',
    'Verified badge and priority ranking',
    'Your logo on the daily.dev homepage',
    'Targeted campaigns and newsletters',
    'Guaranteed reads and creative',
    'An account team',
  ],
};

export const startupsEnterpriseUrl =
  'https://business.daily.dev/?ref=daily-startups-checkout';
