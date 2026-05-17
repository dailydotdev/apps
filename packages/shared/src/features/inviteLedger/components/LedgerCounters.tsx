import type { ReactElement } from 'react';
import React from 'react';

interface LedgerCountersProps {
  invitesAccepted: number;
  coresGiftedToFriends: number;
  plusDaysGiftedToFriends: number;
}

interface CounterProps {
  label: string;
  value: number;
}

const formatNumber = (value: number): string => value.toLocaleString('en-US');

const Counter = ({ label, value }: CounterProps) => (
  <div className="text-left tablet:text-right">
    <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary">
      {label}
    </div>
    <div className="mt-1 text-[22px] font-semibold tabular-nums tracking-[-0.01em] text-text-primary">
      {formatNumber(value)}
    </div>
  </div>
);

export const LedgerCounters = ({
  invitesAccepted,
  coresGiftedToFriends,
  plusDaysGiftedToFriends,
}: LedgerCountersProps): ReactElement => (
  <dl className="flex flex-col gap-4 tablet:flex-row tablet:items-baseline tablet:gap-8">
    <Counter label="Invites accepted" value={invitesAccepted} />
    <Counter label="Cores gifted to friends" value={coresGiftedToFriends} />
    <Counter label="Plus days unlocked" value={plusDaysGiftedToFriends} />
  </dl>
);
