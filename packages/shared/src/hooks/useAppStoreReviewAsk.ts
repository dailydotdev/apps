import type React from 'react';
import { useEffect, useRef } from 'react';
import { useBoot } from './useBoot';
import { useLogContext } from '../contexts/LogContext';
import { LogEvent, TargetType } from '../lib/log';
import { openIOSWriteReview, requestIOSReview } from '../lib/ios';
import { appStoreReviewRequestDelayMs } from '../components/appStoreReview/common';

type CloseEvent = React.MouseEvent | React.KeyboardEvent;

interface UseAppStoreReviewAsk {
  // Opens the App Store's write-a-review screen, then closes the surface.
  onRate: (event: CloseEvent) => void;
  // Closes the surface without rating.
  onDismiss: (event: CloseEvent) => void;
}

/**
 * What every App Store review surface does the same way: log the impression,
 * ask iOS for Apple's rating pop-up after a short pause, and clear the
 * Customer.io marketing CTA behind it on any close so it is asked once.
 */
export const useAppStoreReviewAsk = ({
  campaignId,
  onRequestClose,
}: {
  campaignId: string;
  onRequestClose?: (event: CloseEvent) => void;
}): UseAppStoreReviewAsk => {
  const { clearMarketingCta } = useBoot();
  const { logEvent } = useLogContext();
  const hasOpened = useRef(false);
  const hasRated = useRef(false);

  useEffect(() => {
    if (hasOpened.current) {
      return;
    }
    hasOpened.current = true;

    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.AppStoreReview,
      target_id: campaignId,
    });

    // Scheduled when the surface opens and never cancelled: closing it early
    // must not turn the pop-up into something only people who stay get, which
    // would be the review gating Apple rejects. The one skip is a reader who
    // already tapped Rate: they are on the App Store writing a review, so the
    // pop-up would only spend one of Apple's yearly prompts on them.
    setTimeout(() => {
      if (!hasRated.current && requestIOSReview()) {
        logEvent({
          event_name: LogEvent.RequestAppStoreReview,
          target_type: TargetType.AppStoreReview,
          target_id: campaignId,
        });
      }
    }, appStoreReviewRequestDelayMs);
  }, [campaignId, logEvent]);

  const close = (event: CloseEvent, eventName: LogEvent) => {
    logEvent({
      event_name: eventName,
      target_type: TargetType.AppStoreReview,
      target_id: campaignId,
    });
    clearMarketingCta(campaignId);
    onRequestClose?.(event);
  };

  return {
    onRate: (event) => {
      hasRated.current = true;
      // A missing handler means the app is older than the bridge; the surface
      // then closes with no error toast, since the ask is optional.
      openIOSWriteReview();
      close(event, LogEvent.Click);
    },
    onDismiss: (event) => close(event, LogEvent.MarketingCtaDismiss),
  };
};
