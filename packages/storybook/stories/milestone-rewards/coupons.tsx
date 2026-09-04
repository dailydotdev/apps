import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { CopyIcon, VIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { Offer } from './data';
import { sponsoredGiftArt } from './data';
import { RewardCardState } from './RewardCard';

// Ten ways to draw the coupon that sits on the right of the streak popup.
//
// Real brand logos (public/brand-logos, pulled from each brand's own icon) and
// real photography (public/offer-art). No invented gradients standing in for a
// product, because a fake-looking coupon is a coupon nobody trusts enough to
// claim.
//
// Every layout answers the same four questions in the same order: who is giving
// it, what is it, what is it worth, how do I take it. They differ in how much
// they say around that.

export enum CouponLayout {
  ListRow = 'listRow',
  PartnerCard = 'partnerCard',
  AppRow = 'appRow',
  Ticket = 'ticket',
  LogoHero = 'logoHero',
  ValueFirst = 'valueFirst',
  GiftBox = 'giftBox',
  WalletCard = 'walletCard',
  PhotoHero = 'photoHero',
  Bullets = 'bullets',
  CodeVoucher = 'codeVoucher',
  Minimal = 'minimal',
}

export interface CouponProps {
  offer: Offer;
  layout?: CouponLayout;
  state?: RewardCardState;
  onClaim?: () => void;
  className?: string;
}

const panel =
  'flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4';

export const brandWash = (offer: Offer): string =>
  `linear-gradient(150deg, ${offer.brandColor}CC 0%, #14161C 100%)`;

export const BrandLogo = ({
  offer,
  size = 56,
  className,
}: {
  offer: Offer;
  size?: number;
  className?: string;
}): ReactElement => (
  <img
    src={offer.logo}
    alt={`${offer.brand} logo`}
    width={size}
    height={size}
    style={{ width: size, height: size }}
    className={classNames(
      'mr-logo shrink-0 rounded-12 object-cover',
      className,
    )}
  />
);

const SponsoredNote = ({
  offer,
  className,
}: {
  offer: Offer;
  className?: string;
}): ReactElement => (
  <span className={classNames('text-text-quaternary typo-caption1', className)}>
    Sponsored by {offer.brand}
  </span>
);

const ClaimButton = ({
  offer,
  state = RewardCardState.Idle,
  label,
  onClaim,
  size = ButtonSize.Large,
  className,
}: {
  offer: Offer;
  state?: RewardCardState;
  label?: string;
  onClaim?: () => void;
  size?: ButtonSize;
  className?: string;
}): ReactElement => {
  if (state === RewardCardState.Claimed) {
    return (
      <span
        className={classNames(
          'flex h-12 items-center justify-center gap-2 rounded-14 bg-overlay-float-avocado font-bold text-accent-avocado-default typo-callout',
          className,
        )}
      >
        <VIcon size={IconSize.Small} secondary />
        Claimed
      </span>
    );
  }

  return (
    <Button
      className={classNames('mr-cta', className)}
      size={size}
      variant={ButtonVariant.Primary}
      loading={state === RewardCardState.Claiming}
      onClick={onClaim}
    >
      {label ?? `Claim ${offer.short}`}
    </Button>
  );
};

// 01. App row. The pattern every developer already knows from an app store:
// icon, name, what you get, worth, one full-width button. Nothing else.
const AppRow = ({ offer, state, onClaim }: CouponProps): ReactElement => (
  <div className={panel}>
    <div className="flex items-center gap-3">
      <BrandLogo offer={offer} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-bold typo-title3">{offer.brand}</span>
        <span className="truncate text-text-tertiary typo-callout">
          {offer.plan}
        </span>
      </div>
      <span className="shrink-0 whitespace-nowrap font-bold text-text-quaternary typo-footnote">
        {offer.value}
      </span>
    </div>
    <ClaimButton
      offer={offer}
      state={state}
      onClaim={onClaim}
      size={ButtonSize.Medium}
      className="w-full"
    />
    <SponsoredNote offer={offer} />
  </div>
);

// 00. List row. The smallest thing that can still be claimed: one line, a small
// button on the end of it, no card around it. This is what the popup uses when
// the gift should not outweigh the streak that earned it.
const ListRow = ({ offer, state, onClaim }: CouponProps): ReactElement => (
  <div className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-2 pr-3 transition-colors duration-150 hover:bg-surface-hover">
    <BrandLogo offer={offer} size={36} />
    <div className="flex min-w-0 flex-1 flex-col">
      <span className="truncate font-bold typo-footnote">
        {offer.headline}
      </span>
      <span className="truncate text-text-quaternary typo-caption1">
        {offer.brand} · {offer.tagline}
      </span>
    </div>
    {state === RewardCardState.Claimed ? (
      <span className="flex shrink-0 items-center gap-1 rounded-8 bg-overlay-float-avocado px-2 py-1 font-bold text-accent-avocado-default typo-caption1">
        <VIcon size={IconSize.XSmall} secondary />
        Claimed
      </span>
    ) : (
      <ClaimButton
        offer={offer}
        state={state}
        onClaim={onClaim}
        size={ButtonSize.Small}
        label="Claim"
        className="shrink-0"
      />
    )}
  </div>
);


// 11. Partner card. The shape the partner's own mock-up uses: their photography
// with the offer written across it, then a bar with the brand mark, the brand
// name, its one-line description and the claim. Every partner writes its own
// offer sentence, so the headline is never templated.
const PartnerCard = ({ offer, state, onClaim }: CouponProps): ReactElement => (
  <div className="flex flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float">
    <div className="relative flex h-40 items-end p-4">
      {offer.photo ? (
        <img
          src={offer.photo}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span
          className="absolute inset-0"
          style={{ backgroundImage: brandWash(offer) }}
        />
      )}
      <span
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(15,18,24,0.25) 0%, rgba(15,18,24,0.85) 100%)',
        }}
      />
      <img
        src={offer.logo}
        alt=""
        className="mr-logo absolute right-4 top-4 h-10 w-10 rounded-10 object-cover"
      />
      <p className="relative max-w-[16ch] font-bold text-white typo-title2">
        {offer.headline}
      </p>
    </div>
    <div className="flex items-center gap-3 p-3">
      <BrandLogo offer={offer} size={40} className="rounded-10" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-bold typo-callout">{offer.brand}</span>
        <span className="truncate text-text-quaternary typo-caption1">
          {offer.tagline}
        </span>
      </div>
      <ClaimButton
        offer={offer}
        state={state}
        onClaim={onClaim}
        size={ButtonSize.Medium}
        label="Claim"
        className="shrink-0"
      />
    </div>
  </div>
);

// 02. Ticket. A physical voucher: notched sides, a tear line, the value stamped
// on the stub.
const Ticket = ({ offer, state, onClaim }: CouponProps): ReactElement => (
  <div className="relative overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float">
    <span className="absolute -left-3 top-[7.25rem] h-6 w-6 rounded-full bg-background-default" />
    <span className="absolute -right-3 top-[7.25rem] h-6 w-6 rounded-full bg-background-default" />
    <div className="flex flex-col items-center gap-2 p-5 pb-6">
      <BrandLogo offer={offer} size={48} />
      <span className="font-bold typo-title3">{offer.brand}</span>
      <span className="text-center text-text-tertiary typo-callout">
        {offer.plan}
      </span>
    </div>
    <div className="border-t border-dashed border-border-subtlest-secondary p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <span className="font-bold typo-title2">{offer.short}</span>
        <span className="text-text-quaternary typo-footnote">
          {offer.value}
        </span>
      </div>
      <ClaimButton offer={offer} state={state} onClaim={onClaim} className="w-full" />
    </div>
  </div>
);

// 03. Logo hero. The brand's own colour as a wash, the mark at full size, one
// sentence, one button.
const LogoHero = ({ offer, state, onClaim }: CouponProps): ReactElement => (
  <div className="flex flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary">
    <div
      className="flex flex-col items-center gap-3 p-6"
      style={{
        background: `linear-gradient(160deg, ${offer.brandColor}33 0%, transparent 70%)`,
      }}
    >
      <BrandLogo offer={offer} size={72} />
      <span className="text-center font-bold typo-title2">{offer.short}</span>
      <span className="text-center text-text-tertiary typo-callout">
        {offer.plan} from {offer.brand}
      </span>
    </div>
    <div className="flex flex-col gap-2 bg-surface-float p-4">
      <ClaimButton offer={offer} state={state} onClaim={onClaim} className="w-full" />
      <SponsoredNote offer={offer} className="text-center" />
    </div>
  </div>
);

// 04. Value first. The number is the headline, everything else is a caption.
const ValueFirst = ({ offer, state, onClaim }: CouponProps): ReactElement => (
  <div className={panel}>
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col">
        <span className="font-bold uppercase tracking-[0.08em] typo-mega3">
          {offer.short}
        </span>
        <span className="text-text-tertiary typo-callout">
          of {offer.brand} {offer.plan}
        </span>
      </div>
      <BrandLogo offer={offer} size={44} />
    </div>
    <ClaimButton offer={offer} state={state} onClaim={onClaim} className="w-full" />
    <SponsoredNote offer={offer} />
  </div>
);

// 05. Gift box. Leads with the 3D gift artwork from the streak progression PR,
// so the coupon reads as a present before it reads as a brand.
const GiftBox = ({ offer, state, onClaim }: CouponProps): ReactElement => (
  <div className={classNames(panel, 'items-center text-center')}>
    <img
      src={sponsoredGiftArt}
      alt=""
      className="mr-badge-in h-28 w-28 object-contain"
      style={{ filter: 'drop-shadow(0 10px 30px rgba(177, 75, 215, 0.4))' }}
    />
    <div className="flex flex-col items-center gap-1">
      <span className="font-bold typo-title3">{offer.short}</span>
      <span className="text-text-tertiary typo-callout">
        {offer.brand} {offer.plan}
      </span>
    </div>
    <ClaimButton offer={offer} state={state} onClaim={onClaim} className="w-full" />
    <SponsoredNote offer={offer} />
  </div>
);

// 06. Wallet card. The gift as an object you own, in the shape of a card.
const WalletCard = ({ offer, state, onClaim }: CouponProps): ReactElement => (
  <div className="flex flex-col gap-3">
    <div
      className="flex h-44 flex-col justify-between rounded-16 p-4"
      style={{
        background: `linear-gradient(135deg, ${offer.brandColor} 0%, #14161C 100%)`,
      }}
    >
      <div className="flex items-start justify-between">
        <BrandLogo offer={offer} size={40} />
        <span className="rounded-8 bg-overlay-secondary-pepper px-2 py-1 uppercase tracking-[0.12em] text-white typo-caption2">
          Sponsored
        </span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="font-bold text-white typo-title2">{offer.short}</span>
        <span className="text-white typo-footnote">{offer.value}</span>
      </div>
    </div>
    <ClaimButton offer={offer} state={state} onClaim={onClaim} className="w-full" />
  </div>
);

// 07. Photo hero. The shape the partner's own mock-up used: real photography,
// brand chip on top of it, offer underneath.
const PhotoHero = ({ offer, state, onClaim }: CouponProps): ReactElement => (
  <div className="flex flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float">
    <div className="relative h-32">
      {offer.photo && (
        <img
          src={offer.photo}
          alt=""
          className="h-full w-full object-cover"
        />
      )}
      <span className="absolute inset-0 bg-overlay-secondary-pepper" />
      <span className="absolute bottom-3 left-3 flex items-center gap-2 rounded-10 bg-background-default px-2 py-1">
        <BrandLogo offer={offer} size={20} className="rounded-6 p-0" />
        <span className="font-bold typo-caption1">{offer.brand}</span>
      </span>
    </div>
    <div className="flex flex-col gap-3 p-4">
      <span className="font-bold typo-title3">
        {offer.short} of {offer.plan}
      </span>
      <ClaimButton offer={offer} state={state} onClaim={onClaim} className="w-full" />
      <SponsoredNote offer={offer} />
    </div>
  </div>
);

// 08. Bullets. Everything a sceptic asks before clicking, in three lines.
const Bullets = ({ offer, state, onClaim }: CouponProps): ReactElement => (
  <div className={panel}>
    <div className="flex items-center gap-3">
      <BrandLogo offer={offer} size={44} />
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-bold typo-callout">
          {offer.short} of {offer.brand}
        </span>
        <span className="truncate text-text-quaternary typo-caption1">
          {offer.value}
        </span>
      </div>
    </div>
    <ul className="flex flex-col gap-1.5">
      {offer.bullets.map((bullet) => (
        <li
          key={bullet}
          className="flex items-start gap-2 text-text-tertiary typo-footnote"
        >
          <VIcon
            size={IconSize.XSmall}
            secondary
            className="mt-0.5 shrink-0 text-accent-avocado-default"
          />
          {bullet}
        </li>
      ))}
    </ul>
    <ClaimButton offer={offer} state={state} onClaim={onClaim} className="w-full" />
  </div>
);

// 09. Code voucher. For partners who hand out a code instead of a link.
const CodeVoucher = ({ offer, state, onClaim }: CouponProps): ReactElement => (
  <div className={panel}>
    <div className="flex items-center gap-3">
      <BrandLogo offer={offer} size={44} />
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-bold typo-callout">{offer.brand}</span>
        <span className="truncate text-text-tertiary typo-caption1">
          {offer.short} of {offer.plan}
        </span>
      </div>
    </div>
    <div className="flex items-center justify-between gap-2 rounded-12 border border-dashed border-border-subtlest-secondary px-3 py-2">
      <span className="truncate font-bold tracking-wider typo-callout">
        {offer.code}
      </span>
      <Button
        size={ButtonSize.XSmall}
        variant={ButtonVariant.Tertiary}
        icon={<CopyIcon />}
      >
        Copy
      </Button>
    </div>
    <ClaimButton
      offer={offer}
      state={state}
      onClaim={onClaim}
      label={`Redeem at ${offer.brand}`}
      className="w-full"
    />
    <SponsoredNote offer={offer} />
  </div>
);

// 10. Minimal. No card at all. One line of what, one button, one disclosure.
const Minimal = ({ offer, state, onClaim }: CouponProps): ReactElement => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center gap-3">
      <BrandLogo offer={offer} size={48} />
      <span className="font-bold typo-title3">
        {offer.short} of {offer.brand} {offer.plan}
      </span>
    </div>
    <ClaimButton offer={offer} state={state} onClaim={onClaim} className="w-full" />
    <SponsoredNote offer={offer} />
  </div>
);

const layouts: Record<CouponLayout, (props: CouponProps) => ReactElement> = {
  [CouponLayout.ListRow]: ListRow,
  [CouponLayout.PartnerCard]: PartnerCard,
  [CouponLayout.AppRow]: AppRow,
  [CouponLayout.Ticket]: Ticket,
  [CouponLayout.LogoHero]: LogoHero,
  [CouponLayout.ValueFirst]: ValueFirst,
  [CouponLayout.GiftBox]: GiftBox,
  [CouponLayout.WalletCard]: WalletCard,
  [CouponLayout.PhotoHero]: PhotoHero,
  [CouponLayout.Bullets]: Bullets,
  [CouponLayout.CodeVoucher]: CodeVoucher,
  [CouponLayout.Minimal]: Minimal,
};

export const couponMeta: Record<
  CouponLayout,
  { number: string; name: string; note: string }
> = {
  [CouponLayout.ListRow]: {
    number: '00',
    name: 'List row',
    note: 'One line, a small button, no card. The lightest possible claim.',
  },
  [CouponLayout.PartnerCard]: {
    number: '11',
    name: 'Partner card',
    note: "The partner mock-up's own shape: photo, offer, brand bar, claim.",
  },
  [CouponLayout.AppRow]: {
    number: '01',
    name: 'App row',
    note: 'Icon, name, plan, button. The app store pattern.',
  },
  [CouponLayout.Ticket]: {
    number: '02',
    name: 'Ticket',
    note: 'Notched voucher with a tear line and the value on the stub.',
  },
  [CouponLayout.LogoHero]: {
    number: '03',
    name: 'Logo hero',
    note: 'Brand wash, mark at full size, one sentence.',
  },
  [CouponLayout.ValueFirst]: {
    number: '04',
    name: 'Value first',
    note: 'The duration is the headline, the brand is the caption.',
  },
  [CouponLayout.GiftBox]: {
    number: '05',
    name: 'Gift box',
    note: 'Leads with the 3D gift artwork instead of the brand.',
  },
  [CouponLayout.WalletCard]: {
    number: '06',
    name: 'Wallet card',
    note: 'The gift as an object you own, card shaped.',
  },
  [CouponLayout.PhotoHero]: {
    number: '07',
    name: 'Photo hero',
    note: 'Real photography with a brand chip. The partner mock-up shape.',
  },
  [CouponLayout.Bullets]: {
    number: '08',
    name: 'Bullets',
    note: 'Three facts a sceptic wants before clicking.',
  },
  [CouponLayout.CodeVoucher]: {
    number: '09',
    name: 'Code voucher',
    note: 'For partners who hand out a code instead of a link.',
  },
  [CouponLayout.Minimal]: {
    number: '10',
    name: 'Minimal',
    note: 'No card. One line, one button, one disclosure.',
  },
};

export const couponOrder: CouponLayout[] = [
  CouponLayout.PartnerCard,
  CouponLayout.ListRow,
  CouponLayout.AppRow,
  CouponLayout.Ticket,
  CouponLayout.LogoHero,
  CouponLayout.ValueFirst,
  CouponLayout.GiftBox,
  CouponLayout.WalletCard,
  CouponLayout.PhotoHero,
  CouponLayout.Bullets,
  CouponLayout.CodeVoucher,
  CouponLayout.Minimal,
];

/**
 * List mode. Three or more gifts as single-line rows, so the right side of the
 * popup is a list of small decisions rather than one big pitch. Past four rows
 * the list scrolls inside itself rather than growing the popup.
 */
const VISIBLE_ROWS = 4;

export const CouponList = ({
  offers,
  state = RewardCardState.Idle,
  claimingId,
  claimedIds = [],
  onClaim,
  className,
  withNote,
}: {
  offers: Offer[];
  state?: RewardCardState;
  claimingId?: string;
  claimedIds?: string[];
  onClaim?: (offer: Offer) => void;
  className?: string;
  /** Only outside a popup. Inside one, the popup's own fine print covers it. */
  withNote?: boolean;
}): ReactElement => {
  const rowState = (offer: Offer): RewardCardState => {
    if (claimedIds.includes(offer.id)) {
      return RewardCardState.Claimed;
    }

    return claimingId === offer.id ? state : RewardCardState.Idle;
  };

  return (
    <div className={classNames('flex min-h-0 flex-col gap-2', className)}>
      <div
        className={classNames(
          'flex flex-col gap-2',
          offers.length > VISIBLE_ROWS &&
            'max-h-[16.5rem] overflow-y-auto pr-1',
        )}
      >
        {offers.map((offer) => (
          <ListRow
            key={offer.id}
            offer={offer}
            state={rowState(offer)}
            onClaim={() => onClaim?.(offer)}
          />
        ))}
      </div>
      {withNote && (
        <span className="text-text-quaternary typo-caption1">
          Sponsored offers. daily.dev earns a commission when you claim one.
        </span>
      )}
    </div>
  );
};

export const Coupon = ({
  layout = CouponLayout.AppRow,
  className,
  ...props
}: CouponProps): ReactElement => {
  const Layout = layouts[layout];

  return (
    <div className={className}>
      <Layout {...props} layout={layout} />
    </div>
  );
};
