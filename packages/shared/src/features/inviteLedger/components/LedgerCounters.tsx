import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { AddUserIcon, CoinIcon, DevPlusIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

interface LedgerCountersProps {
  invitesAccepted: number;
  coresGiftedToFriends: number;
  plusDaysGiftedToFriends: number;
}

type Tone = 'cabbage' | 'cheese' | 'avocado';

interface CounterProps {
  label: string;
  value: number;
  icon: ReactElement;
  tone: Tone;
  suffix?: string;
}

const formatNumber = (value: number): string => value.toLocaleString('en-US');

const toneStyles: Record<
  Tone,
  {
    icon: string;
    iconGlow: string;
    gradient: string;
    border: string;
  }
> = {
  cabbage: {
    icon: 'bg-accent-cabbage-subtlest text-accent-cabbage-default',
    iconGlow: 'bg-accent-cabbage-default/30',
    gradient:
      'from-text-primary via-accent-cabbage-bolder to-accent-onion-default',
    border: 'hover:border-accent-cabbage-default/40',
  },
  cheese: {
    icon: 'bg-accent-cheese-subtlest text-accent-cheese-default',
    iconGlow: 'bg-accent-cheese-default/30',
    gradient:
      'from-text-primary via-accent-cheese-bolder to-accent-burger-default',
    border: 'hover:border-accent-cheese-default/40',
  },
  avocado: {
    icon: 'bg-accent-avocado-subtlest text-accent-avocado-default',
    iconGlow: 'bg-accent-avocado-default/25',
    gradient:
      'from-text-primary via-accent-avocado-bolder to-accent-avocado-default',
    border: 'hover:border-accent-avocado-default/40',
  },
};

const Counter = ({
  label,
  value,
  icon,
  tone,
  suffix,
}: CounterProps): ReactElement => {
  const t = toneStyles[tone];
  return (
    <div
      className={classNames(
        'group relative flex flex-col gap-3 rounded-14 border border-border-subtlest-secondary bg-surface-float p-4 transition-all duration-200 ease-out',
        'hover:-translate-y-0.5 hover:shadow-2',
        t.border,
      )}
    >
      <span className="relative flex size-9 items-center justify-center">
        <span
          aria-hidden
          className={classNames(
            'opacity-60 absolute inset-0 rounded-12 blur-md transition-opacity duration-200 group-hover:opacity-100',
            t.iconGlow,
          )}
        />
        <span
          className={classNames(
            'relative flex size-9 items-center justify-center rounded-12',
            t.icon,
          )}
        >
          {icon}
        </span>
      </span>

      <div className="flex flex-col gap-1">
        <span className="text-text-tertiary typo-footnote">{label}</span>
        <span
          className={classNames(
            'bg-clip-text font-bold tabular-nums leading-none text-transparent typo-mega3',
            'bg-gradient-to-br',
            t.gradient,
          )}
        >
          {formatNumber(value)}
          {suffix && (
            <span className="ml-1 align-baseline text-text-tertiary typo-callout">
              {suffix}
            </span>
          )}
        </span>
      </div>
    </div>
  );
};

export const LedgerCounters = ({
  invitesAccepted,
  coresGiftedToFriends,
  plusDaysGiftedToFriends,
}: LedgerCountersProps): ReactElement => (
  <dl className="grid grid-cols-1 gap-3 mobileL:grid-cols-3 tablet:gap-4">
    <Counter
      tone="cabbage"
      label="Developers brought in"
      value={invitesAccepted}
      icon={<AddUserIcon size={IconSize.Small} secondary />}
    />
    <Counter
      tone="cheese"
      label="Cores earned"
      value={coresGiftedToFriends}
      icon={<CoinIcon size={IconSize.Small} secondary />}
    />
    <Counter
      tone="avocado"
      label="Plus days gifted"
      value={plusDaysGiftedToFriends}
      icon={<DevPlusIcon size={IconSize.Small} />}
    />
  </dl>
);
