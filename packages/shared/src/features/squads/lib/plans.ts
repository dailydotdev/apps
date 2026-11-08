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

const CORES_PER_USD = 100;

/** The Cores a plan's monthly cashback adds to the squad wallet. */
export const getSquadPlanMonthlyCores = (
  plan: SquadPlan,
  promo?: StartupsCashbackPromo | null,
): number =>
  (SQUAD_PLAN_LIST_PRICE_USD[plan] *
    CORES_PER_USD *
    getSquadPlanCashback(plan, promo)) /
  100;

export const formatCashbackPromoLength = (months: number): string =>
  months === 12 ? 'your first year' : `your first ${months} months`;

const isPromoHigher = (
  plan: SquadPlan,
  promo?: StartupsCashbackPromo | null,
): promo is StartupsCashbackPromo =>
  !!promo && promo.percentage > SQUAD_PLAN_CASHBACK_PERCENTAGE[plan];

/** The plan card line: the launch promo's rate and length while it is on. */
export const getSquadPlanCashbackLabel = (
  plan: SquadPlan,
  promo?: StartupsCashbackPromo | null,
): string =>
  isPromoHigher(plan, promo)
    ? `${promo.percentage}% cashback for ${formatCashbackPromoLength(
        promo.months,
      )}`
    : `${SQUAD_PLAN_CASHBACK_PERCENTAGE[plan]}% cashback to boost your posts`;

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
