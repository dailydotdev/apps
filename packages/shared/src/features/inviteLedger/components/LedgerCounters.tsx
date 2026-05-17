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
  <div className="min-w-0">
    <div className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary">
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
  <dl className="grid grid-cols-3 gap-4 tablet:gap-6">
    <Counter label="Invites accepted" value={invitesAccepted} />
    <Counter label="Cores gifted" value={coresGiftedToFriends} />
    <Counter label="Plus days unlocked" value={plusDaysGiftedToFriends} />
  </dl>
);
