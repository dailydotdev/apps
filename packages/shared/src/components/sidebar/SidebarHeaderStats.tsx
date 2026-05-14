import type { MouseEvent, ReactElement, ReactNode } from 'react';
import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../contexts/AuthContext';
import { useReadingStreak } from '../../hooks/streaks';
import { useLogContext } from '../../contexts/LogContext';
import { walletUrl } from '../../lib/constants';
import { largeNumberFormat } from '../../lib';
import { formatCurrency } from '../../lib/utils';
import { LogEvent } from '../../lib/log';
import { isTesting } from '../../lib/constants';
import Link from '../utilities/Link';
import { Tooltip } from '../tooltip/Tooltip';
import { SimpleTooltip } from '../tooltips';
import { IconSize } from '../Icon';
import { CoreIcon, ReadingStreakIcon, ReputationIcon } from '../icons';
import { Typography, TypographyType } from '../typography/Typography';
import { ReadingStreakPopup } from '../streak/popup/ReadingStreakPopup';

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
  // `largeNumberFormat` can return `null` for nullish inputs; accept it
  // here so callers don't need to coerce before passing.
  value: string | number | null;
  href?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  id?: string;
};

// Renders a single inline stat. When `href` is provided the slot becomes a
// link; with `onClick` it becomes a button; otherwise it renders as a static
// span so the surrounding card's outer link still owns the click target.
const StatSlot = ({
  ariaLabel,
  icon,
  value,
  href,
  onClick,
  id,
}: StatSlotProps): ReactElement => {
  const inner = (
    <>
      {icon}
      <Typography bold type={TypographyType.Footnote} className={valueClass}>
        {value}
      </Typography>
    </>
  );

  if (onClick) {
    return (
      <button
        id={id}
        type="button"
        className={slotClass}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {inner}
      </button>
    );
  }

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
  const { logEvent } = useLogContext();
  const [isStreaksOpen, setIsStreaksOpen] = useState(false);

  const handleStreakClick = useCallback(() => {
    setIsStreaksOpen((open) => {
      const next = !open;
      if (next) {
        logEvent({ event_name: LogEvent.OpenStreaks });
      }
      return next;
    });
  }, [logEvent]);

  if (!user) {
    return null;
  }

  const reputation = user.reputation ?? 0;
  const balance = user.balance?.amount ?? 0;
  const showStreak = isStreaksEnabled;
  const preciseBalance = formatCurrency(balance, { minimumFractionDigits: 0 });
  const streakValue = streak?.current ?? 0;

  const streakSlot = (
    <StatSlot
      id="reading-streak-sidebar-button"
      ariaLabel={`Current reading streak: ${streakValue}`}
      icon={
        <span className={iconBoxClass} aria-hidden>
          {/* `scale-75` shrinks the streak flame ~12px wide so
              it stops dominating the row. The reputation bolt
              and cores diamond fill less of their viewBoxes
              naturally, so they're enlarged below to balance. */}
          <ReadingStreakIcon
            size={IconSize.Size16}
            className="scale-75 text-accent-bacon-default"
          />
        </span>
      }
      value={streakValue}
      onClick={streak ? handleStreakClick : undefined}
    />
  );

  return (
    <div
      className={classNames(
        'flex items-stretch overflow-hidden rounded-12 border border-border-subtlest-quaternary bg-background-default',
      )}
    >
      {showStreak && (
        <>
          {streak && isStreaksOpen ? (
            <SimpleTooltip
              interactive
              showArrow={false}
              placement="bottom-start"
              visible
              forceLoad={!isTesting}
              appendTo={() => document.body}
              zIndex={1000}
              container={{
                paddingClassName: 'p-0',
                bgClassName: 'bg-accent-pepper-subtlest',
                textClassName: 'text-text-primary typo-callout',
                className:
                  'border border-border-subtlest-tertiary rounded-16',
              }}
              content={<ReadingStreakPopup streak={streak} />}
              onClickOutside={() => setIsStreaksOpen(false)}
            >
              {streakSlot}
            </SimpleTooltip>
          ) : (
            <Tooltip content="Reading streak" side="bottom">
              {streakSlot}
            </Tooltip>
          )}
          <span aria-hidden className={dividerClass} />
        </>
      )}
      <Tooltip content="Reputation" side="bottom">
        <StatSlot
          ariaLabel={`Reputation: ${reputation}`}
          icon={
            <span className={iconBoxClass} aria-hidden>
              {/* `scale-125` enlarges the reputation bolt ~20px wide so
                  it visually matches the streak flame. The bolt's
                  source SVG only fills ~60% of its viewBox, so without
                  this scale it reads as noticeably smaller in the row. */}
              <ReputationIcon
                size={IconSize.Size16}
                className="scale-125 text-accent-onion-default"
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
