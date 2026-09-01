import type { ReactElement } from 'react';
import React, { useCallback, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { UserOffer } from '../../../graphql/offers';
import { confirmOffersDelivered } from '../../../graphql/offers';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import type { DailyQuestSummary } from '../../../hooks/useQuestDashboard';
import { useViewSize, ViewSize } from '../../../hooks/useViewSize';
import useLogEventOnce from '../../../hooks/log/useLogEventOnce';
import { QuestOfferCarousel } from '../../quest/offers/QuestOfferCarousel';
import { QuestOfferSplit } from '../../quest/offers/QuestOfferSplit';
import { Modal } from '../common/Modal';
import { ModalClose } from '../common/ModalClose';
import type { LazyModalCommonProps, ModalProps } from '../common/Modal';

export type QuestOffersModalProps = LazyModalCommonProps &
  Pick<ModalProps, 'ariaHideApp'> & {
    level: number;
    levelProgress: number;
    summary: DailyQuestSummary;
    offers: UserOffer[];
  };

export default function QuestOffersModal({
  level,
  levelProgress,
  summary,
  offers,
  onRequestClose,
  ...props
}: QuestOffersModalProps): ReactElement {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { logEvent } = useLogContext();
  const [claimedUids, setClaimedUids] = useState<Set<string>>(new Set());
  const [deliveredUids] = useState<Set<string>>(new Set());
  const { mutate: confirmDelivered } = useMutation({
    mutationFn: confirmOffersDelivered,
  });

  useLogEventOnce(() => ({
    event_name: LogEvent.Impression,
    target_type: TargetType.QuestsCompleted,
    target_id: summary.claimed.toString(),
  }));

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
          target_type: TargetType.QuestOffer,
          target_id: offer.impressionUid,
          extra: JSON.stringify({
            brand: offer.advertiserName,
            questsCompleted: summary.claimed,
          }),
        }),
      );
    },
    [confirmDelivered, deliveredUids, logEvent, summary.claimed],
  );

  const onClaim = useCallback(
    (offer: UserOffer) => {
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.QuestOffer,
        target_id: offer.impressionUid,
        extra: JSON.stringify({
          brand: offer.advertiserName,
          questsCompleted: summary.claimed,
        }),
      });
      window.open(offer.clickUrl, '_blank', 'noopener,noreferrer');
      setClaimedUids((current) => new Set(current).add(offer.impressionUid));
    },
    [logEvent, summary.claimed],
  );

  // Every dismissal path (X, backdrop, escape, "No thanks") funnels through
  // here so the metric is comparable across variants and platforms; the
  // method and claim count distinguish explicit declines in analysis.
  const dismissLogged = useRef(false);
  const logDismiss = useCallback(
    (method: 'close' | 'decline') => {
      if (dismissLogged.current) {
        return;
      }

      dismissLogged.current = true;
      logEvent({
        event_name: LogEvent.DismissQuestOffers,
        target_type: TargetType.QuestOffer,
        target_id: summary.claimed.toString(),
        extra: JSON.stringify({ method, claimed: claimedUids.size }),
      });
    },
    [claimedUids.size, logEvent, summary.claimed],
  );

  const onClose = useCallback(
    (event?: React.MouseEvent | React.KeyboardEvent) => {
      logDismiss('close');
      onRequestClose(event);
    },
    [logDismiss, onRequestClose],
  );

  const onDecline = useCallback(() => {
    logDismiss('decline');
    onRequestClose();
  }, [logDismiss, onRequestClose]);

  return (
    <Modal
      {...props}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Large}
      onRequestClose={onClose}
      isDrawerOnMobile
    >
      {/* The celebration gradient must clip to the same radius as the modal
          container (tablet:rounded-16) and the mobile drawer (rounded-t-16),
          otherwise its square corners paint outside the rounded frame. */}
      <Modal.Body className="relative overflow-hidden rounded-t-16 !p-0 tablet:rounded-16">
        <ModalClose onClick={onClose} className="right-4 top-4 z-2" />
        {isMobile ? (
          <QuestOfferCarousel
            level={level}
            levelProgress={levelProgress}
            summary={summary}
            offers={offers}
            claimedUids={claimedUids}
            onClaim={onClaim}
            onDecline={onDecline}
            onVisible={onVisible}
          />
        ) : (
          <QuestOfferSplit
            level={level}
            levelProgress={levelProgress}
            summary={summary}
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
