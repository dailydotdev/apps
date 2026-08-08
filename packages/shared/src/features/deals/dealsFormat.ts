import type {
  Deal,
  DealBrand,
  DealCaveat,
  DealCommunity,
  DealMedia,
  DealUnlock,
  DealUnlockCores,
  DealUnlockInvites,
  DealValue,
} from './types';
import {
  DealAvailability,
  DealCaveatKind,
  DealMediaKind,
  DealState,
  DealType,
} from './types';
import { formatCoresCurrency } from '../../lib/utils';

export const DEAL_AFFILIATE_DISCLOSURE =
  'daily.dev may earn a commission on some deals. It funds the free stuff for devs.';

export const DEAL_NO_COMMISSION_DISCLOSURE =
  'daily.dev earns no commission on this deal. It is here because the community rated it.';

// Mirrors the sitemap inclusion gate in daily-api.
export const MIN_INDEXABLE_DEAL_CLAIMS = 25;

/**
 * A works rate off a handful of reports is a lie told with a true number, so
 * below this many claims every surface prints the raw count instead.
 */
export const MIN_WORKS_RATE_CLAIMS = 25;

export const EXPIRED_DEAL_GRACE_DAYS = 30;

const EXPIRED_DEAL_GRACE_MS = EXPIRED_DEAL_GRACE_DAYS * 24 * 60 * 60 * 1000;

const compactNumberFormat = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const fullNumberFormat = new Intl.NumberFormat('en-US');

const usdFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

// UTC keeps the server render and the first client render byte identical.
const absoluteDateFormat = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

const relativeFormat = new Intl.RelativeTimeFormat('en-US', {
  numeric: 'auto',
});

export const formatCompactNumber = (value: number): string =>
  compactNumberFormat.format(value);

export const formatFullNumber = (value: number): string =>
  fullNumberFormat.format(value);

export const formatUsd = (value: number): string => usdFormat.format(value);

export const formatDealDate = (iso: string): string =>
  absoluteDateFormat.format(new Date(iso));

const relativeUnits: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 1440],
  ['hour', 60],
  ['minute', 1],
];

export const formatDealRelative = (iso: string, now: number): string => {
  const minutes = Math.round((Date.parse(iso) - now) / 60000);
  const [unit, unitMinutes] =
    relativeUnits.find(([, size]) => Math.abs(minutes) >= size) ??
    relativeUnits[relativeUnits.length - 1];

  return relativeFormat.format(Math.round(minutes / unitMinutes), unit);
};

// The card and proof rows have no room for "35 minutes ago".
export const formatDealRelativeShort = (iso: string, now: number): string => {
  const minutes = Math.round((now - Date.parse(iso)) / 60000);

  if (minutes < 1) {
    return 'just now';
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.round(minutes / 60);

  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
};

export const formatWorksRate = (worksRate: number): string =>
  `${Math.round(worksRate * 100)}%`;

export const hasRatedWorksRate = (community: DealCommunity): boolean =>
  community.claims >= MIN_WORKS_RATE_CLAIMS;

export const formatReportCount = (claims: number): string =>
  `${formatFullNumber(claims)} developer${claims === 1 ? '' : 's'}`;

export const dealTypeToLabel: Record<DealType, string> = {
  [DealType.PromoCode]: 'Code',
  [DealType.Credit]: 'Credit',
  [DealType.Affiliate]: 'Deal',
  [DealType.FreeMonths]: 'Free months',
  [DealType.GiftCard]: 'Gift card',
  [DealType.Exclusive]: 'Exclusive',
};

export const dealTypeToCtaLabel: Record<DealType, string> = {
  [DealType.PromoCode]: 'Get code',
  [DealType.Credit]: 'Claim credit',
  [DealType.Affiliate]: 'Get deal',
  [DealType.FreeMonths]: 'Start free',
  [DealType.GiftCard]: 'Redeem card',
  [DealType.Exclusive]: 'Unlock offer',
};

export const getMonogram = (name: string): string =>
  name
    .split(/[\s.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

export const DEAL_BRAND_ICON_SIZE = 128;

// Universal last resort before the monogram: every brand in the directory has a
// domain, and this endpoint resolves an icon for any of them.
export const getDealBrandFaviconUrl = (
  domain: string,
  size = DEAL_BRAND_ICON_SIZE,
): string => `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;

// The endpoint above answers a decodable generic globe even for a domain it
// cannot resolve, so the image error handler never fires on it. A brand with no
// domain has to skip that rung outright to reach the monogram.
export const getDealBrandIconSources = (brand: DealBrand): string[] =>
  [brand.logoUrl, brand.domain && getDealBrandFaviconUrl(brand.domain)].filter(
    (source): source is string => !!source,
  );

// Brand marks are already carried by the logo chip, so only product photos and
// gift card artwork earn a cover slot.
export const getDealCoverMedia = (deal: Deal): DealMedia | undefined =>
  deal.media && deal.media.kind !== DealMediaKind.Brand
    ? deal.media
    : undefined;

// Stock photography of a product line must never read as a shot of the exact
// unit the offer covers, so every representative photo carries the disclaimer.
export const DEAL_REPRESENTATIVE_PHOTO_NOTE =
  'Photo shows the product family, not the exact unit.';

export const getDealMediaCaption = (media: DealMedia): string =>
  [media.isRepresentative && DEAL_REPRESENTATIVE_PHOTO_NOTE, media.credit]
    .filter(Boolean)
    .join(' ');

export const isLiveDeal = (deal: Deal): boolean =>
  deal.state !== DealState.Expired && deal.state !== DealState.SoldOut;

export const formatDealCountdown = (expiresAt: string, now: number): string => {
  const minutes = Math.floor((new Date(expiresAt).getTime() - now) / 60000);

  if (minutes <= 0) {
    return 'Ended';
  }

  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);

  if (days > 0) {
    return `Ends in ${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `Ends in ${hours}h ${minutes % 60}m`;
  }

  return `Ends in ${minutes}m`;
};

export const hasDealEnded = (expiresAt: string, now: number): boolean =>
  new Date(expiresAt).getTime() - now <= 0;

const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const getDealCategorySlug = (category: string): string =>
  toSlug(category);

export const getDealCategoryPath = (category: string): string =>
  `/deals/c/${getDealCategorySlug(category)}`;

export const findDealCategoryBySlug = (
  slug: string,
  deals: Deal[],
): string | undefined =>
  deals
    .flatMap((deal) => deal.categories)
    .find((category) => getDealCategorySlug(category) === slug);

export const getDealBrandSlug = (brand: DealBrand): string =>
  toSlug(brand.name);

export const getDealBrandPath = (brand: DealBrand): string =>
  `/deals/brand/${getDealBrandSlug(brand)}`;

export const getDealBrands = (deals: Deal[]): DealBrand[] =>
  Array.from(
    new Map(deals.map((deal) => [deal.brand.id, deal.brand])).values(),
  );

export const findDealBrandBySlug = (
  slug: string,
  deals: Deal[],
): DealBrand | undefined =>
  getDealBrands(deals).find((brand) => getDealBrandSlug(brand) === slug);

export const getDealPath = (deal: Deal): string => `/deals/${deal.slug}`;

// Absolute so a copied link survives the paste into a chat window.
export const DEALS_ORIGIN = 'https://app.daily.dev';

export const getDealShareUrl = (deal: Deal): string =>
  `${DEALS_ORIGIN}${getDealPath(deal)}`;

export const DEALS_DIRECTORY_PATH = '/deals';

export const DEALS_FILTER_ALL = 'All';
export const DEALS_FILTER_EXPIRING = 'Expiring';
export const DEALS_FILTER_EXCLUSIVE = 'Exclusive';

/**
 * A category is a page of its own, but these two cut across every category, so
 * they stay a query on the directory instead of a route that would publish the
 * same offers under a second thin URL.
 */
const specialFilterToQuery: Record<string, string> = {
  [DEALS_FILTER_EXPIRING]: 'expiring',
  [DEALS_FILTER_EXCLUSIVE]: 'exclusive',
};

export const getDealsFilterPath = (filter: string): string => {
  const query = specialFilterToQuery[filter];

  return query
    ? `${DEALS_DIRECTORY_PATH}?filter=${query}`
    : DEALS_DIRECTORY_PATH;
};

export const findDealsFilterByQuery = (
  value: string | string[] | undefined,
): string | undefined => {
  const raw = Array.isArray(value) ? value[0] : value;

  return Object.keys(specialFilterToQuery).find(
    (filter) => specialFilterToQuery[filter] === raw,
  );
};

export const getDealCategories = (deals: Deal[]): string[] =>
  Array.from(new Set(deals.flatMap((deal) => deal.categories))).sort((a, b) =>
    a.localeCompare(b),
  );

export const matchesDealFilter = (deal: Deal, filter: string): boolean => {
  if (filter === DEALS_FILTER_ALL) {
    return true;
  }

  if (filter === DEALS_FILTER_EXPIRING) {
    return deal.state === DealState.Expiring;
  }

  if (filter === DEALS_FILTER_EXCLUSIVE) {
    return deal.type === DealType.Exclusive;
  }

  return deal.categories.includes(filter);
};

export const getDealAvailability = (deal: Deal): DealAvailability => {
  if (deal.state === DealState.SoldOut) {
    return DealAvailability.SoldOut;
  }

  return deal.state === DealState.Expired
    ? DealAvailability.Expired
    : DealAvailability.InStock;
};

export enum DealPageStatus {
  Live = 'live',
  Ended = 'ended',
  Gone = 'gone',
}

export const getDealEndsAt = (deal: Deal): string | undefined =>
  deal.validThrough ?? deal.expiresAt;

/**
 * A share link to a deal that closed last week should still land somewhere
 * honest, so a recently ended deal keeps its URL and says so. Past the grace
 * window the page is a stale coupon and the route 404s instead.
 */
export const getDealPageStatus = (deal: Deal, now: number): DealPageStatus => {
  const endsAt = getDealEndsAt(deal);
  const hasEnded =
    deal.state === DealState.Expired ||
    (!!endsAt && hasDealEnded(endsAt, now)) ||
    deal.state === DealState.SoldOut;

  if (!hasEnded) {
    return DealPageStatus.Live;
  }

  if (!endsAt || deal.state === DealState.SoldOut) {
    return DealPageStatus.Ended;
  }

  return now - Date.parse(endsAt) > EXPIRED_DEAL_GRACE_MS
    ? DealPageStatus.Gone
    : DealPageStatus.Ended;
};

const hasEditorialBody = (deal: Deal): boolean =>
  [deal.description, deal.whyPick, deal.terms].some(
    (text) => (text?.trim().length ?? 0) > 0,
  );

export const shouldNoindexDeal = (deal: Deal, now: number): boolean =>
  getDealPageStatus(deal, now) !== DealPageStatus.Live ||
  deal.community.claims < MIN_INDEXABLE_DEAL_CLAIMS ||
  !hasEditorialBody(deal);

export const getSimilarDeals = (deal: Deal, deals: Deal[], limit = 3): Deal[] =>
  deals
    .filter(
      (candidate) =>
        candidate.id !== deal.id &&
        isLiveDeal(candidate) &&
        candidate.categories.some((category) =>
          deal.categories.includes(category),
        ),
    )
    .slice(0, limit);

const dealTypeToOfferNoun: Record<DealType, string> = {
  [DealType.PromoCode]: 'promo code',
  [DealType.Credit]: 'credit',
  [DealType.Affiliate]: 'deal',
  [DealType.FreeMonths]: 'free months offer',
  [DealType.GiftCard]: 'gift card',
  [DealType.Exclusive]: 'members only offer',
};

export const getDealOfferNoun = (deal: Deal): string =>
  dealTypeToOfferNoun[deal.type];

export const getDealValueHeadline = (deal: Deal): string =>
  deal.discountPercent ? `${deal.discountPercent}% off` : deal.value.label;

export const getDealValueAriaLabel = (value: DealValue): string =>
  value.savingsUsd
    ? `${value.label}, worth about ${formatUsd(value.savingsUsd)}`
    : value.label;

export const getDealSavingPhrase = (value: DealValue): string | undefined =>
  value.savingsUsd ? `saves about ${formatUsd(value.savingsUsd)}` : undefined;

export const formatDealCores = (cost: number): string =>
  `${formatCoresCurrency(cost)} Cores`;

export const getDealInvitesLeft = ({
  required,
  done,
}: DealUnlockInvites): number => Math.max(0, required - done);

const getInviteCountPhrase = (invites: DealUnlockInvites): string => {
  const left = getDealInvitesLeft(invites);

  return `${left} more developer${left === 1 ? '' : 's'}`;
};

export const DEAL_INVITE_CTA_LABEL = 'Invite to unlock';

export const getDealCoresCtaLabel = ({ cost }: DealUnlockCores): string =>
  `Unlock for ${formatDealCores(cost)}`;

/**
 * The row and the card carry one CTA. Cores is the instant path, so it wins the
 * slot whenever the deal offers it and the invite route stays on the detail
 * surface next to the progress it belongs to.
 */
export const getDealUnlockCtaLabel = (unlock?: DealUnlock): string =>
  unlock?.cores ? getDealCoresCtaLabel(unlock.cores) : DEAL_INVITE_CTA_LABEL;

export const getDealUnlockSummary = ({
  cores,
  invites,
}: DealUnlock): string => {
  if (cores && invites) {
    return `Unlock it for ${formatDealCores(
      cores.cost,
    )} now, or invite ${getInviteCountPhrase(invites)} and take it for free.`;
  }

  if (cores) {
    return `Unlock it for ${formatDealCores(
      cores.cost,
    )} from your Cores balance.`;
  }

  if (invites) {
    return `Invite ${getInviteCountPhrase(invites)} to unlock this offer.`;
  }

  return 'Unlock this offer to claim it.';
};

/**
 * Most consequential first. A caveat that decides whether the offer applies to
 * you at all outranks one that only shapes how you use it.
 */
const caveatRank: Record<DealCaveatKind, number> = {
  [DealCaveatKind.CreditExpires]: 0,
  [DealCaveatKind.NewCustomersOnly]: 1,
  [DealCaveatKind.AnnualPlanOnly]: 2,
  [DealCaveatKind.DoesNotStack]: 3,
  [DealCaveatKind.CardRequired]: 4,
  [DealCaveatKind.AutoRenews]: 5,
  [DealCaveatKind.MinimumSpend]: 6,
  [DealCaveatKind.SeatLimit]: 7,
  [DealCaveatKind.AccountAgeRequired]: 8,
  [DealCaveatKind.RegionLimited]: 9,
  [DealCaveatKind.SingleUse]: 10,
};

export const DEAL_CAVEATS_HEADING = 'Worth knowing before you claim';

export const DEAL_CARD_CAVEAT_LIMIT = 2;

export const getRankedDealCaveats = (deal: Deal): DealCaveat[] =>
  [...deal.caveats].sort((a, b) => caveatRank[a.kind] - caveatRank[b.kind]);

export interface DealCardCaveats {
  shown: DealCaveat[];
  hiddenCount: number;
  total: number;
}

export const getDealCardCaveats = (
  deal: Deal,
  limit = DEAL_CARD_CAVEAT_LIMIT,
): DealCardCaveats => {
  const ranked = getRankedDealCaveats(deal);

  return {
    shown: ranked.slice(0, limit),
    hiddenCount: Math.max(0, ranked.length - limit),
    total: ranked.length,
  };
};

const dealTypeToRedemptionNote: Record<DealType, string> = {
  [DealType.PromoCode]: 'Paste the code at checkout.',
  [DealType.Credit]: 'The credit applies after signup, not at checkout.',
  [DealType.Affiliate]: 'The price is already applied through the link.',
  [DealType.FreeMonths]: 'The free months apply at signup.',
  [DealType.GiftCard]: 'The card arrives by email after you claim it.',
  [DealType.Exclusive]: 'Sign in to daily.dev before you open the offer.',
};

export const getDealRedemptionNote = (deal: Deal): string =>
  deal.redemptionNote ?? dealTypeToRedemptionNote[deal.type];

export enum DealBadgeKind {
  Expired = 'expired',
  SoldOut = 'sold_out',
  Promoted = 'promoted',
  EndingSoon = 'ending_soon',
  PoolLeft = 'pool_left',
  CommunityPick = 'community_pick',
  MembersOnly = 'members_only',
}

/**
 * One badge per item, and the precedence is fixed so two surfaces can never
 * disagree about which one an offer earned. A promoted placement suppresses
 * every merit label, which is the editorial firewall in one line of code.
 * Scarcity ranks above merit because it is the only label that expires while
 * the reader is still looking at the row.
 */
export const getDealBadgeKind = (
  deal: Deal,
  now: number,
): DealBadgeKind | undefined => {
  const endsAt = getDealEndsAt(deal);

  if (
    deal.state === DealState.Expired ||
    (!!endsAt && hasDealEnded(endsAt, now))
  ) {
    return DealBadgeKind.Expired;
  }

  if (deal.state === DealState.SoldOut) {
    return DealBadgeKind.SoldOut;
  }

  if (deal.isPromoted) {
    return DealBadgeKind.Promoted;
  }

  if (deal.state === DealState.Expiring && deal.expiresAt) {
    return DealBadgeKind.EndingSoon;
  }

  if (deal.pool) {
    return DealBadgeKind.PoolLeft;
  }

  if (deal.isCommunityPick) {
    return DealBadgeKind.CommunityPick;
  }

  return deal.type === DealType.Exclusive
    ? DealBadgeKind.MembersOnly
    : undefined;
};

export interface DealVerification {
  claimsLabel: string;
  worksRateLabel: string;
  savingLabel: string;
  verifiedAt: string;
  verifiedLabel: string;
  summary: string;
}

const BURY_RULE =
  'When reports start coming back negative, the offer drops out of the directory.';

export const getDealVerification = (
  deal: Deal,
  now: number,
): DealVerification => {
  const { community } = deal;
  const isRated = hasRatedWorksRate(community);
  const verifiedLabel = formatDealRelative(community.lastVerifiedAt, now);
  const answered = `${formatReportCount(community.claims)} reported back`;

  return {
    claimsLabel: formatFullNumber(community.claims),
    worksRateLabel: isRated
      ? formatWorksRate(community.worksRate)
      : 'Not rated yet',
    savingLabel: deal.value.savingsUsd
      ? formatUsd(deal.value.savingsUsd)
      : deal.value.label,
    verifiedAt: community.lastVerifiedAt,
    verifiedLabel,
    summary: isRated
      ? `Every claim on daily.dev asks one question afterwards: did it work? ${answered} for this offer and ${formatWorksRate(
          community.worksRate,
        )} said it worked. The most recent report came in ${verifiedLabel}. ${BURY_RULE}`
      : `Every claim on daily.dev asks one question afterwards: did it work? Only ${answered} for this offer so far, which is too few to put a success rate on it. The most recent report came in ${verifiedLabel}. ${BURY_RULE}`,
  };
};

export interface DealsDirectoryEvidence {
  deals: number;
  claims: number;
  worksRate: number;
  isRated: boolean;
}

export const getDealsDirectoryEvidence = (
  deals: Deal[],
): DealsDirectoryEvidence => {
  const claims = deals.reduce(
    (total, deal) => total + deal.community.claims,
    0,
  );
  const working = deals.reduce(
    (total, deal) => total + deal.community.claims * deal.community.worksRate,
    0,
  );

  return {
    deals: deals.length,
    claims,
    worksRate: claims > 0 ? working / claims : 0,
    isRated: claims >= MIN_WORKS_RATE_CLAIMS,
  };
};

export interface DealFact {
  label: string;
  value: string;
}

const NOT_STATED = 'Not stated';

const findCaveat = (deal: Deal, kind: DealCaveatKind): DealCaveat | undefined =>
  deal.caveats.find((caveat) => caveat.kind === kind);

const getStackability = (deal: Deal): string =>
  findCaveat(deal, DealCaveatKind.DoesNotStack) ? 'No' : NOT_STATED;

const getNewCustomersOnly = (deal: Deal): string =>
  findCaveat(deal, DealCaveatKind.NewCustomersOnly) ? 'Yes' : NOT_STATED;

const getMinimumSpend = (deal: Deal): string => {
  const annual = findCaveat(deal, DealCaveatKind.AnnualPlanOnly);

  if (annual) {
    return 'Annual plan required';
  }

  return findCaveat(deal, DealCaveatKind.MinimumSpend)?.label ?? 'None stated';
};

const getAccountRequirement = (deal: Deal): string =>
  deal.type === DealType.Exclusive ||
  findCaveat(deal, DealCaveatKind.AccountAgeRequired)
    ? 'A free daily.dev account'
    : 'None';

export const getDealFacts = (deal: Deal): DealFact[] => [
  { label: 'Stacks with other offers', value: getStackability(deal) },
  { label: 'New customers only', value: getNewCustomersOnly(deal) },
  { label: 'Minimum spend', value: getMinimumSpend(deal) },
  { label: 'Account needed', value: getAccountRequirement(deal) },
  {
    label: 'Commission to daily.dev',
    value: deal.isCommissioned ? 'Yes' : 'No',
  },
];

export const getClaimEvidence = (deal: Deal): string => {
  const { claims, worksRate } = deal.community;

  if (!hasRatedWorksRate(deal.community)) {
    return `${formatReportCount(
      claims,
    )} have reported back on daily.dev so far, too few to put a success rate on it`;
  }

  return `${formatWorksRate(worksRate)} of the ${formatFullNumber(
    claims,
  )} developers who claimed it on daily.dev reported it worked`;
};

export const getDealDirectAnswer = (deal: Deal, now: number): string => {
  const noun = getDealOfferNoun(deal);
  const endsAt = getDealEndsAt(deal);

  if (getDealPageStatus(deal, now) !== DealPageStatus.Live) {
    const ending = endsAt ? ` It ended on ${formatDealDate(endsAt)}.` : '';

    return `No, this ${deal.brand.name} ${noun} is closed.${ending} Live alternatives in ${deal.categories[0]} are listed below.`;
  }

  const identifier = deal.code ? ` ${deal.code}` : '';
  const worth = deal.value.savingsUsd
    ? `, worth about ${formatUsd(deal.value.savingsUsd)}`
    : '';

  return `Yes, the ${
    deal.brand.name
  } ${noun}${identifier} is live: ${getDealValueHeadline(
    deal,
  )}${worth}. ${getClaimEvidence(deal)}, last verified on ${formatDealDate(
    deal.community.lastVerifiedAt,
  )}.`;
};

export interface DealAnsweredQuestion {
  question: string;
  answer: string;
  cta?: string;
}

export const getDealAnsweredQuestions = (
  deal: Deal,
  now: number,
): DealAnsweredQuestion[] => {
  const noun = getDealOfferNoun(deal);
  const brand = deal.brand.name;
  const endsAt = getDealEndsAt(deal);
  const stackability = getStackability(deal);
  const isLive = getDealPageStatus(deal, now) === DealPageStatus.Live;

  return [
    {
      question: `Does the ${brand} ${noun} still work?`,
      answer: isLive
        ? `${getClaimEvidence(deal)}. It was last verified on ${formatDealDate(
            deal.community.lastVerifiedAt,
          )}.`
        : `No. This ${brand} ${noun} is closed and daily.dev no longer lists it as claimable.`,
      cta: 'daily.dev re-checks it whenever a developer reports a failure.',
    },
    {
      question: `When does the ${brand} ${noun} expire?`,
      answer: endsAt
        ? `The offer runs until ${formatDealDate(endsAt)}.`
        : `${brand} has not announced an end date, so it runs until the merchant closes it.`,
      cta: 'The daily.dev deal page carries the live countdown.',
    },
    {
      question: `Can existing ${brand} customers use this ${noun}?`,
      answer:
        getNewCustomersOnly(deal) === 'Yes'
          ? `No. The terms restrict it to new customers: ${deal.terms}`
          : `The terms do not restrict it to new customers: ${deal.terms}`,
    },
    ...(/student|startup/i.test(deal.terms)
      ? [
          {
            question: `Does it stack with the ${brand} student discount or startup pricing?`,
            answer:
              stackability === 'No'
                ? `No. The terms rule it out: ${deal.terms}`
                : `The terms mention student or startup pricing: ${deal.terms}`,
          },
        ]
      : []),
    {
      question: `Does daily.dev earn a commission on this ${brand} ${noun}?`,
      answer: deal.isCommissioned
        ? DEAL_AFFILIATE_DISCLOSURE
        : DEAL_NO_COMMISSION_DISCLOSURE,
    },
  ];
};

export const getDealAnswerText = ({
  answer,
  cta,
}: DealAnsweredQuestion): string => (cta ? `${answer} ${cta}` : answer);

const sharerNameMaxLength = 24;

export const sanitizeSharerName = (
  value: string | string[] | undefined,
): string | undefined => {
  const raw = Array.isArray(value) ? value[0] : value;

  if (typeof raw !== 'string') {
    return undefined;
  }

  const safe = raw
    .replace(/[^\w .-]/g, '')
    .trim()
    .slice(0, sharerNameMaxLength);

  return safe.length > 0 ? safe : undefined;
};
