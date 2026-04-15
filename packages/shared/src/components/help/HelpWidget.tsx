import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useMarketingCtas } from '../../hooks/useMarketingCtas';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons/Arrow';
import { MiniCloseIcon } from '../icons/MiniClose';
import { SparkleIcon } from '../icons/Sparkle';
import { Pill, PillSize } from '../Pill';
import { CardCover } from '../cards/common/CardCover';
import { SimpleTooltip } from '../tooltips';
import { LogEvent, TargetType } from '../../lib/log';
import {
  CTAButton,
  Description,
  MarketingCtaVariant,
  Title,
} from '../marketingCta/common';
import type { MarketingCta } from '../marketingCta/common';
import styles from './HelpWidget.module.css';

const tagColorMap: Record<string, string> = {
  avocado: 'bg-action-upvote-float text-action-upvote-default',
  cabbage: 'bg-theme-overlay-float-cabbage text-brand-default',
};

const ANIMATION_DURATION_MS = 150;

interface HelpWidgetProps {
  sidebarExpanded: boolean;
}

export function HelpWidget({
  sidebarExpanded,
}: HelpWidgetProps): ReactElement | null {
  const { user } = useAuthContext();
  const { marketingCtas, dismiss } = useMarketingCtas(
    MarketingCtaVariant.HelpGuide,
  );
  const { logEvent } = useLogContext();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const trackedImpressionIds = useRef<Set<string>>(new Set());

  const itemCount = marketingCtas.length;
  const activeItem =
    itemCount > 0 ? marketingCtas[activeIndex % itemCount] : undefined;

  // Keep activeIndex in bounds when the underlying list shrinks (e.g. after dismiss).
  useEffect(() => {
    if (itemCount > 0 && activeIndex >= itemCount) {
      setActiveIndex(0);
    }
  }, [activeIndex, itemCount]);

  // Log Impression once per campaign — first time the user actually sees its content in the popover.
  useEffect(() => {
    if (!popoverOpen || !activeItem) {
      return;
    }
    if (trackedImpressionIds.current.has(activeItem.campaignId)) {
      return;
    }

    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.MarketingCtaHelpGuide,
      target_id: activeItem.campaignId,
    });
    trackedImpressionIds.current.add(activeItem.campaignId);
  }, [popoverOpen, activeItem, logEvent]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setPopoverOpen(false);
      }
    };

    if (popoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [popoverOpen]);

  const goToIndex = useCallback(
    (next: number) => {
      if (next === activeIndex || itemCount === 0) {
        return;
      }
      setIsExiting(true);
      setTimeout(() => {
        setActiveIndex(((next % itemCount) + itemCount) % itemCount);
        setIsExiting(false);
      }, ANIMATION_DURATION_MS);
    },
    [activeIndex, itemCount],
  );

  const goNext = useCallback(
    () => goToIndex(activeIndex + 1),
    [activeIndex, goToIndex],
  );
  const goPrev = useCallback(
    () => goToIndex(activeIndex - 1),
    [activeIndex, goToIndex],
  );

  const onCtaClick = useCallback(() => {
    if (!activeItem) {
      return;
    }
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.MarketingCtaHelpGuide,
      target_id: activeItem.campaignId,
    });
    dismiss(activeItem.campaignId);
  }, [activeItem, dismiss, logEvent]);

  const onDismiss = useCallback(() => {
    if (!activeItem) {
      setPopoverOpen(false);
      return;
    }
    logEvent({
      event_name: LogEvent.MarketingCtaDismiss,
      target_type: TargetType.MarketingCtaHelpGuide,
      target_id: activeItem.campaignId,
    });
    dismiss(activeItem.campaignId);
    // If this was the last item, the widget will unmount on the next render.
    // Otherwise, the index-clamp effect drops us back to the new item at the same position.
  }, [activeItem, dismiss, logEvent]);

  if (!user || itemCount === 0 || !activeItem) {
    return null;
  }

  const showNav = itemCount > 1;

  const trigger = (
    <button
      type="button"
      onClick={() => setPopoverOpen((open) => !open)}
      aria-label="Help guide"
      aria-expanded={popoverOpen}
      className={classNames(
        'relative mx-1 flex w-[calc(100%-0.5rem)] items-center rounded-10 transition-colors duration-150',
        'h-10 typo-callout laptop:h-9',
        'text-text-tertiary hover:bg-surface-hover hover:text-text-primary',
        sidebarExpanded
          ? 'pl-2 pr-5 laptop:pl-0 laptop:pr-3'
          : 'justify-center',
      )}
    >
      <span className="relative flex size-9 flex-shrink-0 items-center justify-center">
        <SparkleIcon className="size-5" />
        <span
          className={classNames(
            styles.notificationDot,
            'absolute right-1.5 top-1.5 size-2 rounded-full bg-accent-bacon-default',
          )}
        />
      </span>
      <span
        className={classNames(
          'flex-1 overflow-hidden truncate whitespace-nowrap text-left transition-[opacity,width] duration-300',
          sidebarExpanded ? 'opacity-100' : 'w-0 opacity-0',
        )}
        aria-hidden={!sidebarExpanded}
      >
        Help guide
      </span>
    </button>
  );

  return (
    <div className="flex-shrink-0 border-t border-border-subtlest-tertiary py-2">
      <div ref={triggerRef} className="relative">
        {sidebarExpanded ? (
          trigger
        ) : (
          <SimpleTooltip content="Help guide" placement="right">
            {trigger}
          </SimpleTooltip>
        )}

        {popoverOpen && (
          <div
            ref={popoverRef}
            className={classNames(
              'absolute bottom-0 left-full z-modal ml-2',
              isExiting ? styles.cardExit : styles.cardEnter,
            )}
          >
            {/* eslint-disable-next-line @typescript-eslint/no-use-before-define -- hoisted function */}
            <DetailCard
              activeItem={activeItem}
              activeIndex={activeIndex}
              itemCount={itemCount}
              showNav={showNav}
              onCtaClick={onCtaClick}
              onDismiss={onDismiss}
              onNext={goNext}
              onPrev={goPrev}
              onGoToIndex={goToIndex}
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface DetailCardProps {
  activeItem: MarketingCta;
  activeIndex: number;
  itemCount: number;
  showNav: boolean;
  onCtaClick: () => void;
  onDismiss: () => void;
  onNext: () => void;
  onPrev: () => void;
  onGoToIndex: (index: number) => void;
}

function DetailCard({
  activeItem,
  activeIndex,
  itemCount,
  showNav,
  onCtaClick,
  onDismiss,
  onNext,
  onPrev,
  onGoToIndex,
}: DetailCardProps): ReactElement {
  const { title, description, image, tagText, tagColor, ctaText, ctaUrl } =
    activeItem.flags;

  return (
    <div
      className={classNames(
        styles.card,
        'relative w-80 overflow-hidden rounded-16 border border-border-subtlest-tertiary',
        'bg-background-popover shadow-2',
      )}
    >
      <div className={styles.accentBar} />

      <Button
        size={ButtonSize.XSmall}
        variant={ButtonVariant.Tertiary}
        icon={<MiniCloseIcon />}
        className="absolute right-3 top-4 z-1 flex-shrink-0"
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          onDismiss();
        }}
        aria-label="Close"
      />

      {image && (
        <CardCover
          imageProps={{
            loading: 'lazy',
            alt: title,
            src: image,
            className: 'h-32 w-full object-cover',
          }}
        />
      )}

      <div className="relative px-5 pb-2 pt-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className={styles.iconGlow} />
            <div className="relative flex size-10 items-center justify-center rounded-12 bg-surface-hover">
              <SparkleIcon className="size-6 text-text-link" />
            </div>
          </div>
          {tagText && (
            <Pill
              label={tagText}
              className={tagColorMap[tagColor || 'avocado']}
              size={PillSize.Small}
              alignment={undefined}
            />
          )}
        </div>

        <Title className="mt-3 pr-6">{title}</Title>

        {description && (
          <Description className="mt-2">{description}</Description>
        )}

        <div className="mt-4 flex items-center gap-3">
          {ctaUrl && ctaText && (
            <CTAButton
              className={classNames('mt-0 w-auto', styles.ctaButton)}
              ctaUrl={ctaUrl}
              ctaText={ctaText}
              onClick={onCtaClick}
            />
          )}
          {showNav && (
            <div className="ml-auto flex items-center gap-1">
              <Button
                size={ButtonSize.XSmall}
                variant={ButtonVariant.Tertiary}
                icon={<ArrowIcon className="-rotate-90" />}
                onClick={onPrev}
                aria-label="Previous tip"
              />
              <span className="text-text-quaternary typo-caption1">
                {activeIndex + 1}/{itemCount}
              </span>
              <Button
                size={ButtonSize.XSmall}
                variant={ButtonVariant.Tertiary}
                icon={<ArrowIcon className="rotate-90" />}
                onClick={onNext}
                aria-label="Next tip"
              />
            </div>
          )}
        </div>
      </div>

      {showNav && (
        <div className="flex gap-1.5 px-5 pb-4 pt-3">
          {Array.from({ length: itemCount }).map((_, index) => (
            <button
              // Index-keyed because the underlying campaign list mutates on dismiss
              // and we just want a positional indicator, not per-item identity.
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              type="button"
              className={classNames(
                'h-1 flex-1 rounded-16 transition-colors duration-300',
                index === activeIndex ? 'bg-text-link' : 'bg-surface-hover',
                'hover:opacity-80 cursor-pointer',
              )}
              onClick={() => onGoToIndex(index)}
              aria-label={`Go to tip ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
