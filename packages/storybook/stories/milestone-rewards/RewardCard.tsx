import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  LockIcon,
  OpenLinkIcon,
  TimerIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { Offer } from './data';

export enum RewardCardVariant {
  /** One gift, full width of the moment. */
  Hero = 'hero',
  /** Side by side, when the user picks between gifts. */
  Tile = 'tile',
  /** The vault list and any inline placement. */
  Row = 'row',
  /** Landscape: brand art left, offer and claim right. For wide popups. */
  Banner = 'banner',
}

export enum RewardCardState {
  Idle = 'idle',
  Selected = 'selected',
  Claiming = 'claiming',
  Claimed = 'claimed',
  Expired = 'expired',
  PlusOnly = 'plusOnly',
}

const coverHeight: Record<RewardCardVariant, string> = {
  [RewardCardVariant.Hero]: 'h-40',
  [RewardCardVariant.Tile]: 'h-32',
  [RewardCardVariant.Row]: 'h-0',
  [RewardCardVariant.Banner]: 'h-0',
};

const headlineType: Record<RewardCardVariant, string> = {
  [RewardCardVariant.Hero]: 'typo-title2',
  [RewardCardVariant.Tile]: 'typo-callout',
  [RewardCardVariant.Row]: 'typo-callout',
  [RewardCardVariant.Banner]: 'typo-title3',
};

const relativeLuminance = (hex: string): number => {
  const value = hex.replace('#', '');
  const [red, green, blue] = [0, 2, 4].map((offset) =>
    parseInt(value.slice(offset, offset + 2), 16),
  );

  return (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
};

// Notion and Uber are near-black brands. Painted straight onto a dark cover
// they disappear, so the artwork lifts to graphite and the mark flips to white.
const isDarkBrand = (offer: Offer): boolean =>
  relativeLuminance(offer.brandColor) < 0.18;

export const brandCover = (offer: Offer): string => {
  const paint = isDarkBrand(offer) ? '#3B4150' : offer.brandColor;

  return `radial-gradient(120% 120% at 12% 0%, ${paint}F2 0%, ${paint}99 45%, #0F1218 100%)`;
};

export const BrandMark = ({
  offer,
  size = 'md',
}: {
  offer: Offer;
  size?: 'sm' | 'md';
}): ReactElement => {
  const onWhite = isDarkBrand(offer);

  return (
    <span
      style={{
        background: onWhite ? '#FFFFFF' : offer.brandColor,
        color: onWhite ? offer.brandColor : '#FFFFFF',
      }}
      className={classNames(
        'flex shrink-0 items-center justify-center rounded-10 font-bold',
        size === 'md' ? 'h-10 w-10 typo-footnote' : 'h-8 w-8 typo-caption1',
      )}
    >
      {offer.mark}
    </span>
  );
};

const SponsorPill = ({
  offer,
  compact,
}: {
  offer: Offer;
  compact?: boolean;
}): ReactElement => (
  <span className="w-fit max-w-full truncate rounded-8 bg-overlay-secondary-pepper px-2 py-1 uppercase tracking-[0.12em] text-white typo-caption2">
    {compact ? 'Sponsored' : `Gift from ${offer.brand} · sponsored`}
  </span>
);

const ExpiryLabel = ({
  offer,
  className,
}: {
  offer: Offer;
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'flex items-center gap-1 text-text-quaternary typo-caption1',
      className,
    )}
  >
    <TimerIcon size={IconSize.XSmall} />
    Yours for {offer.expiresIn}
  </span>
);

const StatusChip = ({
  tone,
  icon,
  children,
}: {
  tone: 'success' | 'muted';
  icon?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <span
    className={classNames(
      'flex items-center gap-1 rounded-8 px-2 py-1 font-bold typo-caption1',
      tone === 'success'
        ? 'bg-overlay-float-avocado text-accent-avocado-default'
        : 'bg-surface-hover text-text-quaternary',
    )}
  >
    {icon}
    {children}
  </span>
);

const FooterAction = ({
  state,
  claimLabel,
  onClaim,
  fullWidth,
  size = ButtonSize.Small,
}: {
  state: RewardCardState;
  claimLabel: string;
  onClaim?: () => void;
  fullWidth?: boolean;
  size?: ButtonSize;
}): ReactElement => {
  if (state === RewardCardState.Claimed) {
    return (
      <StatusChip
        tone="success"
        icon={<VIcon size={IconSize.XSmall} secondary />}
      >
        Active
      </StatusChip>
    );
  }

  if (state === RewardCardState.Expired) {
    return <StatusChip tone="muted">Expired</StatusChip>;
  }

  if (state === RewardCardState.PlusOnly) {
    return (
      <Button
        className={classNames(fullWidth && 'w-full')}
        size={size}
        variant={ButtonVariant.Secondary}
        icon={<LockIcon />}
        disabled
      >
        Plus only
      </Button>
    );
  }

  return (
    <Button
      className={classNames(fullWidth && 'w-full')}
      size={size}
      variant={ButtonVariant.Primary}
      loading={state === RewardCardState.Claiming}
      onClick={onClaim}
    >
      {claimLabel}
    </Button>
  );
};

export interface RewardCardProps {
  offer: Offer;
  variant?: RewardCardVariant;
  state?: RewardCardState;
  claimLabel?: string;
  onClaim?: () => void;
  /** Trains the next gift. Hidden where there is nowhere to put it. */
  onNotForMe?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const RewardCard = ({
  offer,
  variant = RewardCardVariant.Hero,
  state = RewardCardState.Idle,
  claimLabel = 'Claim gift',
  onClaim,
  onNotForMe,
  className,
  style,
}: RewardCardProps): ReactElement => {
  const isDimmed =
    state === RewardCardState.Expired || state === RewardCardState.PlusOnly;

  if (variant === RewardCardVariant.Banner) {
    return (
      <div
        style={style}
        className={classNames(
          'flex items-stretch overflow-hidden rounded-16 border bg-surface-float',
          state === RewardCardState.Selected
            ? 'border-accent-cabbage-default'
            : 'border-border-subtlest-tertiary',
          isDimmed && 'opacity-60 grayscale',
          className,
        )}
      >
        <div
          style={{ backgroundImage: brandCover(offer) }}
          className={classNames(
            'relative flex w-32 shrink-0 flex-col items-center justify-center gap-2 p-4',
            state === RewardCardState.Claiming && 'mr-sweep overflow-hidden',
          )}
        >
          <BrandMark offer={offer} />
          <span className="font-bold text-white typo-footnote">
            {offer.brand}
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 p-4">
          <div className="flex items-center gap-2">
            <SponsorPill offer={offer} />
            <span className="shrink-0 whitespace-nowrap rounded-8 bg-surface-hover px-2 py-1 font-bold text-text-primary typo-caption1">
              {offer.value}
            </span>
          </div>
          <p className={classNames('font-bold', headlineType[variant])}>
            {offer.headline}
          </p>
          <ExpiryLabel offer={offer} />
        </div>
        <div className="flex shrink-0 flex-col items-end justify-center gap-2 p-4">
          <FooterAction
            state={state}
            claimLabel={claimLabel}
            onClaim={onClaim}
            size={ButtonSize.Large}
          />
          {onNotForMe && state === RewardCardState.Idle && (
            <button
              type="button"
              onClick={onNotForMe}
              className="text-text-quaternary underline decoration-dotted underline-offset-2 typo-caption1 hover:text-text-secondary"
            >
              Not my thing
            </button>
          )}
        </div>
      </div>
    );
  }

  if (variant === RewardCardVariant.Row) {
    return (
      <div
        style={style}
        className={classNames(
          'flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-3',
          isDimmed && 'opacity-60',
          className,
        )}
      >
        <BrandMark offer={offer} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-bold typo-callout">
            {offer.headline}
          </span>
          <span className="flex items-center gap-2 text-text-quaternary typo-caption1">
            {offer.brand} · {offer.value}
            {state === RewardCardState.Idle && (
              <>
                <span aria-hidden>·</span>
                {offer.expiresIn} left
              </>
            )}
          </span>
        </div>
        <FooterAction
          state={state}
          claimLabel={claimLabel}
          onClaim={onClaim}
        />
      </div>
    );
  }

  return (
    <div
      style={style}
      className={classNames(
        'flex flex-col overflow-hidden rounded-16 border bg-surface-float transition-colors',
        state === RewardCardState.Selected
          ? 'border-accent-cabbage-default'
          : 'border-border-subtlest-tertiary',
        isDimmed && 'opacity-60 grayscale',
        className,
      )}
    >
      <div
        style={{ backgroundImage: brandCover(offer) }}
        className={classNames(
          'relative flex flex-col justify-between overflow-hidden p-4',
          coverHeight[variant],
          state === RewardCardState.Claiming && 'mr-sweep',
        )}
      >
        {/* The disclosure owns its own row. Sharing one with the value pill put
            it a pixel from an ellipsis, and this is the line that must never
            truncate. */}
        <SponsorPill
          offer={offer}
          compact={variant === RewardCardVariant.Tile}
        />
        <div className="flex items-end justify-between gap-3">
          <p
            className={classNames(
              'min-w-0 flex-1 font-bold text-white',
              headlineType[variant],
            )}
          >
            {offer.headline}
          </p>
          <span className="shrink-0 whitespace-nowrap rounded-8 bg-overlay-secondary-pepper px-2 py-1 font-bold text-white typo-caption1">
            {offer.value}
          </span>
        </div>
      </div>
      <div
        className={classNames(
          'flex gap-3 p-4',
          // A tile is too narrow to keep the brand and the button on one line
          // without shredding the brand name into an ellipsis.
          variant === RewardCardVariant.Tile
            ? 'flex-col items-stretch'
            : 'items-center',
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <BrandMark offer={offer} />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-bold typo-callout">
              {offer.brand}
            </span>
            <span className="truncate text-text-quaternary typo-caption1">
              {offer.tagline}
            </span>
          </div>
        </div>
        <FooterAction
          state={state}
          claimLabel={claimLabel}
          onClaim={onClaim}
          fullWidth={variant === RewardCardVariant.Tile}
        />
      </div>
      {(state === RewardCardState.Idle ||
        state === RewardCardState.Selected) && (
        <div className="flex items-center justify-between gap-2 border-t border-border-subtlest-tertiary px-4 py-3">
          <ExpiryLabel offer={offer} />
          {onNotForMe && (
            <button
              type="button"
              onClick={onNotForMe}
              className="text-text-quaternary underline decoration-dotted underline-offset-2 typo-caption1 hover:text-text-secondary"
            >
              Not my thing
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/** The terms line every claim surface repeats verbatim. */
export const OfferTerms = ({ offer }: { offer: Offer }): ReactElement => (
  <p className="text-text-quaternary typo-caption1">
    {offer.terms} Offer runs for {offer.expiresIn}. daily.dev earns a commission
    when you claim.
  </p>
);

export const PartnerLink = ({ offer }: { offer: Offer }): ReactElement => (
  <span className="flex items-center gap-1 text-text-quaternary typo-caption1">
    <OpenLinkIcon size={IconSize.XSmall} />
    Opens {offer.brand}. You finish signing up there.
  </span>
);
