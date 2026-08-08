export enum DealType {
  PromoCode = 'promo_code',
  Credit = 'credit',
  Affiliate = 'affiliate',
  FreeMonths = 'free_months',
  GiftCard = 'gift_card',
  Exclusive = 'exclusive',
}

export enum DealState {
  Available = 'available',
  Claimed = 'claimed',
  Expiring = 'expiring',
  Expired = 'expired',
  Locked = 'locked',
  SoldOut = 'sold_out',
}

export enum ClaimStatus {
  Active = 'active',
  Used = 'used',
  Expired = 'expired',
}

export enum DealAvailability {
  InStock = 'in_stock',
  SoldOut = 'sold_out',
  Expired = 'expired',
}

export interface DealBrand {
  id: string;
  name: string;
  logoUrl: string | null;
  domain: string;
  // Raw brand hex. Only ever applied through an inline style, never a class.
  accent?: string;
}

export enum DealMediaKind {
  Product = 'product',
  Artwork = 'artwork',
  Brand = 'brand',
}

export interface DealMedia {
  kind: DealMediaKind;
  imageUrl: string;
  alt: string;
  // True when the photo shows the product family rather than the exact model.
  isRepresentative?: boolean;
  credit?: string;
}

export interface DealValue {
  label: string;
  savingsUsd?: number;
}

export interface DealCommunity {
  upvotes: number;
  comments: number;
  claims: number;
  worksRate: number;
  lastVerifiedAt: string;
}

export interface DealPool {
  total: number;
  left: number;
}

export interface DealUnlockInvites {
  required: number;
  done: number;
}

export interface DealUnlockCores {
  cost: number;
}

/**
 * The ways a locked deal opens. A deal may offer the invite path, the Cores
 * path, or both, and the reader picks between time and currency.
 */
export interface DealUnlock {
  invites?: DealUnlockInvites;
  cores?: DealUnlockCores;
}

export interface DealBoostTier {
  claims: number;
  percent: number;
}

export interface DealBoost {
  tiers: DealBoostTier[];
  currentClaims: number;
}

export enum DealCaveatKind {
  CreditExpires = 'credit_expires',
  NewCustomersOnly = 'new_customers_only',
  AnnualPlanOnly = 'annual_plan_only',
  DoesNotStack = 'does_not_stack',
  CardRequired = 'card_required',
  AutoRenews = 'auto_renews',
  MinimumSpend = 'minimum_spend',
  SeatLimit = 'seat_limit',
  SingleUse = 'single_use',
  RegionLimited = 'region_limited',
  AccountAgeRequired = 'account_age_required',
}

export interface DealCaveat {
  kind: DealCaveatKind;
  /** Card strip form. Noun phrase, sentence case, no trailing period. */
  label: string;
  /** Detail form. States the restriction, then who it rules out. */
  detail: string;
}

export interface Deal {
  id: string;
  slug: string;
  title: string;
  description: string;
  whyPick?: string;
  isCommunityPick?: boolean;
  brand: DealBrand;
  media?: DealMedia;
  type: DealType;
  state: DealState;
  value: DealValue;
  code?: string;
  partnerUrl: string;
  isCommissioned: boolean;
  publishedAt: string;
  updatedAt: string;
  expiresAt?: string;
  /**
   * The deadline to claim, set only when it lands before the offer's own end.
   * A credit you have to activate this month but can then burn down for sixty
   * days is two clocks, not one.
   */
  claimByAt?: string;
  validFrom?: string;
  validThrough?: string;
  price?: number;
  priceCurrency?: string;
  discountPercent?: number;
  discountAmount?: number;
  terms: string;
  caveats: DealCaveat[];
  /** What the reader has to do, and where the number actually shows up. */
  redemptionNote?: string;
  categories: string[];
  community: DealCommunity;
  pool?: DealPool;
  unlock?: DealUnlock;
  boost?: DealBoost;
  isPromoted?: boolean;
}

export interface ClaimRecord {
  id: string;
  dealId: string;
  claimedAt: string;
  status: ClaimStatus;
  code?: string;
}
