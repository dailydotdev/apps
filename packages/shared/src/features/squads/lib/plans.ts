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

// The launch promo: subscriptions started while it is on get this cashback for
// their first months. Never less than the plan's own.
export interface StartupsCashbackPromo {
  percentage: number;
  months: number;
}

export const getSquadPlanCashback = (
  plan: SquadPlan,
  promo?: StartupsCashbackPromo | null,
): number =>
  Math.max(SQUAD_PLAN_CASHBACK_PERCENTAGE[plan], promo?.percentage ?? 0);

// US list prices, which the cashback is paid on (100 Cores per $1)
export const SQUAD_PLAN_LIST_PRICE_USD: Record<SquadPlan, number> = {
  [SquadPlan.Starter]: 49,
  [SquadPlan.Team]: 199,
};

export const CORES_PER_USD = 100;

export const formatCashbackPromoLength = (months: number): string =>
  months === 12 ? 'your first year' : `your first ${months} months`;

const isPromoHigher = (
  plan: SquadPlan,
  promo?: StartupsCashbackPromo | null,
): promo is StartupsCashbackPromo =>
  !!promo && promo.percentage > SQUAD_PLAN_CASHBACK_PERCENTAGE[plan];

/**
 * "Boost credits" is what founders see (Ido, 2026-11-09): always a dollar
 * amount a month, never a percentage or a Cores count. They are paid in
 * Cores at 100 per $1, but that stays out of the copy.
 */
export const formatBoostCredits = (usd: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number.isInteger(usd) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(usd);

/** Boost credits, in US dollars, that a cashback rate gives a plan each month. */
export const getSquadPlanCreditsForRate = (
  plan: SquadPlan,
  percentage: number,
): number => (SQUAD_PLAN_LIST_PRICE_USD[plan] * percentage) / 100;

/** A plan's monthly boost credits in US dollars, the launch promo's while it is on. */
export const getSquadPlanMonthlyCredits = (
  plan: SquadPlan,
  promo?: StartupsCashbackPromo | null,
): number =>
  getSquadPlanCreditsForRate(plan, getSquadPlanCashback(plan, promo));

/** "$245 in boost credits", the plan's own while the promo is off. */
export const formatSquadPlanCredits = (
  plan: SquadPlan,
  promo?: StartupsCashbackPromo | null,
): string =>
  `${formatBoostCredits(getSquadPlanMonthlyCredits(plan, promo))} in boost credits`;

/** "5×" for a 500% promo: how many times the plan price comes back. */
export const formatCashbackMultiple = (percentage: number): string =>
  `${Number((percentage / 100).toFixed(1))}×`;

/** The plan card line: the launch promo's amount and length while it is on. */
export const getSquadPlanCashbackLabel = (
  plan: SquadPlan,
  promo?: StartupsCashbackPromo | null,
): string =>
  isPromoHigher(plan, promo)
    ? `${formatSquadPlanCredits(
        plan,
        promo,
      )} every month for ${formatCashbackPromoLength(promo.months)}`
    : `${formatSquadPlanCredits(plan)} every month`;

// Topics the weekly intel covers, mirrored from the API's intel limits
export const SQUAD_PLAN_INTEL_TOPICS: Record<SquadPlan, number> = {
  [SquadPlan.Starter]: 5,
  [SquadPlan.Team]: 20,
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
      'Weekly intel on up to 5 topics',
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
      'Weekly intel on up to 20 topics',
      'Seniority filter for the intel',
      'A CTA on your page header',
      '5 seats',
    ],
  },
};

// Enterprise is set by ops for a signed contract, never bought here, so it has
// no price, cashback or details of its own
export const getSquadPlanTitle = (plan: string): string =>
  isSquadPlan(plan) ? squadPlanDetails[plan].title : 'Enterprise';

export const startupsEnterpriseUrl =
  'https://business.daily.dev/?ref=daily-startups-checkout';
