import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import type { UserOffer } from '../../../graphql/offers';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import {
  ClaimedChip,
  FinePrint,
  GiftHeadline,
  OfferLogo,
  offerBadgeLabels,
} from './common';
import { StreakOfferCelebrationCompact } from './StreakOfferCelebration';

const CARD_STEP = 13; // rem: card width plus gap, used to slide the track.
const SWIPE_THRESHOLD = 48; // px of travel before a swipe counts as a move.

const CarouselCard = ({
  offer,
  isActive,
  onSelect,
}: {
  offer: UserOffer;
  isActive: boolean;
  onSelect: () => void;
}): ReactElement => (
  <button
    type="button"
    onClick={onSelect}
    className={classNames(
      'flex h-[12.5rem] w-[12rem] shrink-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-20 border border-border-subtlest-tertiary bg-surface-float p-4 text-center transition-[transform,opacity,box-shadow] duration-300',
      isActive ? 'scale-100 opacity-100 shadow-2' : 'scale-90 opacity-40',
    )}
  >
    {offer.badgeLabel && (
      <span className="rounded-max bg-overlay-float-bacon px-2.5 py-0.5 font-bold typo-caption2">
        {offerBadgeLabels[offer.badgeLabel]}
      </span>
    )}
    <OfferLogo offer={offer} className="h-20 w-20 rounded-20" />
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate font-bold typo-callout">
        {offer.advertiserName}
      </span>
      <span className="line-clamp-2 text-text-tertiary typo-caption1">
        {offer.perk ?? offer.title}
      </span>
    </div>
  </button>
);

export const StreakOfferCarousel = ({
  currentStreak,
  offers,
  claimedUids,
  onClaim,
  onDecline,
  onVisible,
}: {
  currentStreak: number;
  offers: UserOffer[];
  claimedUids: Set<string>;
  onClaim: (offer: UserOffer) => void;
  onDecline: () => void;
  /** Only the centred card is visible, so delivery is reported per card. */
  onVisible: (offers: UserOffer[]) => void;
}): ReactElement => {
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const startX = useRef<number | null>(null);
  // The travelled distance lives in a ref as well as state: state drives the
  // visual offset, but a fast flick can end before React re-renders, and the
  // release has to know how far the finger actually went.
  const travelled = useRef(0);
  const active = offers[index];
  const isClaimed = active && claimedUids.has(active.impressionUid);

  useEffect(() => {
    if (active) {
      onVisible([active]);
    }
  }, [active, onVisible]);

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

  const onPointerUp = useCallback(() => {
    if (startX.current === null) {
      return;
    }

    const distance = travelled.current;

    startX.current = null;
    travelled.current = 0;
    setDrag(0);

    if (distance < -SWIPE_THRESHOLD) {
      setIndex((current) => Math.min(current + 1, offers.length - 1));
    } else if (distance > SWIPE_THRESHOLD) {
      setIndex((current) => Math.max(current - 1, 0));
    }
  }, [offers.length]);

  return (
    <div className="flex w-full flex-col">
      <StreakOfferCelebrationCompact currentStreak={currentStreak}>
        <GiftHeadline count={offers.length} centered className="pt-1" />
      </StreakOfferCelebrationCompact>

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
                ((offers.length - 1) / 2 - index) * CARD_STEP
              }rem + ${drag}px))`,
            }}
          >
            {offers.map((offer, cardIndex) => (
              <CarouselCard
                key={offer.impressionUid}
                offer={offer}
                isActive={cardIndex === index}
                onSelect={() => setIndex(cardIndex)}
              />
            ))}
          </div>
        </div>

        {offers.length > 1 && (
          <div className="flex items-center gap-2">
            {offers.map((offer, dotIndex) => (
              <button
                key={offer.impressionUid}
                type="button"
                aria-label={`Show ${offer.advertiserName}`}
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
        )}

        <div className="flex w-full flex-col gap-2 px-6">
          <FinePrint className="text-center" />
          {isClaimed ? (
            <ClaimedChip className="h-12 gap-2 typo-callout">
              {`${active.advertiserName} gift claimed`}
            </ClaimedChip>
          ) : (
            <Button
              className="w-full"
              size={ButtonSize.Large}
              variant={ButtonVariant.Primary}
              disabled={!active}
              onClick={() => active && onClaim(active)}
            >
              Claim gift
            </Button>
          )}
          <Button
            className="w-full"
            size={ButtonSize.Medium}
            variant={ButtonVariant.Float}
            onClick={onDecline}
          >
            No thanks
          </Button>
        </div>
      </div>
    </div>
  );
};
