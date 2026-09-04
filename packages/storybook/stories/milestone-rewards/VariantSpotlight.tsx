import type { ReactElement } from 'react';
import React, { useCallback, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { VIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { Offer, StreakMilestone } from './data';
import { RewardCardState } from './RewardCard';
import {
  EmberPanel,
  FinePrint,
  FlameBadge,
  FlameSize,
  GiftHeadline,
  MomentShell,
  NoThanks,
  StreakCount,
} from './moment';

// Variant 5. Spotlight.
//
// One gift at a time, centred, with its neighbours dimmed at the edges and dots
// underneath. No photography: a tinted card, the brand's own icon, the offer in
// one line. That is what keeps it feeling like the list rather than an ad
// break, while still giving each gift a moment of its own.
//
// The claim is a single button under the carousel and acts on whichever gift is
// centred, so there is exactly one primary action on the screen.

const CARD_STEP = 13; // rem: card width plus gap, used to slide the track.
const SWIPE_THRESHOLD = 48; // px of travel before a swipe counts as a move.

const SpotlightCard = ({
  offer,
  isActive,
  onSelect,
}: {
  offer: Offer;
  isActive: boolean;
  onSelect: () => void;
}): ReactElement => (
  <button
    type="button"
    onClick={onSelect}
    style={{
      background: `linear-gradient(180deg, ${offer.brandColor}38 0%, ${offer.brandColor}12 100%)`,
    }}
    className={classNames(
      'mr-press flex h-[12.5rem] w-[12rem] shrink-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-20 border p-4 transition-[transform,opacity,box-shadow] duration-300',
      'border-border-subtlest-tertiary',
      isActive ? 'scale-100 opacity-100 shadow-2' : 'scale-90 opacity-40',
    )}
  >
    <span className="rounded-max bg-surface-float px-2.5 py-0.5 font-bold typo-caption2">
      {offer.tag}
    </span>
    <img
      src={offer.logo}
      alt={`${offer.brand} logo`}
      className="mr-logo h-20 w-20 rounded-20 object-cover"
    />
    <div className="flex flex-col gap-0.5">
      <span className="font-bold typo-callout">{offer.brand}</span>
      <span className="text-text-tertiary typo-caption1">
        {offer.offerLine}
      </span>
    </div>
  </button>
);

export const SpotlightMoment = ({
  milestone,
  gifts,
  state = RewardCardState.Idle,
  startIndex = 0,
  onClaim,
  onKeep,
  onClose,
  className,
}: {
  milestone: StreakMilestone;
  gifts: Offer[];
  state?: RewardCardState;
  startIndex?: number;
  onClaim?: (offer: Offer) => void;
  onKeep?: () => void;
  onClose?: () => void;
  className?: string;
}): ReactElement => {
  const [index, setIndex] = useState(startIndex);
  const [drag, setDrag] = useState(0);
  const startX = useRef<number | null>(null);
  // The travelled distance lives in a ref as well as state: state drives the
  // visual offset, but a fast flick can end before React re-renders, and the
  // release has to know how far the finger actually went.
  const travelled = useRef(0);
  const active = gifts[index];
  const isClaimed = state === RewardCardState.Claimed;

  const onPointerDown = useCallback((event: React.PointerEvent) => {
    startX.current = event.clientX;
    travelled.current = 0;
  }, []);

  const onPointerMove = useCallback((event: React.PointerEvent) => {
    if (startX.current === null) {
      return;
    }

    travelled.current = event.clientX - startX.current;
    setDrag(travelled.current);
  }, []);

  // A swipe past a quarter of a card moves one along; anything less springs
  // back, which is what makes a short flick feel deliberate rather than fragile.
  const onPointerUp = useCallback(() => {
    if (startX.current === null) {
      return;
    }

    const distance = travelled.current;

    startX.current = null;
    travelled.current = 0;
    setDrag(0);

    if (distance < -SWIPE_THRESHOLD) {
      setIndex((current) => Math.min(current + 1, gifts.length - 1));
    } else if (distance > SWIPE_THRESHOLD) {
      setIndex((current) => Math.max(current - 1, 0));
    }
  }, [gifts.length]);

  return (
    <MomentShell
      onClose={onClose}
      width="w-full max-w-[24rem]"
      className={classNames('flex-col', className)}
    >
      <EmberPanel className="flex-col items-center gap-2 px-6 pb-4 pt-6">
        {/* Flame and count on one line: four centred blocks stacked in a
            narrow popup never line up, and the flame looked lost on its own. */}
        <div className="flex items-center justify-center gap-3">
          <FlameBadge
            milestone={milestone}
            size={FlameSize.Small}
            className="mr-flame-sm shrink-0"
          />
          <span className="mr-streak-line flex items-baseline gap-2 text-text-primary">
            <StreakCount day={milestone.day} />
            <span className="font-normal">day streak</span>
          </span>
        </div>
        <GiftHeadline count={gifts.length} centered className="pt-1" />
      </EmberPanel>

      <div className="flex flex-col items-center gap-4 py-5">
        {/* The track slides rather than scrolls, so the centred card is always
            the one the claim button acts on. */}
        <div
          className="relative flex w-full cursor-grab touch-pan-y justify-center overflow-hidden active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <div
            className={classNames(
              'flex select-none gap-4',
              drag === 0 && 'transition-transform duration-300',
            )}
            style={{
              transform: `translateX(calc(${
                ((gifts.length - 1) / 2 - index) * CARD_STEP
              }rem + ${drag}px))`,
            }}
          >
            {gifts.map((offer, cardIndex) => (
              <SpotlightCard
                key={offer.id}
                offer={offer}
                isActive={cardIndex === index}
                onSelect={() => setIndex(cardIndex)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {gifts.map((offer, dotIndex) => (
            <button
              key={offer.id}
              type="button"
              aria-label={`Show ${offer.brand}`}
              onClick={() => setIndex(dotIndex)}
              className={classNames(
                'h-2 rounded-max transition-[width,background-color] duration-200',
                dotIndex === index
                  ? 'w-5 bg-accent-bacon-default'
                  : 'w-2 bg-surface-hover',
              )}
            />
          ))}
        </div>

        <div className="flex w-full flex-col gap-2 px-6">
          <FinePrint className="text-center" />
          {isClaimed ? (
            <span className="flex h-12 items-center justify-center gap-2 rounded-14 bg-overlay-float-avocado font-bold text-accent-avocado-default typo-callout">
              <VIcon size={IconSize.Small} secondary />
              {active.brand} gift claimed
            </span>
          ) : (
            <Button
              className="mr-cta w-full"
              size={ButtonSize.Large}
              variant={ButtonVariant.Primary}
              loading={state === RewardCardState.Claiming}
              onClick={() => onClaim?.(active)}
            >
              Claim gift
            </Button>
          )}
          <NoThanks onClick={onKeep} />
        </div>
      </div>
    </MomentShell>
  );
};
