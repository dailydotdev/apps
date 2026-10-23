import { addMonths, addYears, format, subDays } from 'date-fns';
import type { ProductPricingPreview } from '../../../graphql/paddle';
import { PlusPriceType } from '../../../lib/featureValues';

export type Cycle = 'annual' | 'monthly';
export type Purchase = 'personal' | 'team' | 'gift';

/** The checklist, in the order members use the features. Ids are production's
    PlusList ids, so feature analytics read the same everywhere. */
export type CheckoutFeature = { id: string; label: string };

export const checkoutFeatures: CheckoutFeature[] = [
  { id: 'presidential-briefing', label: 'Presidential Briefing' },
  { id: 'custom feeds', label: 'Custom feeds' },
  { id: 'ad-free', label: 'Ad-free' },
  { id: 'clean titles', label: 'AI-cleaned titles' },
  { id: 'bookmark folders', label: 'Bookmark folders' },
  { id: 'keyword filter', label: 'Keyword filters' },
  { id: 'public-api', label: 'Higher API rate limits' },
  { id: 'auto-translate', label: 'Auto-translate your feed' },
  { id: 'bonus-quest-slots', label: 'Bonus quest slots' },
  { id: 'member squad', label: 'Priority support' },
];

/** `?ref=` → headline and the three features that lead (bold, first). */
export const entryCopy: Record<string, { headline: string; lead: string[] }> = {
  default: {
    headline: 'daily.dev without ads, with a daily brief.',
    lead: ['presidential-briefing', 'custom feeds', 'ad-free'],
  },
  ads: {
    headline: 'daily.dev without ads, with a daily brief.',
    lead: ['ad-free', 'presidential-briefing', 'custom feeds'],
  },
  brief: {
    headline: 'Your brief, every morning, without ads.',
    lead: ['presidential-briefing', 'ad-free', 'custom feeds'],
  },
  'custom-feed': {
    headline: 'Unlimited custom feeds, and no ads.',
    lead: ['custom feeds', 'presidential-briefing', 'ad-free'],
  },
  clickbait: {
    headline: 'Real titles, no clickbait, no ads.',
    lead: ['clean titles', 'presidential-briefing', 'ad-free'],
  },
  bookmarks: {
    headline: 'Folders for your saves, and no ads.',
    lead: ['bookmark folders', 'presidential-briefing', 'ad-free'],
  },
};

export const getEntry = (ref?: string | string[]) =>
  entryCopy[typeof ref === 'string' && ref in entryCopy ? ref : 'default'];

export const orderFeatures = (lead: string[]): CheckoutFeature[] => [
  ...lead
    .map((id) => checkoutFeatures.find((feature) => feature.id === id))
    .filter((feature): feature is CheckoutFeature => !!feature),
  ...checkoutFeatures.filter((feature) => !lead.includes(feature.id)),
];

export const formatMoney = (amount: number, currency: string): string =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(
    amount,
  );

export const findCycle = (
  options: ProductPricingPreview[] | undefined,
  cycle: Cycle,
): ProductPricingPreview | undefined =>
  options?.find(
    ({ duration }) =>
      duration ===
      (cycle === 'annual' ? PlusPriceType.Yearly : PlusPriceType.Monthly),
  );

/** “3 months free”: what twelve monthly payments cost over the annual price,
    in months, from the live prices (so it stays true in every currency). */
export const monthsFree = (
  annual?: ProductPricingPreview,
  monthly?: ProductPricingPreview,
): number => {
  if (!annual || !monthly || !monthly.price.amount) {
    return 0;
  }
  return Math.round(
    (monthly.price.amount * 12 - annual.price.amount) / monthly.price.amount,
  );
};

export const renewalDate = (cycle: Cycle, from = new Date()): Date =>
  cycle === 'annual' ? addYears(from, 1) : addMonths(from, 1);

export const formatDate = (date: Date): string => format(date, 'd MMM yyyy');

export const reminderDate = (renewal: Date): Date => subDays(renewal, 7);

/** Paddle emails a renewal reminder only for plans of 180+ days, and only in
    the EU 27, the UK and 11 US states (Paddle help: enhanced billing
    notifications location list). Boot geo has the country only, so the US
    never qualifies here until the state is known. */
const reminderCountries = [
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
  'GB',
];

export const getsRenewalReminder = ({
  cycle,
  purchase,
  region,
}: {
  cycle: Cycle;
  purchase: Purchase;
  region?: string;
}): boolean =>
  cycle === 'annual' &&
  purchase !== 'gift' &&
  !!region &&
  reminderCountries.includes(region.toUpperCase());
