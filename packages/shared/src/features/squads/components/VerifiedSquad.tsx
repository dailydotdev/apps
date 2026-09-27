import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  verifiedSquadCardBg,
  verifiedSquadCardGlow,
  verifiedSquadCardShadow,
} from '../../../styles/custom';

export const verifiedSquadLabel = 'Verified Company Squad';

// A scalloped seal with a check, the shape people read as verified. The
// check is cut in the page background so the seal works on any surface.
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
      stroke="var(--theme-background-default)"
      strokeWidth="2.2"
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
    className="inline-flex shrink-0 text-accent-cabbage-default"
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
    <VerifiedSquadSeal className="relative size-6 text-accent-cabbage-default" />
    <span className="relative font-bold text-text-primary typo-callout">
      {verifiedSquadLabel}
    </span>
  </div>
);
