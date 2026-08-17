import type { ReactElement } from 'react';
import React from 'react';
import type { Offer, StreakMilestone } from './data';
import { RewardCardState } from './RewardCard';
import { Coupon, CouponLayout, CouponList } from './coupons';
import {
  DayStrip,
  DeclineStyle,
  EmberPanel,
  FinePrint,
  FlameBadge,
  GiftHeadline,
  MomentShell,
  NoThanks,
  SaveForLater,
  StreakCount,
  TierName,
} from './moment';

// Variant 1. Split.
//
// The landscape answer to a popup that used to be a column. Streak on the left
// with the tier artwork at full size, gift on the right. Nothing stacks, so
// nothing scrolls, and the two halves stay visibly separate: daily.dev's fire on
// one side, the partner's paint strictly on the other.
//
// The right column is deliberately quiet. Pass `gifts` for list mode, where two
// or three gifts sit as single-line rows with a small button each, and the
// celebration stays the biggest thing on screen.

export const SplitMoment = ({
  milestone,
  offer,
  gifts,
  state = RewardCardState.Idle,
  couponLayout = CouponLayout.AppRow,
  decline = DeclineStyle.CloseOnly,
  onClaim,
  onKeep,
  onClose,
  onOptOut,
}: {
  milestone: StreakMilestone;
  offer: Offer;
  /** List mode. When present the single coupon is replaced by these rows. */
  gifts?: Offer[];
  state?: RewardCardState;
  couponLayout?: CouponLayout;
  decline?: DeclineStyle;
  onClaim?: () => void;
  onKeep?: () => void;
  onClose?: () => void;
  onOptOut?: () => void;
}): ReactElement => (
  <MomentShell onClose={onClose} width="w-full max-w-[52rem]" className="mr-split">
    {/* One centred group: flame, tier, number, headline, week. Spreading these
        to the panel edges left a hole in the middle and no clear reading order. */}
    <EmberPanel className="mr-side mr-side-center mr-side-pad flex-col items-center justify-center gap-4 border-r border-border-subtlest-tertiary p-6 text-center">
      <FlameBadge milestone={milestone} className="mr-flame" />
      <TierName milestone={milestone} />
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-center gap-2">
          <StreakCount day={milestone.day} className="mr-count" />
          <span className="text-text-tertiary typo-title3">day streak</span>
        </div>
        <h2 className="typo-title3">{milestone.headline}</h2>
      </div>
      <DayStrip className="mr-hide-tiny" />
    </EmberPanel>

    <div className="mr-side-pad flex min-w-0 flex-1 flex-col gap-4 p-6">
      <GiftHeadline count={gifts?.length} />

      {gifts ? (
        <CouponList
          offers={gifts}
          state={state}
          claimingId={gifts[0]?.id}
          onClaim={onClaim}
        />
      ) : (
        <Coupon
          offer={offer}
          layout={couponLayout}
          state={state}
          onClaim={onClaim}
        />
      )}

      <div className="mt-auto flex flex-col gap-3">
        <FinePrint />
        {decline === DeclineStyle.SaveLink && (
          <SaveForLater onClick={onKeep} className="mr-only-wide" />
        )}
        {/* Narrow enough to be a phone: the corner X is out of thumb reach, so
            the decline becomes a real button. */}
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
