import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { DevPlusIcon, GiftIcon } from '../icons';
import { IconSize } from '../Icon';
import { PlusUser } from '../PlusUser';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import type { MarketingCta } from '../marketing/cta/common';
import { LazyModal } from './common/types';
import { useLazyModal } from '../../hooks/useLazyModal';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { useAppStoreReviewAsk } from '../../hooks/useAppStoreReviewAsk';
import { AskCard } from '../appStoreReview/common';
import { LogEvent, TargetId } from '../../lib/log';

export const plusRenewalCopy = {
  headline: 'Thanks for staying with Plus',
  text: 'Glad to have you for another month.',
  gift: 'Gift Plus to a friend',
  back: 'Back to my feed',
};

export interface PlusRenewalReviewModalProps extends ModalProps {
  marketingCta: MarketingCta;
}

// The thank-you Customer.io schedules through the `app_store_review_plus`
// marketing CTA after a renewal or on a Plus anniversary. People who pay
// already decided daily.dev is worth it, so the ask sits inside a thank-you,
// and gifting Plus is the other way to spread the word. The campaign's copy
// wins over the defaults when it sets any.
export default function PlusRenewalReviewModal({
  marketingCta,
  onRequestClose,
  ...modalProps
}: PlusRenewalReviewModalProps): ReactElement {
  const { campaignId, flags } = marketingCta;
  const { onRate, onDismiss } = useAppStoreReviewAsk({
    campaignId,
    onRequestClose,
  });
  const { openModal } = useLazyModal();
  const { logSubscriptionEvent } = usePlusSubscription();
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => headlineRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);

  const onGift = (event: React.MouseEvent) => {
    logSubscriptionEvent({
      event_name: LogEvent.GiftSubscription,
      target_id: TargetId.AppStoreReviewPlus,
    });
    onDismiss(event);
    openModal({ type: LazyModal.GiftPlus, props: {} });
  };

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.XSmall}
      onRequestClose={onDismiss}
      isDrawerOnMobile
    >
      <Modal.Body className="gap-4 px-4 pb-4 pt-6 tablet:p-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span
            aria-hidden
            className="flex size-16 items-center justify-center rounded-20 bg-action-plus-float text-action-plus-default"
          >
            <DevPlusIcon secondary size={IconSize.XXLarge} />
          </span>
          <PlusUser typographyType={TypographyType.Callout} />
          <Typography
            ref={headlineRef}
            type={TypographyType.Title2}
            tag={TypographyTag.H2}
            className="outline-none"
            tabIndex={-1}
            bold
          >
            {flags?.title || plusRenewalCopy.headline}
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            {flags?.description || plusRenewalCopy.text}
          </Typography>
        </div>
        <AskCard onRate={onRate} />
        <div className="flex flex-col gap-2">
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Large}
            icon={<GiftIcon />}
            onClick={onGift}
          >
            {plusRenewalCopy.gift}
          </Button>
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Medium}
            onClick={onDismiss}
          >
            {plusRenewalCopy.back}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
