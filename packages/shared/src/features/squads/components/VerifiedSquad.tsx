import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Source } from '../../../graphql/sources';
import {
  featuredSquadCardGlow,
  featuredSquadCardShadow,
  verifiedSealCheck,
  verifiedSquadCardBg,
  verifiedSquadCardGlow,
  verifiedSquadCardShadow,
} from '../../../styles/custom';
import { SourceIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { showsVerifiedBadge } from '../lib/features';

export const verifiedSquadLabel = 'Verified Company Squad';

// A scalloped seal with a check, the shape people read as verified.
export const VerifiedSquadSeal = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden
    className={classNames('size-4 shrink-0', className)}
  >
    <path
      fill="currentColor"
      d="M21.60 12.00 Q22.82 14.90 20.31 16.80 Q19.92 19.92 16.80 20.31 Q14.90 22.82 12.00 21.60 Q9.10 22.82 7.20 20.31 Q4.08 19.92 3.69 16.80 Q1.18 14.90 2.40 12.00 Q1.18 9.10 3.69 7.20 Q4.08 4.08 7.20 3.69 Q9.10 1.18 12.00 2.40 Q14.90 1.18 16.80 3.69 Q19.92 4.08 20.31 7.20 Q22.82 9.10 21.60 12.00Z"
    />
    <path
      d="M7.6 12.3l3 3 5.8-6"
      fill="none"
      style={{ stroke: verifiedSealCheck }}
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const VerifiedSquadBadge = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <span
    role="img"
    aria-label={verifiedSquadLabel}
    title={verifiedSquadLabel}
    className="inline-flex shrink-0 text-text-verified"
  >
    <VerifiedSquadSeal className={className} />
  </span>
);

export const VerifiedCompanySquadCard = (): ReactElement => (
  <div
    className="relative flex items-center gap-3 overflow-hidden rounded-16 px-4 py-3"
    style={{
      background: verifiedSquadCardBg,
      boxShadow: verifiedSquadCardShadow,
    }}
  >
    <div
      aria-hidden
      className="absolute inset-0 blur-lg"
      style={{ background: verifiedSquadCardGlow }}
    />
    <VerifiedSquadSeal className="relative size-6 text-text-verified" />
    <span className="relative font-bold text-text-primary typo-callout">
      {verifiedSquadLabel}
    </span>
  </div>
);

export const featuredSquadLabel = 'Featured Squad';

// The Verified card's design in blue, for squads daily.dev features. Gold
// stays the verified color, so the two never read as one thing.
export const FeaturedSquadCard = (): ReactElement => (
  <div
    className="relative flex items-center gap-3 overflow-hidden rounded-16 px-4 py-3"
    style={{
      background: verifiedSquadCardBg,
      boxShadow: featuredSquadCardShadow,
    }}
  >
    <div
      aria-hidden
      className="absolute inset-0 blur-lg"
      style={{ background: featuredSquadCardGlow }}
    />
    <SourceIcon
      secondary
      size={IconSize.Medium}
      className="relative text-accent-water-default"
    />
    <span className="relative font-bold text-text-primary typo-callout">
      {featuredSquadLabel}
    </span>
  </div>
);

/**
 * The seal on a logo's lower right, for places that show a verified squad's
 * logo without its name (feed cards). Wherever the name shows, the seal
 * follows the name instead (`VerifiedSquadBadge`).
 *
 * z-2: cards give every link `z-index: 1` (Card.module.css), which lifts the
 * logo's link above an unindexed absolute seal and hides it.
 */
export const VerifiedLogoCheck = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <span
    role="img"
    aria-label={verifiedSquadLabel}
    title={verifiedSquadLabel}
    className={classNames(
      'pointer-events-none absolute -bottom-1 -right-1 z-2 flex size-3.5 rounded-full bg-background-default p-px text-text-verified',
      className,
    )}
  >
    <VerifiedSquadSeal className="size-full" />
  </span>
);

/**
 * A source's name, with the seal right after it when it is a verified squad.
 * The default placement everywhere a squad's name shows.
 */
export const SourceNameWithSeal = ({
  source,
  className,
}: {
  source: Pick<Source, 'name' | 'features'>;
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'inline-flex max-w-full items-center gap-1',
      className,
    )}
  >
    <span className="truncate">{source.name}</span>
    {showsVerifiedBadge(source) && <VerifiedSquadBadge />}
  </span>
);
