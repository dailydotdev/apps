import type { MouseEvent, ReactElement } from 'react';
import React, { useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';
import type { MarketingCta } from './common';
import { ButtonV2, ButtonSize, ButtonVariant } from '../buttons/ButtonV2';
import { MiniCloseIcon, PlayIcon } from '../icons';
import { IconSize } from '../Icon';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { useBoot, useFeedLayout } from '../../hooks';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetType } from '../../lib/log';
import { anchorDefaultRel } from '../../lib/strings';
import styles from './MarketingCtaVideo.module.css';

export function MarketingCtaVideo({
  marketingCta,
}: {
  marketingCta: MarketingCta;
}): ReactElement {
  const { title, description, image, ctaUrl, ctaText, videoUrl } =
    marketingCta.flags;
  const { clearMarketingCta } = useBoot();
  const { logEvent } = useLogContext();
  const { shouldUseListFeedLayout } = useFeedLayout();
  const isImpressionTracked = useRef(false);

  useEffect(() => {
    if (isImpressionTracked.current) {
      return;
    }

    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.PromotionCard,
      target_id: marketingCta.campaignId,
    });
    isImpressionTracked.current = true;
  }, [marketingCta.campaignId, logEvent]);

  const onCtaClick = useCallback(() => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.PromotionCard,
      target_id: marketingCta.campaignId,
    });
    clearMarketingCta(marketingCta.campaignId);
  }, [clearMarketingCta, marketingCta.campaignId, logEvent]);

  const onDismiss = useCallback(
    (event?: MouseEvent | React.KeyboardEvent) => {
      event?.preventDefault();
      event?.stopPropagation();
      logEvent({
        event_name: LogEvent.MarketingCtaDismiss,
        target_type: TargetType.PromotionCard,
        target_id: marketingCta.campaignId,
      });
      clearMarketingCta(marketingCta.campaignId);
    },
    [clearMarketingCta, marketingCta.campaignId, logEvent],
  );

  return (
    <a
      href={ctaUrl}
      rel={anchorDefaultRel}
      target="_blank"
      onClick={onCtaClick}
      aria-label={ctaText || title}
      data-testid="marketing-cta-video"
      className={classNames(
        'group relative flex h-full w-full flex-col items-start justify-end gap-4 overflow-hidden rounded-16 p-4 no-underline transition-shadow hover:shadow-2',
        shouldUseListFeedLayout
          ? 'min-h-[17rem]'
          : 'max-h-cardLarge min-h-card',
        styles.card,
      )}
    >
      {videoUrl && (
        <video
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
          src={videoUrl}
          poster={image}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden
        />
      )}
      <div className="absolute inset-0 bg-overlay-tertiary-black opacity-50" />

      <ButtonV2
        className="absolute right-2 top-2 z-2"
        size={ButtonSize.Small}
        variant={ButtonVariant.Tertiary}
        icon={<MiniCloseIcon />}
        aria-label="Dismiss"
        onClick={onDismiss}
      />

      <div
        className="pointer-events-none absolute inset-0 z-1 flex items-center justify-center"
        aria-hidden
      >
        <span className="bg-black/60 flex size-24 items-center justify-center rounded-full text-white transition-transform group-hover:scale-110">
          <PlayIcon secondary size={IconSize.XXLarge} />
        </span>
      </div>

      <div className="relative z-1 flex w-full flex-col items-start gap-2">
        <span className="block w-full break-words text-left font-bold text-white typo-title3">
          {title}
        </span>
        {(description || image) && (
          <div className="flex items-center gap-2">
            {image && (
              <ProfilePicture
                user={{ image, username: description ?? '' }}
                size={ProfileImageSize.Large}
                rounded="full"
                className="shrink-0"
              />
            )}
            {description && (
              <span className="font-bold text-raw-salt-50 typo-footnote">
                {description}
              </span>
            )}
          </div>
        )}
      </div>
    </a>
  );
}
