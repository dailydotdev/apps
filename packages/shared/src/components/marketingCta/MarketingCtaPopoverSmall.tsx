import React, { ReactElement, useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { CardCover } from '../cards/common/CardCover';
import { CTAButton, Description, MarketingCta, Title } from './common';
import { ViewSize, useBoot, useViewSize } from '../../hooks';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetType } from '../../lib/log';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { MiniCloseIcon } from '../icons';
import { Button } from '../buttons/Button';

export function MarketingCtaPopoverSmall({
  marketingCta,
}: {
  marketingCta: MarketingCta;
}): ReactElement {
  const { title, description, image, ctaUrl, ctaText } = marketingCta.flags;
  const { clearMarketingCta } = useBoot();
  const { logEvent } = useLogContext();
  const isImpressionTracked = useRef(false);
  const isMobile = useViewSize(ViewSize.MobileL);

  useEffect(() => {
    if (isImpressionTracked.current) {
      return;
    }

    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.MarketingCtaPopoverSmall,
      target_id: marketingCta.campaignId,
    });
    isImpressionTracked.current = true;
  }, [marketingCta.campaignId, logEvent]);

  const onCtaClick = useCallback(() => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.MarketingCtaPopoverSmall,
      target_id: marketingCta.campaignId,
    });
    clearMarketingCta(marketingCta.campaignId);
  }, [clearMarketingCta, marketingCta.campaignId, logEvent]);

  const onCtaDismiss = useCallback(() => {
    logEvent({
      event_name: LogEvent.MarketingCtaDismiss,
      target_type: TargetType.MarketingCtaPopoverSmall,
      target_id: marketingCta.campaignId,
    });
    clearMarketingCta(marketingCta.campaignId);
  }, [clearMarketingCta, marketingCta.campaignId, logEvent]);

  return (
    <article
      className={classNames(
        !isMobile &&
          'relative h-full max-w-64 rounded-16 border border-accent-onion-default bg-background-subtle shadow-2',
      )}
    >
      {image && (
        <CardCover
          imageProps={{
            loading: 'lazy',
            alt: 'Post Cover',
            src: image,
            className: classNames(
              'w-full',
              isMobile ? 'h-48' : 'rounded-[15px]',
            ),
          }}
        />
      )}
      <div
        className={classNames(
          'flex flex-col gap-4 p-4 pb-6 text-center',
          isMobile ? '!pb-0' : 'pb-6',
        )}
      >
        <Title className={classNames('!m-0', isMobile && '!typo-large-title')}>
          {title}
        </Title>
        {description && (
          <Description className={classNames(isMobile && '!typo-markdown')}>
            {description}
          </Description>
        )}
        {ctaUrl && ctaText && (
          <CTAButton
            buttonSize={ButtonSize.Medium}
            buttonVariant={
              isMobile ? ButtonVariant.Primary : ButtonVariant.Secondary
            }
            onClick={onCtaClick}
            ctaUrl={ctaUrl}
            ctaText={ctaText}
          />
        )}
        <Button
          size={isMobile ? ButtonSize.Medium : ButtonSize.Small}
          variant={isMobile ? ButtonVariant.Float : ButtonVariant.Primary}
          className={classNames(
            isMobile ? 'mb-4 w-full' : 'absolute right-2 top-2 z-1',
          )}
          icon={!isMobile && <MiniCloseIcon />}
          onClick={onCtaDismiss}
        >
          {isMobile ? 'Close' : null}
        </Button>
      </div>
    </article>
  );
}
