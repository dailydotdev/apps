import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { AppleIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import LogoIcon from '../../svg/LogoIcon';
import type { MarketingCta } from '../marketing/cta/common';
import { useBoot } from '../../hooks';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetType } from '../../lib/log';
import { openIOSWriteReview, requestIOSReview } from '../../lib/ios';

// The ask Customer.io schedules through the `app_store_review` marketing CTA.
// Apple's own rating pop-up is requested on its own a moment after the sheet
// lands, never from a tap, and whether it shows is Apple's call. The button
// opens the App Store's write-a-review screen, which always works, so the
// sheet stands on its own when the pop-up stays away.
export const appStoreReviewCopy = {
  headline: 'A little love goes a long way.',
  emoji: '❤️',
  text: 'If daily.dev has made your day a little better, a quick rating would mean a lot to us.',
  cta: 'Rate daily.dev',
  ctaLabel: 'Rate daily.dev on the App Store',
  dismiss: 'Not now',
};

// Apple's sample asks only after people pause on a finished step.
export const appStoreReviewRequestDelayMs = 2000;

export interface AppStoreReviewModalProps extends ModalProps {
  marketingCta: MarketingCta;
}

export default function AppStoreReviewModal({
  marketingCta,
  onRequestClose,
  ...modalProps
}: AppStoreReviewModalProps): ReactElement {
  const { clearMarketingCta } = useBoot();
  const { logEvent } = useLogContext();
  const { campaignId, flags } = marketingCta;
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const hasOpened = useRef(false);
  const title = flags?.title || appStoreReviewCopy.headline;
  const description = flags?.description || appStoreReviewCopy.text;
  const ctaText = flags?.ctaText || appStoreReviewCopy.cta;

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

    // Scheduled when the sheet opens and never cancelled: closing it early
    // must not turn the pop-up into something only people who stay get, which
    // would be the review gating Apple rejects.
    setTimeout(() => {
      if (requestIOSReview()) {
        logEvent({
          event_name: LogEvent.RequestAppStoreReview,
          target_type: TargetType.AppStoreReview,
          target_id: campaignId,
        });
      }
    }, appStoreReviewRequestDelayMs);
  }, [campaignId, logEvent]);

  // Focus starts on the headline, not the CTA, so nobody rates by accident.
  useEffect(() => {
    const frame = requestAnimationFrame(() => headlineRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);

  const close = (
    event: React.MouseEvent | React.KeyboardEvent,
    eventName: LogEvent,
  ) => {
    logEvent({
      event_name: eventName,
      target_type: TargetType.AppStoreReview,
      target_id: campaignId,
    });
    clearMarketingCta(campaignId);
    onRequestClose?.(event);
  };

  const onRate = (event: React.MouseEvent) => {
    // A missing handler means the app is older than the bridge; the sheet
    // then closes with no error toast, since the ask is optional.
    openIOSWriteReview();
    close(event, LogEvent.Click);
  };

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.XSmall}
      onRequestClose={(event) => close(event, LogEvent.MarketingCtaDismiss)}
      isDrawerOnMobile
    >
      <Modal.Body className="gap-5 px-4 pb-4 pt-6 tablet:p-6">
        <div className="flex flex-col items-center gap-2 text-center">
          {flags?.image ? (
            <img
              src={flags.image}
              alt=""
              className="size-12 rounded-12 object-cover"
            />
          ) : (
            <span aria-hidden>
              <LogoIcon className={{ container: 'size-12' }} />
            </span>
          )}
          <Typography
            ref={headlineRef}
            type={TypographyType.Title2}
            tag={TypographyTag.H2}
            className="mt-2 outline-none"
            tabIndex={-1}
            bold
          >
            {title}
            {!flags?.title && (
              <>
                {' '}
                <span aria-hidden>{appStoreReviewCopy.emoji}</span>
              </>
            )}
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            {description}
          </Typography>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Large}
            icon={<AppleIcon />}
            aria-label={appStoreReviewCopy.ctaLabel}
            onClick={onRate}
          >
            {ctaText}
          </Button>
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Medium}
            onClick={(event: React.MouseEvent) =>
              close(event, LogEvent.MarketingCtaDismiss)
            }
          >
            {appStoreReviewCopy.dismiss}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
