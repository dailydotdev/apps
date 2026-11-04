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

export interface SquadPlanDetails {
  title: string;
  tagline: string;
  /** Starter lists everything, Team only what it adds. */
  features: string[];
}

export const squadPlanDetails: Record<SquadPlan, SquadPlanDetails> = {
  [SquadPlan.Starter]: {
    title: 'Starter',
    tagline: 'For founders finding their first users.',
    features: [
      'Company page with a link to your site',
      'Found in the feed, search and Google',
      'Skills for Claude Code and any agent',
      'API, so your agent posts and boosts',
      '1 seat',
    ],
  },
  [SquadPlan.Team]: {
    title: 'Team',
    tagline: 'For a small team or a first marketer.',
    features: [
      'Everything in Starter',
      'A CTA on your page header',
      '5 seats',
    ],
  },
};

export const startupsEnterpriseUrl =
  'https://business.daily.dev/?ref=daily-startups-checkout';
