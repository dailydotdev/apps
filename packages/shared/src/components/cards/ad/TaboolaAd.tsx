import type { ReactElement, ReactNode } from 'react';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { ClickableCard } from '../common/Card';
import { ListCard } from '../common/list/ListCard';
import { PlaceholderGrid } from '../placeholder/PlaceholderGrid';
import { PlaceholderList } from '../placeholder/PlaceholderList';
import { AdvertiseLink } from './common/AdvertiseLink';
import { RemoveAd } from './common/RemoveAd';
import { TaboolaFrame } from './TaboolaFrame';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { TargetId } from '../../../lib/log';
import { isExtension } from '../../../lib/func';
import { featureGridCardTldr } from '../../../lib/featureManagement';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useAdLabel } from '../../../features/monetization/useAdLabel';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import type { TaboolaResult } from '../../../features/monetization/taboola';
import { requestTaboolaPlacement } from '../../../features/monetization/taboola';
import type { TaboolaVariant } from '../../../features/monetization/taboolaFrame';
import classed from '../../../lib/classed';

// FeedHeroAdCard's card: no chrome until it is hovered.
const HeroCard = classed(
  'article',
  'relative flex min-h-0 flex-col rounded-16 transition-colors hover:bg-surface-hover',
);

const cardTags = {
  grid: ClickableCard,
  fitted: ClickableCard,
  compact: ClickableCard,
  list: ListCard,
  hero: HeroCard,
};

/**
 * Taboola's item, laid out as one of our ad cards by `taboola.css`. The
 * extension's pages can't load Taboola's script, so there the embed page
 * renders it and this is the frame.
 */
export const TaboolaPlacement = ({
  placement,
  variant,
  isShortCover,
  onResult,
  onClick,
  url,
}: {
  placement: number;
  variant: TaboolaVariant;
  isShortCover?: boolean;
  onResult: (result: TaboolaResult) => void;
  onClick?: () => void;
  url?: string;
}): ReactElement => {
  const containerRef = useRef<HTMLDivElement>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;
  const isFramed = isExtension;

  useEffect(() => {
    if (isFramed || !containerRef.current) {
      return undefined;
    }

    return requestTaboolaPlacement({
      placement,
      container: containerRef.current,
      onResult: (result) => onResultRef.current(result),
      url,
    });
  }, [isFramed, placement, url]);

  if (isFramed) {
    return (
      <TaboolaFrame
        placement={placement}
        variant={variant}
        isShortCover={isShortCover}
        onResult={onResult}
        onClick={onClick}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={classNames(
        variant !== 'list' && 'flex min-h-0 flex-1 flex-col',
      )}
    />
  );
};

export const getTaboolaVariantClassName = (variant: TaboolaVariant): string =>
  classNames(
    'taboola-feed-ad',
    variant === 'list' ? 'taboola-feed-ad--list' : 'taboola-feed-ad--grid',
    variant === 'fitted' && 'taboola-feed-ad--fitted',
    variant === 'compact' && 'taboola-feed-ad--compact',
    variant === 'hero' && 'taboola-feed-ad--hero',
  );

interface TaboolaAdProps {
  placement: number;
  /**
   * The ad card the slot stands for: `AdGrid`, `AdGrid` fitted to a slot of
   * fixed height (the creative gives up height when the copy runs long),
   * `AdList`, `AdGrid`'s compact card (the creative takes the height the copy
   * leaves, no footer), or the feed hero's `FeedHeroAdCard`.
   */
  variant?: TaboolaVariant;
  /** The house ad, for when Taboola has nothing for the slot. */
  fallback: ReactNode;
  onClick?: () => void;
  className?: string;
}

/**
 * A feed slot Taboola fills. The placeholder holds the slot while Taboola
 * renders into an invisible card of the same size on top of it, and the two
 * swap once an item is in, so the slot never shows a half-drawn unit or jumps.
 * The footer row is ours.
 */
export const TaboolaAd = forwardRef<HTMLElement, TaboolaAdProps>(
  function TaboolaAd(
    { placement, variant = 'grid', fallback, onClick, className },
    ref,
  ): ReactElement {
    const [result, setResult] = useState<TaboolaResult>();
    const { isPlus } = usePlusSubscription();
    const { showAdvertiseLink } = useAdLabel();
    const isList = variant === 'list';
    const isHero = variant === 'hero';
    const { value: isTldrArm } = useConditionalFeature({
      feature: featureGridCardTldr,
      shouldEvaluate: variant === 'grid',
    });
    const CardTag = cardTags[variant];
    const PlaceholderTag = isList ? PlaceholderList : PlaceholderGrid;
    const isFilled = result === 'filled';

    if (result === 'empty') {
      return <>{fallback}</>;
    }

    const footer = variant !== 'compact' && (
      <div
        className={classNames(
          'flex items-center',
          isList &&
            // AdList's footer sits under the title, beside the creative.
            'relative z-1 mt-4 tablet:absolute tablet:bottom-6 tablet:left-4 tablet:right-[17rem] tablet:mt-0',
          isHero &&
            // FeedHeroAdCard's, under the card, lined up with the copy.
            'shrink-0 justify-between gap-2 px-1 pb-3 pt-2',
          (variant === 'grid' || variant === 'fitted') && 'mx-1 my-1',
        )}
      >
        {showAdvertiseLink && (
          <AdvertiseLink
            targetId={TargetId.AdCard}
            buttonStyle
            size={ButtonSize.Small}
          />
        )}
        <div className="ml-auto flex items-center gap-2">
          {!isPlus && (
            <RemoveAd
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              className="!font-normal typo-footnote"
            />
          )}
        </div>
      </div>
    );

    return (
      <div
        className={classNames(
          'relative flex flex-col',
          isHero ? 'min-h-0 flex-1' : 'h-full',
          className,
        )}
      >
        {!isFilled && <PlaceholderTag className="flex-1" />}
        <div
          aria-hidden={!isFilled}
          className={classNames(
            'flex flex-1 flex-col',
            !isFilled && 'invisible absolute inset-0',
          )}
        >
          <CardTag
            ref={ref}
            data-testid="taboolaAdItem"
            className={classNames(
              getTaboolaVariantClassName(variant),
              'flex-1',
              variant === 'compact' && 'overflow-hidden',
              isTldrArm && 'taboola-feed-ad--short-cover',
            )}
            onClickCapture={onClick}
          >
            <TaboolaPlacement
              placement={placement}
              variant={variant}
              isShortCover={isTldrArm}
              onResult={setResult}
              onClick={onClick}
            />
            {!isHero && footer}
          </CardTag>
          {isHero && footer}
        </div>
      </div>
    );
  },
);
