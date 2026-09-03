import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { LockIcon, VIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { Offer, StreakMilestone } from './data';
import { sponsoredGiftArt, streakLadder, tierArt } from './data';
import { RewardCardState } from './RewardCard';
import { Coupon, CouponLayout, CouponList } from './coupons';
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
} from './moment';

// Variant 4. Ladder.
//
// The one that argues for tomorrow as well as today. The left rail is the tier
// ladder from the streak progression PR: what you have already burned through,
// where you are standing, and the next flame with its reward already visible.
// Claiming today and keeping the streak become the same motion.

const LADDER_BEFORE = 2;
const LADDER_AFTER = 2;

const rowsAround = (milestone: StreakMilestone): StreakMilestone[] => {
  const index = streakLadder.findIndex((item) => item.day === milestone.day);

  if (index === -1) {
    throw new Error(`Milestone day ${milestone.day} is not on the ladder`);
  }

  return streakLadder.slice(
    Math.max(index - LADDER_BEFORE, 0),
    index + LADDER_AFTER + 1,
  );
};

const rowIcon = (item: StreakMilestone, revealed: boolean): ReactElement => {
  if (revealed) {
    return (
      <img
        src={tierArt(item.tier)}
        alt={item.label}
        className="relative h-7 w-7 object-contain"
      />
    );
  }

  if (item.mystery) {
    return (
      <img
        src={sponsoredGiftArt}
        alt="Hidden prize"
        className="relative h-7 w-7 object-contain"
      />
    );
  }

  return <LockIcon size={IconSize.Small} className="text-text-quaternary" />;
};

const LadderRow = ({
  item,
  current,
  isLast,
}: {
  item: StreakMilestone;
  current: StreakMilestone;
  isLast: boolean;
}): ReactElement => {
  const isDone = item.day < current.day;
  const isCurrent = item.day === current.day;

  return (
    // Every row keeps the same 40px marker, so all the centres line up on one
    // axis and the connector can be drawn from circle edge to circle edge.
    <li className="relative flex gap-3">
      {!isLast && (
        <span
          aria-hidden
          className={classNames(
            'absolute bottom-0 left-[1.375rem] top-11 w-px -translate-x-1/2',
            isDone || isCurrent
              ? 'bg-accent-bacon-default'
              : 'bg-border-subtlest-tertiary',
          )}
        />
      )}
      <span
        className={classNames(
          'relative z-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
          // Solid on every row, including the current one: a transparent
          // marker let the connector line run straight through the artwork.
          isCurrent ? 'bg-surface-float' : 'bg-accent-pepper-subtlest',
        )}
      >
        {isCurrent && (
          <span
            aria-hidden
            className="absolute -inset-1 rounded-full opacity-70 blur-md"
            style={{ background: 'rgba(236, 82, 122, 0.5)' }}
          />
        )}
        {/* Revealed days show their flame. A wrapped box means the prize is
            still hidden: Plus, a course, a Cores drop, unveiled on the day.
            Everything else that is simply out of reach gets the padlock. */}
        {rowIcon(item, isDone || isCurrent)}
      </span>

      <div
        className={classNames(
          'flex min-w-0 flex-1 flex-col pb-5',
          isCurrent && 'rounded-8 bg-overlay-float-bacon px-2 py-1',
        )}
      >
        <span
          className={classNames(
            'mr-pretty font-bold typo-footnote',
            isCurrent || isDone ? 'text-text-primary' : 'text-text-quaternary',
          )}
        >
          Day {item.day} · {item.label}
        </span>
        <span
          className={classNames(
            'mr-pretty typo-caption1',
            isCurrent ? 'text-accent-bacon-default' : 'text-text-quaternary',
          )}
        >
          {item.reward}
        </span>
      </div>

      {isDone && (
        <VIcon
          size={IconSize.XSmall}
          secondary
          className="mt-1 shrink-0 text-accent-avocado-default"
        />
      )}
    </li>
  );
};

export const LadderMoment = ({
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
  /** List mode. Three or more gifts as rows instead of a single coupon. */
  gifts?: Offer[];
  state?: RewardCardState;
  couponLayout?: CouponLayout;
  decline?: DeclineStyle;
  onClaim?: () => void;
  onKeep?: () => void;
  onClose?: () => void;
  onOptOut?: () => void;
}): ReactElement => {
  const rows = rowsAround(milestone);
  const next = streakLadder.find((item) => item.day > milestone.day);

  return (
    <MomentShell
      onClose={onClose}
      width="w-full max-w-[56rem]"
      className="mr-split"
    >
      <EmberPanel className="mr-side mr-side-rail mr-order-last mr-side-pad flex-col gap-4 border-r border-border-subtlest-tertiary p-6">
        <span className="uppercase tracking-[0.16em] text-text-quaternary typo-caption1">
          Your flame ladder
        </span>
        <ul className="mr-rail flex flex-col">
          {rows.map((item, index) => (
            <LadderRow
              key={item.day}
              item={item}
              current={milestone}
              isLast={index === rows.length - 1}
            />
          ))}
        </ul>
        {next && (
          <span className="mt-auto text-text-tertiary typo-caption1">
            {next.day - milestone.day} days to {next.label}: {next.reward}
          </span>
        )}
      </EmberPanel>

      <div className="mr-side-pad flex min-w-0 flex-1 flex-col gap-4 p-6">
        {/* The flame sits with the number: without it the panel is just text,
            and the tier artwork is the part that makes the moment ours. */}
        <div className="flex items-center gap-3">
          <FlameBadge
            milestone={milestone}
            size={FlameSize.Small}
            className="mr-flame-sm shrink-0"
          />
          {/* No tier chip here: the rail already names the tier on the row the
              user is standing on. */}
          <div className="flex items-baseline gap-2">
            <StreakCount day={milestone.day} className="mr-count" />
            <span className="text-text-tertiary typo-title3">day streak</span>
          </div>
        </div>

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
