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
import { useAppStoreReviewAsk } from '../../hooks/useAppStoreReviewAsk';
import { appStoreReviewCopy, AskHeadline } from '../appStoreReview/common';

export interface AppStoreReviewModalProps extends ModalProps {
  marketingCta: MarketingCta;
}

// The plain ask Customer.io schedules through the `app_store_review`
// marketing CTA: a streak milestone, a heavy reading week, a big release.
// The campaign's copy wins over the defaults when it sets any.
export default function AppStoreReviewModal({
  marketingCta,
  onRequestClose,
  ...modalProps
}: AppStoreReviewModalProps): ReactElement {
  const { campaignId, flags } = marketingCta;
  const { onRate, onDismiss } = useAppStoreReviewAsk({
    campaignId,
    onRequestClose,
  });
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const description = flags?.description || appStoreReviewCopy.text;
  const ctaText = flags?.ctaText || appStoreReviewCopy.cta;

  // Focus starts on the headline, not the CTA, so nobody rates by accident.
  useEffect(() => {
    const frame = requestAnimationFrame(() => headlineRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.XSmall}
      onRequestClose={onDismiss}
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
            {flags?.title || <AskHeadline />}
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
            onClick={onDismiss}
          >
            {appStoreReviewCopy.dismiss}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
