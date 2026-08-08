import type {
  ClaimRecord,
  Deal,
  DealBrand,
  DealCaveat,
  DealMedia,
} from './types';
import {
  ClaimStatus,
  DealCaveatKind,
  DealMediaKind,
  DealState,
  DealType,
} from './types';
import { getDealBrandFaviconUrl } from './dealsFormat';

const caveat = (
  kind: DealCaveatKind,
  label: string,
  detail: string,
): DealCaveat => ({ kind, label, detail });

// Fixture time is frozen so snapshots and relative labels stay deterministic.
export const MOCK_NOW_ISO = '2026-08-01T09:00:00.000Z';

export const MOCK_NOW_MS = Date.parse(MOCK_NOW_ISO);

const minutesFromMockNow = (minutes: number): string =>
  new Date(MOCK_NOW_MS + minutes * 60 * 1000).toISOString();

const hoursFromMockNow = (hours: number): string =>
  minutesFromMockNow(hours * 60);

const daysFromMockNow = (days: number): string => hoursFromMockNow(days * 24);

const svgl = (name: string): string => `https://svgl.app/library/${name}.svg`;

// Simple Icons serves every mark in its own brand colour, which stays legible on
// the light chip DealBrandLogo renders. Brands it does not carry (Amazon,
// Logitech, Keychron, monday.com, Frontend Masters) fall through to the favicon
// resolver keyed off `domain`.
const simpleIcon = (slug: string): string =>
  `https://cdn.simpleicons.org/${slug}`;

const brands = {
  cursor: {
    id: 'b-cursor',
    name: 'Cursor',
    logoUrl: simpleIcon('cursor'),
    domain: 'cursor.com',
    accent: '#6C5CE7',
  },
  keychron: {
    id: 'b-keychron',
    name: 'Keychron',
    logoUrl: null,
    domain: 'keychron.com',
    accent: '#F0A500',
  },
  jetbrains: {
    id: 'b-jetbrains',
    name: 'JetBrains',
    logoUrl: svgl('jetbrains'),
    domain: 'jetbrains.com',
    accent: '#FE315D',
  },
  linear: {
    id: 'b-linear',
    name: 'Linear',
    logoUrl: svgl('linear'),
    domain: 'linear.app',
    accent: '#5E6AD2',
  },
  monday: {
    id: 'b-monday',
    name: 'monday.com',
    logoUrl: null,
    domain: 'monday.com',
    accent: '#FF3D57',
  },
  digitalocean: {
    id: 'b-digitalocean',
    name: 'DigitalOcean',
    logoUrl: svgl('digitalocean'),
    domain: 'digitalocean.com',
    accent: '#0080FF',
  },
  amazon: {
    id: 'b-amazon',
    name: 'Amazon',
    logoUrl: null,
    domain: 'amazon.com',
    accent: '#FF9900',
  },
  starbucks: {
    id: 'b-starbucks',
    name: 'Starbucks',
    logoUrl: simpleIcon('starbucks'),
    domain: 'starbucks.com',
    accent: '#00704A',
  },
  vercel: {
    id: 'b-vercel',
    name: 'Vercel',
    logoUrl: svgl('vercel_wordmark'),
    domain: 'vercel.com',
    accent: '#FFFFFF',
  },
  github: {
    id: 'b-github',
    name: 'GitHub Copilot',
    logoUrl: simpleIcon('github'),
    domain: 'github.com',
    accent: '#8957E5',
  },
  raycast: {
    id: 'b-raycast',
    name: 'Raycast',
    logoUrl: svgl('raycast'),
    domain: 'raycast.com',
    accent: '#FF6363',
  },
  notion: {
    id: 'b-notion',
    name: 'Notion',
    logoUrl: svgl('notion'),
    domain: 'notion.so',
    accent: '#B4B4B4',
  },
  figma: {
    id: 'b-figma',
    name: 'Figma',
    logoUrl: svgl('figma'),
    domain: 'figma.com',
    accent: '#A259FF',
  },
  sentry: {
    id: 'b-sentry',
    name: 'Sentry',
    logoUrl: svgl('sentry'),
    domain: 'sentry.io',
    accent: '#7B51A1',
  },
  neon: {
    id: 'b-neon',
    name: 'Neon',
    logoUrl: simpleIcon('neon'),
    domain: 'neon.tech',
    accent: '#00E599',
  },
  warp: {
    id: 'b-warp',
    name: 'Warp',
    logoUrl: simpleIcon('warp'),
    domain: 'warp.dev',
    accent: '#01A0F0',
  },
  frontendMasters: {
    id: 'b-frontend-masters',
    name: 'Frontend Masters',
    logoUrl: null,
    domain: 'frontendmasters.com',
    accent: '#C40D0D',
  },
  udemy: {
    id: 'b-udemy',
    name: 'Udemy',
    logoUrl: simpleIcon('udemy'),
    domain: 'udemy.com',
    accent: '#A435F0',
  },
  railway: {
    id: 'b-railway',
    name: 'Railway',
    logoUrl: simpleIcon('railway'),
    domain: 'railway.app',
    accent: '#9013FE',
  },
  logitech: {
    id: 'b-logitech',
    name: 'Logitech',
    logoUrl: null,
    domain: 'logitech.com',
    accent: '#00B8FC',
  },
} satisfies Record<string, DealBrand>;

const brandMedia = (brand: DealBrand, alt: string): DealMedia => ({
  kind: DealMediaKind.Brand,
  imageUrl: brand.logoUrl ?? getDealBrandFaviconUrl(brand.domain),
  alt,
});

// Gift cards read better as the brand mark on a tinted card than as a stock
// photo, so the artwork points at a raster brand icon the share cards can use.
const giftCardArtwork = (brand: DealBrand, alt: string): DealMedia => ({
  kind: DealMediaKind.Artwork,
  imageUrl: getDealBrandFaviconUrl(brand.domain, 256),
  alt,
});

export const mockDeals: Deal[] = [
  {
    id: 'd-cursor-credit',
    slug: 'cursor-20-credit',
    title: '$20 of Cursor credit on your first month of Pro',
    description:
      'Pay for one month of Cursor Pro and get $20 back as credit on the next invoice.',
    whyPick:
      'The editor half the feed already argues about, and the credit pays for the month you spend deciding. It only helps if you were going to pay for a month first, because the $20 arrives after that invoice, not before it.',
    brand: brands.cursor,
    media: brandMedia(brands.cursor, 'Cursor logo'),
    type: DealType.Credit,
    state: DealState.Available,
    value: { label: '$20 free', savingsUsd: 20 },
    partnerUrl: 'https://cursor.com/pricing',
    isCommissioned: true,
    publishedAt: daysFromMockNow(-4),
    updatedAt: hoursFromMockNow(-2),
    claimByAt: daysFromMockNow(14),
    validFrom: daysFromMockNow(-4),
    validThrough: daysFromMockNow(58),
    priceCurrency: 'USD',
    discountAmount: 20,
    terms: 'New Pro subscribers only. Credit lands within one billing cycle.',
    caveats: [
      caveat(
        DealCaveatKind.NewCustomersOnly,
        'New customers only',
        'New Pro subscribers only. If you already pay for Cursor Pro, nothing changes on your invoice.',
      ),
      caveat(
        DealCaveatKind.MinimumSpend,
        'One paid month first',
        'You pay for a month before the credit lands. It arrives on the next invoice, not at signup.',
      ),
    ],
    redemptionNote:
      'The credit shows on your next invoice, not at checkout today.',
    categories: ['AI tools'],
    community: {
      upvotes: 842,
      comments: 61,
      claims: 3120,
      worksRate: 0.96,
      lastVerifiedAt: hoursFromMockNow(-2),
    },
  },
  {
    id: 'd-keychron-code',
    slug: 'keychron-q1-30-off',
    title: '30% off the Keychron Q1 mechanical keyboard',
    description:
      'The hot-swappable board half of your timeline types on, at the lowest price we have seen this year.',
    whyPick:
      'The Q1 is the board people keep after the hobby phase wears off, and hot-swap sockets mean the next switch change costs $20 rather than a new keyboard. It is also heavy aluminium, so it is a desk keyboard and not a commute one.',
    isCommunityPick: true,
    brand: brands.keychron,
    media: {
      kind: DealMediaKind.Product,
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Keychron-q6-whacky-ozzy_%2852978547316%29.jpg/1280px-Keychron-q6-whacky-ozzy_%2852978547316%29.jpg',
      alt: 'A Keychron Q series aluminium mechanical keyboard with teal and yellow keycaps on a wooden wrist rest',
      isRepresentative: true,
      credit: 'Chris Heil, CC0, via Wikimedia Commons',
    },
    type: DealType.PromoCode,
    state: DealState.Available,
    value: { label: '-30%', savingsUsd: 60 },
    code: 'KEYDEV30',
    partnerUrl: 'https://keychron.com/products/keychron-q1',
    isCommissioned: true,
    publishedAt: daysFromMockNow(-2),
    updatedAt: minutesFromMockNow(-35),
    validFrom: daysFromMockNow(-2),
    validThrough: daysFromMockNow(26),
    priceCurrency: 'USD',
    discountPercent: 30,
    terms: 'One use per customer. Excludes bundles and limited editions.',
    caveats: [
      caveat(
        DealCaveatKind.DoesNotStack,
        'Excludes bundles',
        'Bundles and limited editions are excluded. A cart holding both takes 30% off the eligible boards only, and the bundle stays at list price.',
      ),
      caveat(
        DealCaveatKind.SingleUse,
        'One use per customer',
        'One use per customer. A second board on the same account pays full price.',
      ),
    ],
    redemptionNote:
      'Paste the code at checkout. The product page keeps showing list price.',
    categories: ['Hardware'],
    community: {
      upvotes: 1204,
      comments: 88,
      claims: 2411,
      worksRate: 0.93,
      lastVerifiedAt: minutesFromMockNow(-35),
    },
  },
  {
    id: 'd-jetbrains-code',
    slug: 'jetbrains-all-products-25-off',
    title: '25% off the JetBrains All Products Pack',
    description:
      'Every JetBrains IDE on one licence, a quarter off the first year. daily.dev takes no commission on this one.',
    whyPick:
      'Worth it the moment you work in more than one language. On a single stack the free community editions still cover most of what you do.',
    isCommunityPick: true,
    brand: brands.jetbrains,
    media: brandMedia(brands.jetbrains, 'JetBrains logo'),
    type: DealType.PromoCode,
    state: DealState.Available,
    value: { label: '-25%', savingsUsd: 74 },
    code: 'DAILYIDE25',
    partnerUrl: 'https://jetbrains.com/all',
    isCommissioned: false,
    publishedAt: daysFromMockNow(-11),
    updatedAt: hoursFromMockNow(-1),
    validFrom: daysFromMockNow(-11),
    validThrough: daysFromMockNow(50),
    priceCurrency: 'USD',
    discountPercent: 25,
    terms:
      'First year only. Does not stack with student or startup pricing. No affiliate link, no commission to us.',
    caveats: [
      caveat(
        DealCaveatKind.DoesNotStack,
        'Does not stack',
        'It does not stack with student or startup pricing. JetBrains applies the single largest discount on the order, so a student licence stays cheaper than this code and the code is ignored.',
      ),
      caveat(
        DealCaveatKind.AutoRenews,
        'Renews at full price',
        'The discount covers the first year only. Year two renews at the standard rate unless you cancel.',
      ),
    ],
    redemptionNote:
      'Paste the code on the JetBrains checkout, not in your account page.',
    categories: ['Dev tools'],
    community: {
      upvotes: 967,
      comments: 54,
      claims: 1880,
      worksRate: 0.91,
      lastVerifiedAt: hoursFromMockNow(-1),
    },
  },
  {
    id: 'd-linear-free-months',
    slug: 'linear-3-months-free',
    title: '3 months of Linear Business, free',
    description:
      'A daily.dev only drop. Invite two developers who join, and the three months unlock for your workspace.',
    whyPick:
      'Linear is fast in a way issue trackers usually are not. Three months is long enough to find out whether your team keeps it updated or drifts back to a doc.',
    brand: brands.linear,
    media: brandMedia(brands.linear, 'Linear logo'),
    type: DealType.FreeMonths,
    state: DealState.Locked,
    value: { label: '3 mo free', savingsUsd: 42 },
    partnerUrl: 'https://linear.app/pricing',
    isCommissioned: false,
    publishedAt: daysFromMockNow(-6),
    updatedAt: minutesFromMockNow(-20),
    validFrom: daysFromMockNow(-6),
    validThrough: daysFromMockNow(38),
    priceCurrency: 'USD',
    discountAmount: 42,
    terms:
      'New workspaces only. Unlocks once both invites finish signup. Business billing starts when the three months end.',
    caveats: [
      caveat(
        DealCaveatKind.NewCustomersOnly,
        'New workspaces only',
        'New workspaces only. An existing Linear workspace cannot switch onto this offer.',
      ),
      caveat(
        DealCaveatKind.AutoRenews,
        'Bills after 3 months',
        'Business billing starts the day the three months end. Downgrade before then or you get charged.',
      ),
    ],
    redemptionNote:
      'Unlocks in your workspace settings once both invites finish signup.',
    categories: ['Productivity'],
    community: {
      upvotes: 1533,
      comments: 132,
      claims: 604,
      worksRate: 0.98,
      lastVerifiedAt: minutesFromMockNow(-20),
    },
    unlock: { invites: { required: 2, done: 1 } },
  },
  {
    id: 'd-cursor-cores-month',
    slug: 'cursor-pro-month-for-cores',
    title: 'One month of Cursor Pro for Cores',
    description:
      'Spend Cores from your daily.dev balance and the month of Pro is covered. No card, no invoice.',
    whyPick:
      'The first thing worth spending Cores on that carries a price tag outside daily.dev. If you were going to pay for a month of Pro anyway, this is that month at the cost of a balance you earned by showing up.',
    brand: brands.cursor,
    media: brandMedia(brands.cursor, 'Cursor logo'),
    type: DealType.Exclusive,
    state: DealState.Locked,
    value: { label: '1 month Pro', savingsUsd: 20 },
    partnerUrl: 'https://cursor.com/pricing',
    isCommissioned: false,
    publishedAt: daysFromMockNow(-5),
    updatedAt: hoursFromMockNow(-4),
    validFrom: daysFromMockNow(-5),
    validThrough: daysFromMockNow(55),
    priceCurrency: 'USD',
    discountAmount: 20,
    terms:
      'Cores are deducted when the licence is issued. One month per member, and the Cores are not refundable once the licence lands.',
    caveats: [
      caveat(
        DealCaveatKind.NewCustomersOnly,
        'New Pro subscribers only',
        'New Pro subscribers only. An account already paying for Cursor Pro cannot swap this month in.',
      ),
      caveat(
        DealCaveatKind.SingleUse,
        'One month per member',
        'One month per member. A second unlock on the same account is rejected before any Cores leave your balance.',
      ),
    ],
    redemptionNote:
      'The licence lands on your Cursor account minutes after the Cores clear.',
    categories: ['AI tools'],
    community: {
      upvotes: 1960,
      comments: 154,
      claims: 480,
      worksRate: 0.97,
      lastVerifiedAt: hoursFromMockNow(-4),
    },
    unlock: { cores: { cost: 5000 } },
  },
  {
    id: 'd-raycast-members-year',
    slug: 'raycast-pro-year-members-only',
    title: 'A year of Raycast Pro, members only',
    description:
      'Twelve months of Pro at no cost. Pay in Cores today, or bring three developers in and pay nothing at all.',
    whyPick:
      'A year is long enough that the launcher stops being a novelty and becomes how you open everything. Two routes to the same licence: Cores if you have the balance, invites if you have the friends.',
    brand: brands.raycast,
    media: brandMedia(brands.raycast, 'Raycast logo'),
    type: DealType.Exclusive,
    state: DealState.Locked,
    value: { label: '1 year Pro', savingsUsd: 96 },
    partnerUrl: 'https://raycast.com/pro',
    isCommissioned: false,
    publishedAt: daysFromMockNow(-7),
    updatedAt: hoursFromMockNow(-9),
    validFrom: daysFromMockNow(-7),
    validThrough: daysFromMockNow(46),
    priceCurrency: 'USD',
    discountAmount: 96,
    terms:
      'One licence per member on either route. Invites count once the developer finishes signup. Cores are deducted when the licence is issued.',
    caveats: [
      caveat(
        DealCaveatKind.DoesNotStack,
        'The two routes do not stack',
        'Paying in Cores and inviting three developers does not add up to two years. Whichever route you finish first issues the licence, and the other one closes on your account.',
      ),
      caveat(
        DealCaveatKind.SingleUse,
        'One licence per member',
        'One licence per member. It cannot be passed to a teammate or to a second Raycast account.',
      ),
    ],
    redemptionNote:
      'Sign in to daily.dev first. The licence lands on the Raycast account tied to your email.',
    categories: ['Productivity'],
    community: {
      upvotes: 2280,
      comments: 187,
      claims: 340,
      worksRate: 0.95,
      lastVerifiedAt: hoursFromMockNow(-9),
    },
    unlock: { cores: { cost: 24000 }, invites: { required: 3, done: 1 } },
  },
  {
    id: 'd-monday-free-months',
    slug: 'monday-3-months-free',
    title: '3 months of monday dev, free',
    description:
      'Sprint boards, roadmaps and dashboards for a full quarter without a card.',
    whyPick:
      'A full quarter is long enough to see whether the boards stay current or rot. It converts to paid on its own, so put the cancellation date in your calendar the day you sign up.',
    brand: brands.monday,
    media: brandMedia(brands.monday, 'monday.com logo'),
    type: DealType.FreeMonths,
    state: DealState.Available,
    value: { label: '3 mo free', savingsUsd: 90 },
    partnerUrl: 'https://monday.com/dev',
    isCommissioned: true,
    publishedAt: daysFromMockNow(-19),
    updatedAt: hoursFromMockNow(-5),
    validFrom: daysFromMockNow(-19),
    validThrough: daysFromMockNow(41),
    priceCurrency: 'USD',
    discountAmount: 90,
    terms: 'New accounts only. Converts to the paid plan unless cancelled.',
    caveats: [
      caveat(
        DealCaveatKind.NewCustomersOnly,
        'New accounts only',
        'New accounts only. An existing monday.com account will not pick the offer up.',
      ),
      caveat(
        DealCaveatKind.AutoRenews,
        'Converts to paid',
        'It converts to the paid plan when the three months end. Cancel before then or you get billed.',
      ),
    ],
    redemptionNote:
      'Choose monday dev at signup. The three months apply without a code.',
    categories: ['Productivity'],
    community: {
      upvotes: 318,
      comments: 27,
      claims: 940,
      worksRate: 0.88,
      lastVerifiedAt: hoursFromMockNow(-5),
    },
  },
  {
    id: 'd-digitalocean-credit',
    slug: 'digitalocean-200-credit',
    title: '$200 DigitalOcean credit for 60 days',
    description:
      'Enough droplets, databases and bandwidth to take a side project all the way to launch.',
    whyPick:
      'Two hundred dollars covers a droplet, a managed Postgres and the bandwidth of a side project nobody visits yet. The pricing page stays readable when the credit runs out, which is the part that matters.',
    isCommunityPick: true,
    brand: brands.digitalocean,
    media: brandMedia(brands.digitalocean, 'DigitalOcean logo'),
    type: DealType.Credit,
    state: DealState.Available,
    value: { label: '$200 free', savingsUsd: 200 },
    partnerUrl: 'https://digitalocean.com/free-trial-offer',
    isCommissioned: true,
    publishedAt: daysFromMockNow(-1),
    updatedAt: minutesFromMockNow(-12),
    claimByAt: daysFromMockNow(21),
    validFrom: daysFromMockNow(-1),
    validThrough: daysFromMockNow(89),
    priceCurrency: 'USD',
    discountAmount: 200,
    terms: 'New accounts only. Unused credit expires after 60 days.',
    caveats: [
      caveat(
        DealCaveatKind.CreditExpires,
        'Credit expires in 60 days',
        'Unused credit expires 60 days after signup. Whatever is left goes back to DigitalOcean, and there is no extension.',
      ),
      caveat(
        DealCaveatKind.NewCustomersOnly,
        'New accounts only',
        'New accounts only. An existing DigitalOcean account cannot claim it, even on a new team.',
      ),
    ],
    redemptionNote:
      'The credit lands in Billing once you add a payment method.',
    categories: ['Cloud'],
    community: {
      upvotes: 2140,
      comments: 176,
      claims: 8420,
      worksRate: 0.97,
      lastVerifiedAt: minutesFromMockNow(-12),
    },
  },
  {
    id: 'd-amazon-keyboard',
    slug: 'amazon-mechanical-keyboard-deal',
    title: '25% off a low profile mechanical keyboard',
    description:
      'A quiet linear board that survives open plan offices, discounted for the week.',
    whyPick:
      'Low profile linears are the compromise that keeps an open plan office quiet. The seller sets this price, so it can move between the moment you read this and the moment you check out.',
    brand: brands.amazon,
    media: {
      kind: DealMediaKind.Product,
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Varmilo_VA87MR_%2821447336176%29.jpg/1280px-Varmilo_VA87MR_%2821447336176%29.jpg',
      alt: 'A backlit low profile mechanical keyboard with pale green keycaps on a wooden desk',
      isRepresentative: true,
      credit: 'Nick Bair, CC BY-SA 2.0, via Wikimedia Commons',
    },
    type: DealType.Affiliate,
    state: DealState.Available,
    value: { label: '-25%', savingsUsd: 32 },
    partnerUrl: 'https://amazon.com/s?k=low+profile+mechanical+keyboard',
    isCommissioned: true,
    publishedAt: daysFromMockNow(-5),
    updatedAt: hoursFromMockNow(-3),
    validFrom: daysFromMockNow(-5),
    validThrough: daysFromMockNow(9),
    priceCurrency: 'USD',
    discountPercent: 25,
    terms:
      'Price set by the seller and can change at any time. Ships to the US and Canada only.',
    caveats: [
      caveat(
        DealCaveatKind.RegionLimited,
        'US and Canada only',
        'The listing ships to the US and Canada only. Other regions see a different seller and a different price.',
      ),
    ],
    redemptionNote:
      'The price is already discounted in the cart. There is no code.',
    categories: ['Hardware'],
    community: {
      upvotes: 421,
      comments: 33,
      claims: 1105,
      worksRate: 0.9,
      lastVerifiedAt: hoursFromMockNow(-3),
    },
  },
  {
    id: 'd-amazon-gift-card',
    slug: 'amazon-10-gift-card',
    title: '$10 Amazon gift card',
    description:
      'A small thank you drop for the community. Fifty cards, first come first served.',
    whyPick:
      'There is nothing to evaluate here, it is ten dollars. The only catch is the pool, which empties in hours rather than days.',
    brand: brands.amazon,
    media: giftCardArtwork(brands.amazon, 'Amazon gift card artwork'),
    type: DealType.GiftCard,
    state: DealState.Available,
    value: { label: '$10', savingsUsd: 10 },
    partnerUrl: 'https://amazon.com/gift-cards',
    isCommissioned: false,
    publishedAt: daysFromMockNow(-3),
    updatedAt: minutesFromMockNow(-8),
    validFrom: daysFromMockNow(-3),
    validThrough: daysFromMockNow(11),
    priceCurrency: 'USD',
    discountAmount: 10,
    terms: 'One card per account. Delivered by email within 24 hours.',
    caveats: [
      caveat(
        DealCaveatKind.SingleUse,
        'One card per account',
        'One card per account. A second claim from the same account is dropped.',
      ),
    ],
    redemptionNote: 'The card arrives by email within 24 hours of claiming.',
    categories: ['Coffee & gifts'],
    community: {
      upvotes: 690,
      comments: 45,
      claims: 43,
      worksRate: 1,
      lastVerifiedAt: minutesFromMockNow(-8),
    },
    pool: { total: 50, left: 7 },
  },
  {
    id: 'd-starbucks-gift-card',
    slug: 'starbucks-25-coffee-card',
    title: '$25 Starbucks card for your next deploy day',
    description:
      'Coffee on us for the release week. The drop ran out faster than the last one.',
    whyPick:
      'Small, easy and gone. It only works in US stores, which is why the drop lands unevenly across the community.',
    brand: brands.starbucks,
    media: giftCardArtwork(brands.starbucks, 'Starbucks gift card artwork'),
    type: DealType.GiftCard,
    state: DealState.SoldOut,
    value: { label: '$25', savingsUsd: 25 },
    partnerUrl: 'https://starbucks.com/gift',
    isCommissioned: false,
    publishedAt: daysFromMockNow(-14),
    updatedAt: daysFromMockNow(-1),
    validFrom: daysFromMockNow(-14),
    priceCurrency: 'USD',
    discountAmount: 25,
    terms:
      'One card per account while stock lasts. Redeemable at US Starbucks stores only.',
    caveats: [
      caveat(
        DealCaveatKind.RegionLimited,
        'US stores only',
        'The card is redeemable at US Starbucks stores only. It will not scan anywhere else.',
      ),
      caveat(
        DealCaveatKind.SingleUse,
        'One card per account',
        'One card per account, for as long as the drop has stock.',
      ),
    ],
    redemptionNote: 'The card arrives by email within 24 hours of claiming.',
    categories: ['Coffee & gifts'],
    community: {
      upvotes: 1188,
      comments: 97,
      claims: 200,
      worksRate: 1,
      lastVerifiedAt: daysFromMockNow(-1),
    },
    pool: { total: 200, left: 0 },
  },
  {
    id: 'd-vercel-exclusive',
    slug: 'vercel-pro-members-only',
    title: 'Vercel Pro for a year at member pricing',
    description:
      'Negotiated for daily.dev members only. Not listed anywhere else.',
    whyPick:
      'Pro pricing is the part that stings for solo devs shipping one real app, and this is the same plan at a member rate. The account age check rules out anyone who signed up today, so it rewards people who were already here.',
    isCommunityPick: true,
    brand: brands.vercel,
    media: brandMedia(brands.vercel, 'Vercel logo'),
    type: DealType.Exclusive,
    state: DealState.Available,
    value: { label: 'Members only', savingsUsd: 120 },
    partnerUrl: 'https://vercel.com/pricing',
    isCommissioned: false,
    publishedAt: daysFromMockNow(-8),
    updatedAt: minutesFromMockNow(-48),
    validFrom: daysFromMockNow(-8),
    validThrough: daysFromMockNow(52),
    priceCurrency: 'USD',
    discountAmount: 120,
    terms:
      'Requires a daily.dev account at least 30 days old. One redemption per member.',
    caveats: [
      caveat(
        DealCaveatKind.AccountAgeRequired,
        'Account 30 days or older',
        'Your daily.dev account has to be at least 30 days old. A signup made to claim this will not pass the check.',
      ),
      caveat(
        DealCaveatKind.SingleUse,
        'One redemption per member',
        'One redemption per member. The member rate cannot be passed to a teammate.',
      ),
    ],
    redemptionNote:
      'Sign in to daily.dev first. The member rate shows on the Vercel checkout.',
    categories: ['Cloud'],
    community: {
      upvotes: 1876,
      comments: 148,
      claims: 720,
      worksRate: 0.99,
      lastVerifiedAt: minutesFromMockNow(-48),
    },
  },
  {
    id: 'd-copilot-free-months',
    slug: 'github-copilot-2-months-free',
    title: '2 months of GitHub Copilot Pro, free',
    description:
      'Autocomplete that actually knows your repo, on the house for two months.',
    whyPick:
      'Two months is long enough to learn whether the suggestions save you time or just keep your hands busy. Cancelling before renewal costs nothing.',
    isCommunityPick: true,
    brand: brands.github,
    media: brandMedia(brands.github, 'GitHub logo'),
    type: DealType.FreeMonths,
    state: DealState.Claimed,
    value: { label: '2 mo free', savingsUsd: 20 },
    code: 'COPILOT2FREE',
    partnerUrl: 'https://github.com/features/copilot',
    isCommissioned: false,
    publishedAt: daysFromMockNow(-9),
    updatedAt: minutesFromMockNow(-18),
    validFrom: daysFromMockNow(-9),
    validThrough: daysFromMockNow(51),
    priceCurrency: 'USD',
    discountAmount: 20,
    terms:
      'New Copilot subscribers only. A card is required at signup. Cancel any time before renewal.',
    caveats: [
      caveat(
        DealCaveatKind.NewCustomersOnly,
        'New subscribers only',
        'New Copilot subscribers only. A lapsed subscription still counts as existing.',
      ),
      caveat(
        DealCaveatKind.CardRequired,
        'Card required',
        'A card goes on file at signup, before the free months start.',
      ),
      caveat(
        DealCaveatKind.AutoRenews,
        'Renews automatically',
        'It renews at the standard Pro rate when the two months end unless you cancel first.',
      ),
    ],
    redemptionNote:
      'Redeem the code in GitHub billing settings, not on the Copilot page.',
    categories: ['AI tools'],
    community: {
      upvotes: 2450,
      comments: 210,
      claims: 6140,
      worksRate: 0.94,
      lastVerifiedAt: minutesFromMockNow(-18),
    },
  },
  {
    id: 'd-raycast-code',
    slug: 'raycast-pro-40-off',
    title: '40% off Raycast Pro',
    description:
      'Launcher, clipboard history and AI commands, at the best rate of the year.',
    whyPick:
      'The free tier already replaces Spotlight, so only take Pro if you have hit its limits. If you have, clipboard history alone earns the yearly price back.',
    brand: brands.raycast,
    media: brandMedia(brands.raycast, 'Raycast logo'),
    type: DealType.PromoCode,
    state: DealState.Available,
    value: { label: '-40%', savingsUsd: 38 },
    code: 'RAYDAILY40',
    partnerUrl: 'https://raycast.com/pro',
    isCommissioned: true,
    publishedAt: daysFromMockNow(-7),
    updatedAt: hoursFromMockNow(-2),
    validFrom: daysFromMockNow(-7),
    validThrough: daysFromMockNow(23),
    priceCurrency: 'USD',
    discountPercent: 40,
    terms: 'Annual plans only. New subscribers.',
    caveats: [
      caveat(
        DealCaveatKind.AnnualPlanOnly,
        'Annual plan only',
        'It applies to the annual plan only. The monthly plan rejects the code at checkout.',
      ),
      caveat(
        DealCaveatKind.NewCustomersOnly,
        'New subscribers only',
        'New subscribers only. An existing Pro subscription cannot be repriced with it.',
      ),
    ],
    redemptionNote:
      'Switch to the annual plan first, then paste the code at checkout.',
    categories: ['Productivity'],
    community: {
      upvotes: 1042,
      comments: 76,
      claims: 2260,
      worksRate: 0.95,
      lastVerifiedAt: hoursFromMockNow(-2),
    },
  },
  {
    id: 'd-notion-free-months',
    slug: 'notion-plus-6-months-free',
    title: '6 months of Notion Plus with AI',
    description:
      'Docs, specs and a wiki your team might actually keep up to date.',
    whyPick:
      'Six months is long enough for a wiki habit to stick or to prove it never will. The 10 seat cap means it fits a small team and nothing larger.',
    brand: brands.notion,
    media: brandMedia(brands.notion, 'Notion logo'),
    type: DealType.FreeMonths,
    state: DealState.Available,
    value: { label: '6 mo free', savingsUsd: 60 },
    partnerUrl: 'https://notion.so/startups',
    isCommissioned: true,
    publishedAt: daysFromMockNow(-22),
    updatedAt: hoursFromMockNow(-6),
    validFrom: daysFromMockNow(-22),
    validThrough: daysFromMockNow(38),
    priceCurrency: 'USD',
    discountAmount: 60,
    terms: 'New workspaces under 10 seats. Verified by email domain.',
    caveats: [
      caveat(
        DealCaveatKind.NewCustomersOnly,
        'New workspaces only',
        'New workspaces only. An existing Notion workspace cannot be moved onto the offer.',
      ),
      caveat(
        DealCaveatKind.SeatLimit,
        'Under 10 seats',
        'It caps at 10 seats. A larger team is quoted at the standard Plus rate.',
      ),
    ],
    redemptionNote:
      'Apply through the startups form. Approval lands by email, usually the same day.',
    categories: ['Productivity'],
    community: {
      upvotes: 588,
      comments: 41,
      claims: 1490,
      worksRate: 0.87,
      lastVerifiedAt: hoursFromMockNow(-6),
    },
  },
  {
    id: 'd-figma-expiring',
    slug: 'figma-professional-35-off',
    title: '35% off Figma Professional',
    description:
      'The handoff tool your designer already lives in, cheaper until the weekend.',
    whyPick:
      'Only worth paying for if you open other people files more than you draw in them. Dev Mode and version history are what you are actually buying.',
    brand: brands.figma,
    media: brandMedia(brands.figma, 'Figma logo'),
    type: DealType.PromoCode,
    state: DealState.Expiring,
    value: { label: '-35%', savingsUsd: 63 },
    code: 'FIGDAILY35',
    partnerUrl: 'https://figma.com/pricing',
    isCommissioned: true,
    publishedAt: daysFromMockNow(-13),
    updatedAt: minutesFromMockNow(-55),
    expiresAt: hoursFromMockNow(52),
    validFrom: daysFromMockNow(-13),
    validThrough: hoursFromMockNow(52),
    priceCurrency: 'USD',
    discountPercent: 35,
    terms: 'Annual billing only. Ends when the timer runs out.',
    caveats: [
      caveat(
        DealCaveatKind.AnnualPlanOnly,
        'Annual billing only',
        'Annual billing only. There is no monthly equivalent of this price.',
      ),
    ],
    redemptionNote:
      'Pick annual billing first, then paste the code at checkout.',
    categories: ['Design'],
    community: {
      upvotes: 733,
      comments: 58,
      claims: 1320,
      worksRate: 0.92,
      lastVerifiedAt: minutesFromMockNow(-55),
    },
  },
  {
    id: 'd-railway-expiring',
    slug: 'railway-25-credit',
    title: '$25 Railway credit for weekend builds',
    description:
      'Deploy a service, a worker and a database with room to spare.',
    whyPick:
      'Twenty five dollars covers a weekend of real deploys rather than a toy one. The clock starts the moment you claim it, so claiming ahead of a free weekend wastes most of it.',
    brand: brands.railway,
    media: brandMedia(brands.railway, 'Railway logo'),
    type: DealType.Credit,
    state: DealState.Expiring,
    value: { label: '$25 free', savingsUsd: 25 },
    partnerUrl: 'https://railway.app/pricing',
    isCommissioned: false,
    publishedAt: daysFromMockNow(-10),
    updatedAt: hoursFromMockNow(-1),
    expiresAt: hoursFromMockNow(20),
    validFrom: daysFromMockNow(-10),
    validThrough: hoursFromMockNow(20),
    priceCurrency: 'USD',
    discountAmount: 25,
    terms: 'New accounts only. Credit expires 30 days after claim.',
    caveats: [
      caveat(
        DealCaveatKind.CreditExpires,
        'Credit expires in 30 days',
        'The credit expires 30 days after you claim it. A project that slips past a month loses whatever is left.',
      ),
      caveat(
        DealCaveatKind.NewCustomersOnly,
        'New accounts only',
        'New accounts only. An existing Railway account will not pick the credit up.',
      ),
    ],
    redemptionNote:
      'The credit lands on your Railway billing page after you add a card.',
    categories: ['Cloud'],
    community: {
      upvotes: 466,
      comments: 29,
      claims: 870,
      worksRate: 0.89,
      lastVerifiedAt: hoursFromMockNow(-1),
    },
  },
  {
    id: 'd-sentry-expired',
    slug: 'sentry-50-credit',
    title: '$50 Sentry credit for error monitoring',
    description:
      'This one ran during the spring drop and is closed now. Similar credits come back most quarters.',
    whyPick:
      'Sentry credits come back most quarters, so this is worth watching rather than chasing. Error monitoring only earns its price once you have users who notice outages before you do.',
    brand: brands.sentry,
    media: brandMedia(brands.sentry, 'Sentry logo'),
    type: DealType.Credit,
    state: DealState.Expired,
    value: { label: '$50 free', savingsUsd: 50 },
    partnerUrl: 'https://sentry.io/pricing',
    isCommissioned: false,
    publishedAt: daysFromMockNow(-52),
    updatedAt: daysFromMockNow(-3),
    expiresAt: hoursFromMockNow(-72),
    validFrom: daysFromMockNow(-52),
    validThrough: hoursFromMockNow(-72),
    priceCurrency: 'USD',
    discountAmount: 50,
    terms: 'Offer closed.',
    caveats: [],
    categories: ['Dev tools'],
    community: {
      upvotes: 512,
      comments: 37,
      claims: 1640,
      worksRate: 0.85,
      lastVerifiedAt: daysFromMockNow(-4),
    },
  },
  {
    id: 'd-neon-promoted',
    slug: 'neon-50-credit',
    title: '$50 Neon credit on serverless Postgres',
    description:
      'Branching databases that fork like git. Credit applies to any paid plan.',
    whyPick:
      'Database branching genuinely changes how you test migrations. The credit only attaches on a paid plan, so the free tier gets you nothing here.',
    brand: brands.neon,
    media: brandMedia(brands.neon, 'Neon logo'),
    type: DealType.Credit,
    state: DealState.Available,
    value: { label: '$50 free', savingsUsd: 50 },
    partnerUrl: 'https://neon.tech/pricing',
    isCommissioned: true,
    publishedAt: daysFromMockNow(-16),
    updatedAt: hoursFromMockNow(-3),
    validFrom: daysFromMockNow(-16),
    validThrough: daysFromMockNow(44),
    priceCurrency: 'USD',
    discountAmount: 50,
    terms: 'New paid plans only. Credit applied at checkout.',
    caveats: [
      caveat(
        DealCaveatKind.NewCustomersOnly,
        'New paid plans only',
        'New paid plans only. An account already on a paid plan cannot apply it.',
      ),
      caveat(
        DealCaveatKind.MinimumSpend,
        'Paid plan required',
        'The free tier does not qualify. You have to be on a paid plan for the credit to attach.',
      ),
    ],
    redemptionNote: 'The credit is applied at checkout when you pick a plan.',
    categories: ['Cloud'],
    community: {
      upvotes: 274,
      comments: 19,
      claims: 610,
      worksRate: 0.93,
      lastVerifiedAt: hoursFromMockNow(-3),
    },
    isPromoted: true,
  },
  {
    id: 'd-warp-boost',
    slug: 'warp-pro-community-boost',
    title: 'Warp Pro gets cheaper the more of us claim it',
    description:
      'A group rate. Every claim pushes the whole community to the next discount tier.',
    whyPick:
      'Warp is a real terminal upgrade if you live in blocks and history search. If you have your zsh config exactly how you like it, skip this one.',
    brand: brands.warp,
    media: brandMedia(brands.warp, 'Warp logo'),
    type: DealType.PromoCode,
    state: DealState.Available,
    value: { label: '-25%', savingsUsd: 30 },
    code: 'WARPCREW25',
    partnerUrl: 'https://warp.dev/pricing',
    isCommissioned: false,
    publishedAt: daysFromMockNow(-3),
    updatedAt: minutesFromMockNow(-25),
    validFrom: daysFromMockNow(-3),
    validThrough: daysFromMockNow(27),
    priceCurrency: 'USD',
    discountPercent: 25,
    terms:
      'Annual plans only. The tier reached at the end of the month applies to every claim.',
    caveats: [
      caveat(
        DealCaveatKind.AnnualPlanOnly,
        'Annual plan only',
        'Annual plans only. The monthly plan is not part of the group rate.',
      ),
      caveat(
        DealCaveatKind.DoesNotStack,
        'Does not stack',
        'The group rate replaces any other Warp discount rather than adding to it. The group rate is the one that gets applied, even in the months it lands lower than the discount you already had.',
      ),
    ],
    redemptionNote:
      'Paste the code at checkout. Your final rate is set at the end of the month.',
    categories: ['Dev tools'],
    community: {
      upvotes: 812,
      comments: 64,
      claims: 640,
      worksRate: 0.94,
      lastVerifiedAt: minutesFromMockNow(-25),
    },
    boost: {
      tiers: [
        { claims: 0, percent: 20 },
        { claims: 500, percent: 25 },
        { claims: 1000, percent: 30 },
      ],
      currentClaims: 640,
    },
  },
  {
    id: 'd-frontend-masters-claimed',
    slug: 'frontend-masters-3-months-free',
    title: '3 months of Frontend Masters',
    description:
      'The full course library, including the deep dives on TypeScript and system design.',
    whyPick:
      'The TypeScript and system design tracks are the reason people renew. Three months is about one full track at a pace you can hold alongside a job.',
    brand: brands.frontendMasters,
    media: brandMedia(brands.frontendMasters, 'Frontend Masters logo'),
    type: DealType.FreeMonths,
    state: DealState.Claimed,
    value: { label: '3 mo free', savingsUsd: 117 },
    code: 'FEMDAILY3',
    partnerUrl: 'https://frontendmasters.com/join',
    isCommissioned: true,
    publishedAt: daysFromMockNow(-25),
    updatedAt: minutesFromMockNow(-40),
    validFrom: daysFromMockNow(-25),
    validThrough: daysFromMockNow(35),
    priceCurrency: 'USD',
    discountAmount: 117,
    terms: 'New members only. Card required, cancel before renewal.',
    caveats: [
      caveat(
        DealCaveatKind.NewCustomersOnly,
        'New members only',
        'New members only. A lapsed Frontend Masters account does not qualify again.',
      ),
      caveat(
        DealCaveatKind.CardRequired,
        'Card required',
        'A card goes on file before the three months start, even though nothing is charged yet.',
      ),
      caveat(
        DealCaveatKind.AutoRenews,
        'Renews automatically',
        'It renews at the standard rate on month four. Cancel before then or you pay for a full year.',
      ),
    ],
    redemptionNote:
      'Paste the code at checkout. A card is required even for the free months.',
    categories: ['Courses'],
    community: {
      upvotes: 1320,
      comments: 104,
      claims: 2980,
      worksRate: 0.96,
      lastVerifiedAt: minutesFromMockNow(-40),
    },
  },
  {
    id: 'd-udemy-affiliate',
    slug: 'udemy-developer-bundle',
    title: '80% off the developer course bundle',
    description:
      'Twelve courses on Go, Kubernetes and system design for the price of one.',
    whyPick:
      'Twelve courses for the price of one is a fair trade if two of them are ones you would have bought. Udemy runs site wide sales often enough that waiting sometimes beats this.',
    brand: brands.udemy,
    media: brandMedia(brands.udemy, 'Udemy logo'),
    type: DealType.Affiliate,
    state: DealState.Available,
    value: { label: '-80%', savingsUsd: 140 },
    partnerUrl: 'https://udemy.com/courses/development',
    isCommissioned: true,
    publishedAt: daysFromMockNow(-28),
    updatedAt: hoursFromMockNow(-7),
    validFrom: daysFromMockNow(-28),
    validThrough: daysFromMockNow(14),
    priceCurrency: 'USD',
    discountPercent: 80,
    terms:
      'Bundle pricing set by Udemy and changes without notice. It does not stack with site wide sales.',
    caveats: [
      caveat(
        DealCaveatKind.DoesNotStack,
        'Does not stack with sales',
        'It does not stack with a Udemy site wide sale. Udemy charges the lower of the two prices, so during a sale you pay the sale price and this bundle rate drops off.',
      ),
    ],
    redemptionNote:
      'The price is already applied through the link. There is no code.',
    categories: ['Courses'],
    community: {
      upvotes: 356,
      comments: 48,
      claims: 1720,
      worksRate: 0.82,
      lastVerifiedAt: hoursFromMockNow(-7),
    },
  },
  {
    id: 'd-logitech-claimed',
    slug: 'logitech-mx-master-20-off',
    title: '20% off the Logitech MX Master 4',
    description: 'The mouse that ends the trackpad wrist ache, one fifth off.',
    whyPick:
      'The MX Master is the mouse people stop replacing. It ships from the Logitech store only, so the discount is worth less if you are outside its delivery list.',
    brand: brands.logitech,
    media: {
      kind: DealMediaKind.Product,
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Logitech_MX_Master_3S_HS01.jpg/1280px-Logitech_MX_Master_3S_HS01.jpg',
      alt: 'A black Logitech MX Master wireless mouse photographed from above on a white surface',
      isRepresentative: true,
      credit: 'Hayden Schiff, CC BY 4.0, via Wikimedia Commons',
    },
    type: DealType.PromoCode,
    state: DealState.Claimed,
    value: { label: '-20%', savingsUsd: 24 },
    code: 'MXDAILY20',
    partnerUrl: 'https://logitech.com/products/mice/mx-master-4',
    isCommissioned: true,
    publishedAt: daysFromMockNow(-31),
    updatedAt: hoursFromMockNow(-4),
    validFrom: daysFromMockNow(-31),
    validThrough: daysFromMockNow(29),
    priceCurrency: 'USD',
    discountPercent: 20,
    terms:
      'One use per customer. Ships from the Logitech store only, which does not deliver to every country.',
    caveats: [
      caveat(
        DealCaveatKind.RegionLimited,
        'Not every country',
        'It ships from the Logitech store, which does not deliver everywhere. Check your country before you claim.',
      ),
      caveat(
        DealCaveatKind.SingleUse,
        'One use per customer',
        'One use per customer. A second mouse on the same account pays full price.',
      ),
    ],
    redemptionNote: 'Paste the code at the Logitech store checkout.',
    categories: ['Hardware'],
    community: {
      upvotes: 604,
      comments: 39,
      claims: 1460,
      worksRate: 0.9,
      lastVerifiedAt: hoursFromMockNow(-4),
    },
  },
];

export const mockClaims: ClaimRecord[] = [
  {
    id: 'claim-d-copilot-free-months',
    dealId: 'd-copilot-free-months',
    claimedAt: hoursFromMockNow(-30),
    status: ClaimStatus.Active,
    code: 'COPILOT2FREE',
  },
  {
    id: 'claim-d-frontend-masters-claimed',
    dealId: 'd-frontend-masters-claimed',
    claimedAt: hoursFromMockNow(-96),
    status: ClaimStatus.Active,
    code: 'FEMDAILY3',
  },
  {
    id: 'claim-d-logitech-claimed',
    dealId: 'd-logitech-claimed',
    claimedAt: hoursFromMockNow(-240),
    status: ClaimStatus.Used,
    code: 'MXDAILY20',
  },
  {
    id: 'claim-d-sentry-expired',
    dealId: 'd-sentry-expired',
    claimedAt: hoursFromMockNow(-900),
    status: ClaimStatus.Expired,
  },
];

export const getDealsByState = (state: DealState): Deal[] =>
  mockDeals.filter((deal) => deal.state === state);

export const getDealsByType = (type: DealType): Deal[] =>
  mockDeals.filter((deal) => deal.type === type);

export const getDealBySlug = (slug: string): Deal | undefined =>
  mockDeals.find((deal) => deal.slug === slug);
