import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserOffer } from '../../../graphql/offers';
import { confirmOffersDelivered } from '../../../graphql/offers';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { useViewSize, ViewSize } from '../../../hooks/useViewSize';
import useLogEventOnce from '../../../hooks/log/useLogEventOnce';
import { StreakOfferCarousel } from '../../streak/offers/StreakOfferCarousel';
import { StreakOfferSplit } from '../../streak/offers/StreakOfferSplit';
import { Modal } from '../common/Modal';
import { ModalClose } from '../common/ModalClose';
import type { LazyModalCommonProps, ModalProps } from '../common/Modal';

export type StreakOffersModalProps = LazyModalCommonProps &
  Pick<ModalProps, 'ariaHideApp'> & {
    currentStreak: number;
    maxStreak: number;
    offers: UserOffer[];
  };

export default function StreakOffersModal({
  currentStreak,
  maxStreak,
  offers,
  onRequestClose,
  ...props
}: StreakOffersModalProps): ReactElement {
  const isMobile = useViewSize(ViewSize.MobileL);
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const [claimedUids, setClaimedUids] = useState<Set<string>>(new Set());
  const [deliveredUids] = useState<Set<string>>(new Set());
  const { mutate: confirmDelivered } = useMutation({
    mutationFn: confirmOffersDelivered,
  });

  useLogEventOnce(() => ({
    event_name: LogEvent.Impression,
    target_type: TargetType.StreaksMilestone,
    target_id: currentStreak?.toString(),
  }));

  const invalidatedStreak = useRef(false);

  useEffect(() => {
    if (invalidatedStreak.current) {
      return;
    }

    invalidatedStreak.current = true;
    // the streaks query is cached with a staleTime; the popup moment is when
    // it must refresh (mirrors NewStreakModal)
    queryClient.invalidateQueries({
      queryKey: generateQueryKey(RequestKey.UserStreak, user),
    });
  }, [queryClient, user]);

  // Render-then-confirm: each offer is confirmed once, at the moment it
  // becomes visible. Encore does not dedupe, so the set guards replays.
  const onVisible = useCallback(
    (visibleOffers: UserOffer[]) => {
      const fresh = visibleOffers.filter(
        (offer) => !deliveredUids.has(offer.impressionUid),
      );

      if (!fresh.length) {
        return;
      }

      fresh.forEach((offer) => deliveredUids.add(offer.impressionUid));
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
    },
    [confirmDelivered, currentStreak, deliveredUids, logEvent],
  );

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

  const onDecline = useCallback(() => {
    logEvent({
      event_name: LogEvent.DismissStreakOffers,
      target_type: TargetType.StreakOffer,
      target_id: currentStreak?.toString(),
    });
    onRequestClose();
  }, [currentStreak, logEvent, onRequestClose]);

  return (
    <Modal
      {...props}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Large}
      onRequestClose={onRequestClose}
      isDrawerOnMobile
    >
      <Modal.Body className="relative !p-0">
        <ModalClose onClick={onRequestClose} className="right-4 top-4 z-2" />
        {isMobile ? (
          <StreakOfferCarousel
            currentStreak={currentStreak}
            offers={offers}
            claimedUids={claimedUids}
            onClaim={onClaim}
            onDecline={onDecline}
            onVisible={onVisible}
          />
        ) : (
          <StreakOfferSplit
            currentStreak={currentStreak}
            maxStreak={maxStreak}
            offers={offers}
            claimedUids={claimedUids}
            onClaim={onClaim}
            onVisible={onVisible}
          />
        )}
      </Modal.Body>
    </Modal>
  );
}
