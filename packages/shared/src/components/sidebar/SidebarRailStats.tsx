import type { MouseEvent, ReactElement, ReactNode } from 'react';
import React, { useCallback, useRef, useState } from 'react';
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
import { IconSize } from '../Icon';
import { CoreIcon, ReadingStreakIcon, ReputationIcon } from '../icons';
import { Typography, TypographyType } from '../typography/Typography';
import { StreakPopover } from './StreakPopover';

const slotClass =
  'focus-outline flex w-full items-center justify-center gap-1 py-1.5 text-text-primary transition-colors hover:bg-surface-hover';
const iconBoxClass = 'flex size-4 shrink-0 items-center justify-center';
const dividerClass = 'h-px w-full bg-border-subtlest-quaternary';

type RailSlotProps = {
  ariaLabel: string;
  icon: ReactNode;
  value: string | number | null;
  href?: string;
  target?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

const RailSlot = ({
  ariaLabel,
  icon,
  value,
  href,
  target,
  onClick,
}: RailSlotProps): ReactElement => {
  const inner = (
    <>
      {icon}
      <Typography bold type={TypographyType.Caption1} className="tabular-nums">
        {value}
      </Typography>
    </>
  );

  if (onClick) {
    return (
      <button
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

// Compact streak / reputation / cores cluster pinned to the bottom of the
// always-visible desktop rail. Keeps the loved gamification signals at a
// glance regardless of whether the context panel is collapsed or which
// category is selected.
export const SidebarRailStats = (): ReactElement | null => {
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
  const preciseBalance = formatCurrency(balance, { minimumFractionDigits: 0 });
  const streakValue = streak?.current ?? 0;
  const hasReadToday =
    !!streak?.lastViewAt &&
    isSameDayInTimezone(new Date(streak.lastViewAt), new Date(), user.timezone);

  const streakSlot = (
    <RailSlot
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
    <div className="flex w-full flex-col items-stretch overflow-hidden rounded-12 border border-border-subtlest-quaternary bg-background-default">
      {isStreaksEnabled && (
        <>
          <div ref={streakSlotRef} className="flex w-full">
            {isStreaksOpen ? (
              streakSlot
            ) : (
              <Tooltip side="right" content="Reading streak">
                {streakSlot}
              </Tooltip>
            )}
          </div>
          {streak && isStreaksOpen && (
            <StreakPopover
              streak={streak}
              triggerRef={streakSlotRef}
              onClose={() => setIsStreaksOpen(false)}
              placement="right"
            />
          )}
          <span aria-hidden className={dividerClass} />
        </>
      )}
      <Tooltip side="right" content="Reputation">
        <div className="flex w-full">
          <RailSlot
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
        side="right"
        content={
          <>
            Wallet
            <br />
            {preciseBalance} Cores
          </>
        }
      >
        <div className="flex w-full">
          <RailSlot
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
