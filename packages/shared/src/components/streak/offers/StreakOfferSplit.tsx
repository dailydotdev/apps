import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import type { UserOffer } from '../../../graphql/offers';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import {
  ClaimedChip,
  FinePrint,
  GiftHeadline,
  OfferLogo,
  offerBadgeLabels,
} from './common';
import { StreakOfferCelebration } from './StreakOfferCelebration';

const OfferListRow = ({
  offer,
  isClaimed,
  onClaim,
}: {
  offer: UserOffer;
  isClaimed: boolean;
  onClaim: (offer: UserOffer) => void;
}): ReactElement => (
  <div className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-2 pr-3 transition-colors duration-150 hover:bg-surface-hover">
    <OfferLogo offer={offer} className="h-9 w-9 rounded-12" />
    <div className="flex min-w-0 flex-1 flex-col">
      <span className="truncate font-bold typo-footnote">{offer.title}</span>
      <span className="truncate text-text-quaternary typo-caption1">
        {[
          offer.advertiserName,
          offer.perk ??
            offer.description ??
            (offer.badgeLabel && offerBadgeLabels[offer.badgeLabel]),
        ]
          .filter(Boolean)
          .join(' · ')}
      </span>
    </div>
    {isClaimed ? (
      <ClaimedChip className="shrink-0 rounded-8 px-2 py-1 typo-caption1">
        Claimed
      </ClaimedChip>
    ) : (
      <Button
        className="shrink-0"
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
        onClick={() => onClaim(offer)}
      >
        Claim
      </Button>
    )}
  </div>
);

export const StreakOfferSplit = ({
  currentStreak,
  offers,
  claimedUids,
  onClaim,
  onVisible,
}: {
  currentStreak: number;
  offers: UserOffer[];
  claimedUids: Set<string>;
  onClaim: (offer: UserOffer) => void;
  /** All rows render at once, so every offer counts as delivered on mount. */
  onVisible: (offers: UserOffer[]) => void;
}): ReactElement => {
  const reportedVisible = useRef(false);

  useEffect(() => {
    if (reportedVisible.current) {
      return;
    }

    reportedVisible.current = true;
    onVisible(offers);
  }, [offers, onVisible]);

  return (
    <div className="flex w-full">
      <StreakOfferCelebration
        currentStreak={currentStreak}
        className="w-[19rem] shrink-0 border-r border-border-subtlest-tertiary"
      />

      <div className="flex min-h-[24rem] min-w-0 flex-1 flex-col gap-4 p-6 pt-14">
        <GiftHeadline count={offers.length} />
        <div className="flex flex-col gap-2">
          {offers.map((offer) => (
            <OfferListRow
              key={offer.impressionUid}
              offer={offer}
              isClaimed={claimedUids.has(offer.impressionUid)}
              onClaim={onClaim}
            />
          ))}
        </div>
        <FinePrint className="mt-auto" />
      </div>
    </div>
  );
};
