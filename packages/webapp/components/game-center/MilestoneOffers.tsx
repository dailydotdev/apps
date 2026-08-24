import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  ClaimedChip,
  OfferLogo,
  offerBadgeLabels,
} from '@dailydotdev/shared/src/components/streak/offers/common';
import type { UserOffer } from '@dailydotdev/shared/src/graphql/offers';
import {
  confirmOffersDelivered,
  OfferPlacement,
  userOffersQueryOptions,
} from '@dailydotdev/shared/src/graphql/offers';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent, TargetType } from '@dailydotdev/shared/src/lib/log';

export const OfferCard = ({
  offer,
  isClaimed,
  onClaim,
}: {
  offer: UserOffer;
  isClaimed: boolean;
  onClaim: (offer: UserOffer) => void;
}): ReactElement => {
  const subtitle = [
    offer.advertiserName,
    offer.perk ??
      offer.description ??
      (offer.badgeLabel && offerBadgeLabels[offer.badgeLabel]),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <article className="relative flex w-60 shrink-0 flex-col gap-2 overflow-hidden rounded-14 border border-border-subtlest-tertiary p-4">
      <div className="flex items-center justify-between gap-2">
        <OfferLogo offer={offer} className="size-8 rounded-8" />
        <Typography
          type={TypographyType.Subhead}
          color={TypographyColor.Quaternary}
        >
          Sponsored
        </Typography>
      </div>

      <Typography
        tag={TypographyTag.H4}
        type={TypographyType.Subhead}
        bold
        className="line-clamp-2"
      >
        {offer.title}
      </Typography>

      {subtitle && (
        <Typography
          type={TypographyType.Subhead}
          color={TypographyColor.Tertiary}
          className="line-clamp-2"
        >
          {subtitle}
        </Typography>
      )}

      <div className="mt-auto pt-1">
        {isClaimed ? (
          <ClaimedChip className="w-full px-2 py-2 typo-subhead">
            Claimed
          </ClaimedChip>
        ) : (
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            className="w-full"
            onClick={() => onClaim(offer)}
          >
            Claim
          </Button>
        )}
      </div>
    </article>
  );
};

type MilestoneOffersProps = {
  currentStreak: number;
};

export const MilestoneOffers = ({
  currentStreak,
}: MilestoneOffersProps): ReactElement | null => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const [claimedUids, setClaimedUids] = useState<Set<string>>(new Set());
  const deliveredUids = useRef<Set<string>>(new Set());
  const { mutate: confirmDelivered } = useMutation({
    mutationFn: confirmOffersDelivered,
  });

  const { data: offers = [] } = useQuery({
    ...userOffersQueryOptions({
      user,
      placement: OfferPlacement.StreakMilestone,
    }),
    enabled: !!user?.id,
  });

  // Render-then-confirm, as the popup does: an offer counts as delivered once
  // its card is on screen, and the set guards replays since Encore does not
  // dedupe.
  useEffect(() => {
    const fresh = offers.filter(
      (offer) => !deliveredUids.current.has(offer.impressionUid),
    );

    if (!fresh.length) {
      return;
    }

    fresh.forEach((offer) => deliveredUids.current.add(offer.impressionUid));
    confirmDelivered(fresh.map((offer) => offer.impressionUid));
    fresh.forEach((offer) =>
      logEvent({
        event_name: LogEvent.Impression,
        target_type: TargetType.StreakOffer,
        target_id: offer.impressionUid,
        extra: JSON.stringify({
          brand: offer.advertiserName,
          streak: currentStreak,
        }),
      }),
    );
  }, [confirmDelivered, currentStreak, logEvent, offers]);

  const onClaim = useCallback(
    (offer: UserOffer) => {
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.StreakOffer,
        target_id: offer.impressionUid,
        extra: JSON.stringify({
          brand: offer.advertiserName,
          streak: currentStreak,
        }),
      });
      window.open(offer.clickUrl, '_blank', 'noopener,noreferrer');
      setClaimedUids((current) => new Set(current).add(offer.impressionUid));
    },
    [currentStreak, logEvent],
  );

  if (!offers.length) {
    return null;
  }

  return (
    <>
      {offers.map((offer) => (
        <OfferCard
          key={offer.impressionUid}
          offer={offer}
          isClaimed={claimedUids.has(offer.impressionUid)}
          onClaim={onClaim}
        />
      ))}
    </>
  );
};
