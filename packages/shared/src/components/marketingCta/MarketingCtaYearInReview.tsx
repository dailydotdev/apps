import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { Card } from '../cards/common/Card';
import type { MarketingCta } from './common';
import { useBoot } from '../../hooks';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetType } from '../../lib/log';
import { webappUrl } from '../../lib/constants';
import Logo, { LogoPosition } from '../Logo';
import { MiniCloseIcon } from '../icons';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import styles from './MarketingCtaYearInReview.module.css';

const STARS = [
  {
    id: 'star-1',
    top: '10%',
    left: '6%',
    char: '✦',
    colorClass: 'text-accent-cheese-default',
    delay: 0,
    duration: 4,
    size: '1.5rem',
  },
  {
    id: 'star-2',
    top: '15%',
    right: '8%',
    char: '★',
    colorClass: 'text-accent-lettuce-default',
    delay: 0.7,
    duration: 4.5,
    size: '1.25rem',
  },
  {
    id: 'star-3',
    bottom: '20%',
    left: '8%',
    char: '✶',
    colorClass: 'text-accent-cabbage-default',
    delay: 1.3,
    duration: 5,
    size: '1.5rem',
  },
  {
    id: 'star-4',
    bottom: '12%',
    right: '6%',
    char: '✦',
    colorClass: 'text-accent-bun-default',
    delay: 0.4,
    duration: 5.5,
    size: '1.75rem',
  },
  {
    id: 'star-5',
    top: '45%',
    left: '4%',
    char: '★',
    colorClass: 'text-accent-blueCheese-default',
    delay: 1.8,
    duration: 6,
    size: '1rem',
  },
  {
    id: 'star-6',
    top: '50%',
    right: '5%',
    char: '◆',
    colorClass: 'text-accent-onion-default',
    delay: 0.9,
    duration: 4.8,
    size: '1.25rem',
  },
];

export function MarketingCtaYearInReview({
  marketingCta,
}: {
  marketingCta: MarketingCta;
}): ReactElement {
  const { clearMarketingCta } = useBoot();
  const { logEvent } = useLogContext();
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

  const handleClick = useCallback(() => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.PromotionCard,
      target_id: marketingCta.campaignId,
    });
    clearMarketingCta(marketingCta.campaignId);
  }, [clearMarketingCta, marketingCta.campaignId, logEvent]);

  const handleDismiss = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
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
    <Card className="!border-0 !bg-transparent !p-0">
      <a
        href={`${webappUrl}log`}
        onClick={handleClick}
        className="flex h-full cursor-pointer flex-col"
      >
        {/* Gradient border wrapper */}
        <div className="flex h-full flex-col rounded-[30px] bg-gradient-to-b from-accent-lettuce-default to-accent-cabbage-default p-1">
          {/* Inner content container - hardcoded dark theme colors since this feature is dark-only */}
          <div
            className="relative flex h-full flex-1 flex-col items-center justify-center overflow-hidden rounded-26 bg-raw-pepper-90 px-6 py-8"
            style={{ '--theme-text-primary': '#FFFFFF' } as React.CSSProperties}
          >
            {/* Dismiss button */}
            <Button
              className="absolute right-2 top-2 z-3"
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
              icon={<MiniCloseIcon />}
              aria-label="Dismiss"
              onClick={handleDismiss}
            />

            {/* Burst background */}
            <div className={styles.burstBackground} aria-hidden="true" />

            {/* Floating stars */}
            {STARS.map((star) => (
              <div
                key={star.id}
                className={classNames(
                  styles.star,
                  'absolute z-1',
                  star.colorClass,
                )}
                style={{
                  top: star.top,
                  left: star.left,
                  right: star.right,
                  bottom: star.bottom,
                  animationDuration: `${star.duration}s`,
                  animationDelay: `${star.delay}s`,
                  fontSize: star.size,
                }}
                aria-hidden="true"
              >
                {star.char}
              </div>
            ))}

            {/* Content */}
            <div className="relative z-2 flex flex-col items-center text-center">
              {/* Logo */}
              <div className="mb-4">
                <Logo
                  position={LogoPosition.Empty}
                  linkDisabled
                  logoClassName={{ container: 'h-6' }}
                />
              </div>

              {/* Year label */}
              <span className="mb-2 font-medium uppercase tracking-[0.2em] text-accent-cheese-default typo-footnote">
                Your year in review
              </span>

              {/* Main title - 2025 */}
              <span
                className="mb-1 font-bold text-white typo-mega1"
                style={{
                  textShadow: '3px 3px 0 #FF8E3B, 6px 6px 0 #CE3DF3',
                }}
              >
                2025
              </span>

              {/* Subtitle - LOG */}
              <span
                className="mb-4 font-bold tracking-[0.1em] text-accent-lettuce-default typo-title1"
                style={{
                  textShadow: '2px 2px 0 rgba(0, 0, 0, 0.3)',
                }}
              >
                LOG
              </span>

              {/* Divider */}
              <div className="mb-4 flex items-center gap-2">
                <div className="h-0.5 w-8 bg-accent-cheese-default" />
                <span className="text-accent-cabbage-default typo-footnote">
                  ◆
                </span>
                <div className="h-0.5 w-8 bg-accent-cheese-default" />
              </div>

              {/* Tagline */}
              <span className="font-mono tracking-wide text-raw-salt-90 typo-caption1">
                Discover your developer archetype
              </span>
            </div>
          </div>
        </div>
      </a>
    </Card>
  );
}
