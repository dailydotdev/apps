import type { MouseEvent, ReactElement, ReactNode } from 'react';
import React, { useCallback, useRef, useState } from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../contexts/AuthContext';
import { useReadingStreak } from '../../hooks/streaks';
import { useLogContext } from '../../contexts/LogContext';
import {
  reputation as reputationDocsUrl,
  walletUrl,
} from '../../lib/constants';
import { largeNumberFormat } from '../../lib';
import { formatCurrency } from '../../lib/utils';
import { isSameDayInTimezone } from '../../lib/timezones';
import { LogEvent } from '../../lib/log';
import Link from '../utilities/Link';
import { Tooltip } from '../tooltip/Tooltip';
import { SimpleTooltip } from '../tooltips';
import type { TooltipProps } from '../tooltips/BaseTooltip';
import { IconSize } from '../Icon';
import { CoreIcon, ReadingStreakIcon, ReputationIcon } from '../icons';
import { Typography, TypographyType } from '../typography/Typography';
import { StreakPopover } from './StreakPopover';

const slotClass =
  'focus-outline group flex flex-1 items-center justify-center gap-1 px-1.5 py-1.5 transition-colors hover:bg-surface-hover min-w-0';
const valueClass = 'text-text-primary tabular-nums';
const iconBoxClass = 'flex size-4 shrink-0 items-center justify-center';

type StatSlotProps = {
  ariaLabel: string;
  icon: ReactNode;
  value: string | number | null;
  href?: string;
  target?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  id?: string;
};

// Each slot is rendered inside a wrapper element that acts as the Tooltip
// trigger (see usage below). Keeping the anchor/button as a plain child —
// instead of making it the Radix `asChild` trigger directly — avoids the
// double clone (Radix Slot + Next `legacyBehavior` Link) that swallowed the
// link's click navigation.
const StatSlot = ({
  ariaLabel,
  icon,
  value,
  href,
  target,
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
      <a
        className={slotClass}
        aria-label={ariaLabel}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      >
        {inner}
      </a>
    </Link>
  );
};

const dividerClass = 'w-px self-stretch bg-border-subtlest-quaternary';

const StreakHintTooltip = ({
  children,
  content,
}: Pick<TooltipProps, 'children' | 'content'>): ReactElement => (
  <SimpleTooltip placement="bottom" content={content} offset={[0, 8]}>
    {children}
  </SimpleTooltip>
);

type SidebarHeaderStatsProps = {
  // 'right' opens the streak popover beside the strip and anchors it to the
  // bottom edge so it grows upward — used by the single-panel footer, which
  // sits near the viewport bottom and would clip a downward popover.
  streakPopoverPlacement?: 'bottom' | 'right';
};

export const SidebarHeaderStats = ({
  streakPopoverPlacement = 'bottom',
}: SidebarHeaderStatsProps = {}): ReactElement | null => {
  const { user } = useAuthContext();
  const { streak, isStreaksEnabled } = useReadingStreak();
  const { logEvent } = useLogContext();
  const [isStreaksOpen, setIsStreaksOpen] = useState(false);
  const streakSlotRef = useRef<HTMLDivElement>(null);

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
  const hasReadToday =
    !!streak?.lastViewAt &&
    isSameDayInTimezone(new Date(streak.lastViewAt), new Date(), user.timezone);

  const streakSlot = (
    <StatSlot
      id="reading-streak-sidebar-button"
      ariaLabel={`Current reading streak: ${streakValue}`}
      icon={
        <span className={iconBoxClass} aria-hidden>
          <ReadingStreakIcon
            secondary={hasReadToday}
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
          <div ref={streakSlotRef} className="flex flex-1 items-stretch">
            {isStreaksOpen ? (
              streakSlot
            ) : (
              <StreakHintTooltip content="Reading streak">
                {streakSlot}
              </StreakHintTooltip>
            )}
          </div>
          {streak && isStreaksOpen && (
            <StreakPopover
              streak={streak}
              triggerRef={streakSlotRef}
              onClose={() => setIsStreaksOpen(false)}
              placement={streakPopoverPlacement}
            />
          )}
          <span aria-hidden className={dividerClass} />
        </>
      )}
      <Tooltip content="Reputation" side="bottom">
        <div className="flex flex-1 items-stretch">
          <StatSlot
            ariaLabel={`Reputation: ${reputation}`}
            icon={
              <span className={iconBoxClass} aria-hidden>
                <ReputationIcon
                  size={IconSize.Size16}
                  className="scale-125 text-accent-onion-default"
                />
              </span>
            }
            value={largeNumberFormat(reputation)}
            href={reputationDocsUrl}
            target="_blank"
          />
        </div>
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
        <div className="flex flex-1 items-stretch">
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
        </div>
      </Tooltip>
    </div>
  );
};
