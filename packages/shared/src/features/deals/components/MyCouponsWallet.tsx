import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { Button } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { CopyIcon, VIcon } from '../../../components/icons';
import { useCopyText } from '../../../hooks/useCopy';
import type { ClaimRecord, Deal } from '../types';
import { ClaimStatus } from '../types';
import { useNowTick } from '../useNowTick';
import { DealBrandLogo } from './DealBrandLogo';
import { DealValueBadge } from './DealValueBadge';

interface MyCouponsWalletProps {
  claims: ClaimRecord[];
  deals: Deal[];
  onBrowse?: () => void;
  now?: number;
  className?: string;
}

type WalletTab = 'all' | ClaimStatus;

interface WalletEntry {
  claim: ClaimRecord;
  deal: Deal;
}

const tabs: { id: WalletTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: ClaimStatus.Active, label: 'Active' },
  { id: ClaimStatus.Used, label: 'Used' },
  { id: ClaimStatus.Expired, label: 'Expired' },
];

const statusToLabel: Record<ClaimStatus, string> = {
  [ClaimStatus.Active]: 'Active',
  [ClaimStatus.Used]: 'Used',
  [ClaimStatus.Expired]: 'Expired',
};

const statusToColor: Record<ClaimStatus, TypographyColor> = {
  [ClaimStatus.Active]: TypographyColor.StatusSuccess,
  [ClaimStatus.Used]: TypographyColor.Tertiary,
  [ClaimStatus.Expired]: TypographyColor.Disabled,
};

const emptyTabCopy: Record<ClaimStatus, string> = {
  [ClaimStatus.Active]: 'No active coupons right now',
  [ClaimStatus.Used]: 'Nothing marked as used yet',
  [ClaimStatus.Expired]: 'None of your coupons expired',
};

const formatClaimedAt = (claimedAt: string, now: number): string => {
  const days = Math.floor((now - new Date(claimedAt).getTime()) / 86400000);

  if (days < 1) {
    return 'Claimed today';
  }

  if (days === 1) {
    return 'Claimed yesterday';
  }

  return `Claimed ${days} days ago`;
};

const WalletCodeCopy = ({ code }: { code: string }): ReactElement => {
  const [copying, copy] = useCopyText(code);

  return (
    <span className="flex items-center gap-2">
      <Button
        type="button"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.XSmall}
        icon={copying ? <VIcon secondary /> : <CopyIcon />}
        onClick={() => copy()}
        className="tracking-wider"
      >
        {code}
      </Button>
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
        aria-live="polite"
      >
        {copying && `Code ${code} copied`}
      </Typography>
    </span>
  );
};

const WalletRow = ({
  claim,
  deal,
  now,
}: WalletEntry & { now: number }): ReactElement => {
  const isMuted = claim.status !== ClaimStatus.Active;

  return (
    <li className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary p-3">
      <DealBrandLogo brand={deal.brand} isMuted={isMuted} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          bold
          truncate
        >
          {deal.title}
        </Typography>
        <div className="flex flex-wrap items-center gap-2">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            {deal.brand.name}
          </Typography>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Quaternary}
          >
            {formatClaimedAt(claim.claimedAt, now)}
          </Typography>
        </div>
      </div>
      {claim.status === ClaimStatus.Active && claim.code && (
        <WalletCodeCopy code={claim.code} />
      )}
      <DealValueBadge value={deal.value} isMuted={isMuted} />
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Caption1}
        color={statusToColor[claim.status]}
        bold
        className="w-14 shrink-0 text-right"
      >
        {statusToLabel[claim.status]}
      </Typography>
    </li>
  );
};

export const MyCouponsWallet = ({
  claims,
  deals,
  onBrowse,
  now,
  className,
}: MyCouponsWalletProps): ReactElement => {
  const [activeTab, setActiveTab] = useState<WalletTab>('all');
  const currentMs = useNowTick(now);

  const entries = useMemo(
    () =>
      claims.map<WalletEntry>((claim) => {
        const deal = deals.find(({ id }) => id === claim.dealId);

        if (!deal) {
          throw new Error(
            `MyCouponsWallet got claim ${claim.id} for a missing deal ${claim.dealId}`,
          );
        }

        return { claim, deal };
      }),
    [claims, deals],
  );

  const counts = useMemo(
    () =>
      entries.reduce<Record<ClaimStatus, number>>(
        (totals, { claim }) => ({
          ...totals,
          [claim.status]: totals[claim.status] + 1,
        }),
        {
          [ClaimStatus.Active]: 0,
          [ClaimStatus.Used]: 0,
          [ClaimStatus.Expired]: 0,
        },
      ),
    [entries],
  );

  const visible =
    activeTab === 'all'
      ? entries
      : entries.filter(({ claim }) => claim.status === activeTab);
  const isFilteredEmpty = activeTab !== 'all' && entries.length > 0;

  return (
    <div className={classNames('flex flex-col gap-4', className)}>
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map(({ id, label }) => (
          <Button
            key={id}
            type="button"
            size={ButtonSize.Small}
            variant={
              activeTab === id ? ButtonVariant.Secondary : ButtonVariant.Float
            }
            pressed={activeTab === id}
            onClick={() => setActiveTab(id)}
            className="tabular-nums"
          >
            {label} {id === 'all' ? entries.length : counts[id]}
          </Button>
        ))}
      </div>

      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
        aria-live="polite"
        className="tabular-nums"
      >
        {visible.length} {visible.length === 1 ? 'coupon' : 'coupons'} in view
      </Typography>

      {visible.length === 0 ? (
        <div className="flex flex-col items-start gap-2 rounded-16 border border-border-subtlest-tertiary p-6">
          <Typography tag={TypographyTag.P} type={TypographyType.Callout} bold>
            {isFilteredEmpty
              ? emptyTabCopy[activeTab as ClaimStatus]
              : 'Nothing claimed yet'}
          </Typography>
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {isFilteredEmpty
              ? 'Your other coupons are still here. Switch back to All to see them.'
              : 'Codes, credits and free months you grab all land here.'}
          </Typography>
          <Button
            type="button"
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Small}
            onClick={isFilteredEmpty ? () => setActiveTab('all') : onBrowse}
          >
            {isFilteredEmpty ? 'Show all coupons' : 'Browse the directory'}
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map(({ claim, deal }) => (
            <WalletRow
              key={claim.id}
              claim={claim}
              deal={deal}
              now={currentMs}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
