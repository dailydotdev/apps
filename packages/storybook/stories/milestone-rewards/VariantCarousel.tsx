import type { ReactElement } from 'react';
import React, { useCallback, useRef } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { Offer, StreakMilestone } from './data';
import { RewardCardState } from './RewardCard';
import { Coupon, CouponLayout } from './coupons';
import {
  DeclineStyle,
  EmberPanel,
  FinePrint,
  FlameBadge,
  FlameSize,
  GiftHeadline,
  MomentShell,
  NoThanks,
  SaveForLater,
  StreakCount,
  TierName,
} from './moment';

// Variant 3. Carousel.
//
// The partner mock-up's own shape brought to the desktop: the win centred at
// the top, then the gifts as full cards you page through with arrows, with the
// neighbours peeking in so it is obvious there is more than one.
//
// It costs more room per gift than the list, and only one offer is properly
// readable at a time. What it buys is that each gift arrives at full size, with
// its photography, which is how the partner presents its own inventory.

export const CarouselMoment = ({
  milestone,
  gifts,
  state = RewardCardState.Idle,
  claimingId,
  decline = DeclineStyle.CloseOnly,
  onClaim,
  onKeep,
  onClose,
}: {
  milestone: StreakMilestone;
  gifts: Offer[];
  state?: RewardCardState;
  claimingId?: string;
  decline?: DeclineStyle;
  onClaim?: (offer: Offer) => void;
  onKeep?: () => void;
  onClose?: () => void;
}): ReactElement => {
  const track = useRef<HTMLDivElement>(null);

  const page = useCallback((direction: 1 | -1) => {
    const node = track.current;

    if (!node) {
      return;
    }

    // One card plus its gap, read off the first child so the two stay in sync.
    const card = node.firstElementChild;
    const step = card ? card.getBoundingClientRect().width + 16 : 280;

    node.scrollBy({ left: step * direction, behavior: 'smooth' });
  }, []);

  return (
    <MomentShell
      onClose={onClose}
      width="w-full max-w-[52rem]"
      className="flex-col"
    >
      <EmberPanel className="flex-col items-center gap-3 px-6 pb-5 pt-8">
        <FlameBadge
          milestone={milestone}
          size={FlameSize.Medium}
          className="mr-flame-sm"
        />
        <TierName milestone={milestone} />
        <div className="flex items-baseline gap-2">
          <StreakCount day={milestone.day} className="mr-count" />
          <span className="text-text-tertiary typo-title3">day streak</span>
        </div>
        <GiftHeadline count={gifts.length} centered />
      </EmberPanel>

      <div className="flex flex-col gap-4 py-6">
        {/* Cards keep their full size and the row scrolls, so the neighbours
            peek in at both edges and the popup never grows a second row. */}
        <div
          ref={track}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2"
        >
          {gifts.map((offer) => (
            <Coupon
              key={offer.id}
              offer={offer}
              layout={CouponLayout.PartnerCard}
              state={claimingId === offer.id ? state : RewardCardState.Idle}
              onClaim={() => onClaim?.(offer)}
              className="mr-gift-card shrink-0 snap-center"
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button
            size={ButtonSize.Medium}
            variant={ButtonVariant.Float}
            icon={<ArrowIcon className="-rotate-90" size={IconSize.Small} />}
            aria-label="Previous gift"
            onClick={() => page(-1)}
          />
          <Button
            size={ButtonSize.Medium}
            variant={ButtonVariant.Float}
            icon={<ArrowIcon className="rotate-90" size={IconSize.Small} />}
            aria-label="Next gift"
            onClick={() => page(1)}
          />
        </div>

        <div className="flex flex-col items-center gap-3 px-6">
          <FinePrint className="text-center" />
          {decline === DeclineStyle.SaveLink && (
            <SaveForLater onClick={onKeep} className="mr-only-wide" />
          )}
          <NoThanks
            onClick={onKeep}
            className={
              decline === DeclineStyle.Button ? undefined : 'mr-only-narrow'
            }
          />
        </div>
      </div>
    </MomentShell>
  );
};
