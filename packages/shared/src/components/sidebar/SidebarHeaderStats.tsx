import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../contexts/AuthContext';
import { useReadingStreak } from '../../hooks/streaks';
import { walletUrl } from '../../lib/constants';
import { largeNumberFormat } from '../../lib';
import { formatCurrency } from '../../lib/utils';
import Link from '../utilities/Link';
import { Tooltip } from '../tooltip/Tooltip';
import { IconSize } from '../Icon';
import { CoreIcon, ReadingStreakIcon, ReputationIcon } from '../icons';
import { Typography, TypographyType } from '../typography/Typography';

// Tight, equal slot. `gap-1` (4px) keeps the icon hugging the value
// the same way the streak slot already did. `px-1.5` shaves the side
// inset so a 3-digit value (e.g. `999`) plus the 16px icon frame
// still fits comfortably in the panel's 240px width without truncating.
const slotClass =
  'focus-outline group flex flex-1 items-center justify-center gap-1 px-1.5 py-1.5 transition-colors hover:bg-surface-hover min-w-0';
// `tabular-nums` keeps 1- / 2- / 3-digit values aligned so the row
// doesn't visually jitter as the streak counts up.
const valueClass = 'text-text-primary tabular-nums';
// Wrap each icon in a fixed 16px square so the streak / rep / cores
// glyphs share the same visual footprint. Sized down from 20px so the
// flame-filled streak no longer reads as larger than the lightning
// bolt + cores diamond, which only fill ~60% of their viewBoxes.
const iconBoxClass =
  'flex size-4 shrink-0 items-center justify-center';

type StatSlotProps = {
  ariaLabel: string;
  icon: ReactNode;
  value: string | number;
  href?: string;
};

// Renders a single inline stat. When `href` is provided the slot becomes a
// link; otherwise it renders as a static span so the surrounding card's
// outer link still owns the click target.
const StatSlot = ({
  ariaLabel,
  icon,
  value,
  href,
}: StatSlotProps): ReactElement => {
  const inner = (
    <>
      {icon}
      <Typography bold type={TypographyType.Footnote} className={valueClass}>
        {value}
      </Typography>
    </>
  );

  if (!href) {
    return (
      <span className={slotClass} aria-label={ariaLabel}>
        {inner}
      </span>
    );
  }

  return (
    <Link href={href} passHref>
      <a className={slotClass} aria-label={ariaLabel}>
        {inner}
      </a>
    </Link>
  );
};

const dividerClass = 'w-px self-stretch bg-border-subtlest-quaternary';

// Compact, divided inline stats strip rendered under the user identity row in
// the dedicated home panel. The values stay visible at all sizes (including
// `0`) and the slots share an equal-width row so the strip reads at a glance.
export const SidebarHeaderStats = (): ReactElement | null => {
  const { user } = useAuthContext();
  const { streak, isStreaksEnabled } = useReadingStreak();

  if (!user) {
    return null;
  }

  const reputation = user.reputation ?? 0;
  const balance = user.balance?.amount ?? 0;
  const showStreak = isStreaksEnabled;
  const preciseBalance = formatCurrency(balance, { minimumFractionDigits: 0 });
  const streakValue = streak?.current ?? 0;

  return (
    <div
      className={classNames(
        'flex items-stretch overflow-hidden rounded-12 border border-border-subtlest-quaternary bg-background-default',
      )}
    >
      {showStreak && (
        <>
          <Tooltip content="Reading streak" side="bottom">
            <StatSlot
              ariaLabel={`Current reading streak: ${streakValue}`}
              icon={
                <span className={iconBoxClass} aria-hidden>
                  <ReadingStreakIcon
                    size={IconSize.Size16}
                    className="text-accent-bacon-default"
                  />
                </span>
              }
              value={streakValue}
            />
          </Tooltip>
          <span aria-hidden className={dividerClass} />
        </>
      )}
      <Tooltip content="Reputation" side="bottom">
        <StatSlot
          ariaLabel={`Reputation: ${reputation}`}
          icon={
            <span className={iconBoxClass} aria-hidden>
              <ReputationIcon
                size={IconSize.Size16}
                className="text-accent-onion-default"
              />
            </span>
          }
          value={largeNumberFormat(reputation)}
        />
      </Tooltip>
      <span aria-hidden className={dividerClass} />
      <Tooltip
        content={
          <>
            Wallet
            <br />
            {preciseBalance} Cores
          </>
        }
        side="bottom"
      >
        <StatSlot
          ariaLabel={`Cores wallet: ${preciseBalance}`}
          icon={
            <span className={iconBoxClass} aria-hidden>
              <CoreIcon
                size={IconSize.Size16}
                className="text-accent-cheese-default"
              />
            </span>
          }
          value={largeNumberFormat(balance)}
          href={walletUrl}
        />
      </Tooltip>
    </div>
  );
};
