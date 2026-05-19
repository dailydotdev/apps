import type { MouseEvent, ReactElement, ReactNode } from 'react';
import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../contexts/AuthContext';
import { useReadingStreak } from '../../hooks/streaks';
import { useLogContext } from '../../contexts/LogContext';
import { walletUrl, isTesting } from '../../lib/constants';
import { largeNumberFormat } from '../../lib';
import { formatCurrency } from '../../lib/utils';
import { LogEvent } from '../../lib/log';
import Link from '../utilities/Link';
import { Tooltip } from '../tooltip/Tooltip';
import { SimpleTooltip } from '../tooltips';
import type { TooltipProps } from '../tooltips/BaseTooltip';
import { IconSize } from '../Icon';
import { CoreIcon, ReadingStreakIcon, ReputationIcon } from '../icons';
import { Typography, TypographyType } from '../typography/Typography';
import { ReadingStreakPopup } from '../streak/popup/ReadingStreakPopup';
import type { UserStreak } from '../../graphql/users';

const slotClass =
  'focus-outline group flex flex-1 items-center justify-center gap-1 px-1.5 py-1.5 transition-colors hover:bg-surface-hover min-w-0';
const valueClass = 'text-text-primary tabular-nums';
const iconBoxClass = 'flex size-4 shrink-0 items-center justify-center';

type StatSlotProps = {
  ariaLabel: string;
  icon: ReactNode;
  value: string | number | null;
  href?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  id?: string;
};

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

type StreakPopupTooltipProps = Pick<TooltipProps, 'children'> & {
  streak: UserStreak;
  shouldShowStreaks: boolean;
  onClose: () => void;
};

const StreakPopupTooltip = ({
  children,
  streak,
  shouldShowStreaks,
  onClose,
}: StreakPopupTooltipProps): ReactElement => (
  <SimpleTooltip
    interactive
    showArrow={false}
    placement="bottom-start"
    visible={shouldShowStreaks}
    forceLoad={!isTesting}
    appendTo={() => document.body}
    zIndex={1000}
    offset={[0, 8]}
    container={{
      paddingClassName: 'p-0',
      bgClassName: 'bg-accent-pepper-subtlest',
      textClassName: 'text-text-primary typo-callout',
      className: 'border border-border-subtlest-tertiary rounded-16',
    }}
    content={<ReadingStreakPopup streak={streak} />}
    onClickOutside={onClose}
  >
    {children}
  </SimpleTooltip>
);

const StreakHintTooltip = ({
  children,
  content,
}: Pick<TooltipProps, 'children' | 'content'>): ReactElement => (
  <SimpleTooltip placement="bottom" content={content} offset={[0, 8]}>
    {children}
  </SimpleTooltip>
);

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
            <StreakPopupTooltip
              streak={streak}
              shouldShowStreaks={isStreaksOpen}
              onClose={() => setIsStreaksOpen(false)}
            >
              {streakSlot}
            </StreakPopupTooltip>
          ) : (
            <StreakHintTooltip content="Reading streak">
              {streakSlot}
            </StreakHintTooltip>
          )}
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
