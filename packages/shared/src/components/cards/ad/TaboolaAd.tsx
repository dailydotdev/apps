import type { ReactElement, ReactNode } from 'react';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { ClickableCard } from '../common/Card';
import { ListCard } from '../common/list/ListCard';
import { PlaceholderGrid } from '../placeholder/PlaceholderGrid';
import { PlaceholderList } from '../placeholder/PlaceholderList';
import { AdvertiseLink } from './common/AdvertiseLink';
import { RemoveAd } from './common/RemoveAd';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { TargetId } from '../../../lib/log';
import { useAdLabel } from '../../../features/monetization/useAdLabel';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import type { TaboolaResult } from '../../../features/monetization/taboola';
import {
  getTaboolaContainerId,
  requestTaboolaPlacement,
} from '../../../features/monetization/taboola';

interface TaboolaAdProps {
  placement: number;
  isList?: boolean;
  /** As `AdGrid`'s: the creative takes the height the copy leaves, no footer. */
  isCompact?: boolean;
  /** The house ad, for when Taboola has nothing for the slot. */
  fallback: ReactNode;
  onClick?: () => void;
  className?: string;
}

/**
 * A feed slot Taboola fills. The placeholder holds the slot while Taboola
 * renders into an invisible card of the same size on top of it, and the two
 * swap once an item is in, so the slot never shows a half-drawn unit or jumps.
 * `taboola.css` lays Taboola's item out as our own ad card, `AdGrid` or
 * `AdList`, and the footer row is ours.
 */
export const TaboolaAd = forwardRef<HTMLElement, TaboolaAdProps>(
  function TaboolaAd(
    { placement, isList, isCompact, fallback, onClick, className },
    ref,
  ): ReactElement {
    const containerRef = useRef<HTMLDivElement>(null);
    const [result, setResult] = useState<TaboolaResult>();
    const { isPlus } = usePlusSubscription();
    const { showAdvertiseLink } = useAdLabel();
    const CardTag = isList ? ListCard : ClickableCard;
    const PlaceholderTag = isList ? PlaceholderList : PlaceholderGrid;
    const isFilled = result === 'filled';

    useEffect(() => {
      if (!containerRef.current) {
        return undefined;
      }

      return requestTaboolaPlacement({
        placement,
        container: containerRef.current,
        onResult: setResult,
      });
    }, [placement]);

    if (result === 'empty') {
      return <>{fallback}</>;
    }

    return (
      <div className={classNames('relative flex h-full flex-col', className)}>
        {!isFilled && <PlaceholderTag className="flex-1" />}
        <CardTag
          ref={ref}
          data-testid="taboolaAdItem"
          aria-hidden={!isFilled}
          className={classNames(
            'taboola-feed-ad flex-1',
            isList ? 'taboola-feed-ad--list' : 'taboola-feed-ad--grid',
            isCompact && 'taboola-feed-ad--compact overflow-hidden',
            !isFilled && 'invisible absolute inset-0',
          )}
          onClickCapture={onClick}
        >
          <div
            id={getTaboolaContainerId(placement)}
            ref={containerRef}
            className={classNames(!isList && 'flex min-h-0 flex-1 flex-col')}
          />
          {!isCompact && (
            <div
              className={classNames(
                'flex items-center',
                isList
                  ? // AdList's footer sits under the title, beside the creative.
                    'relative z-1 mt-4 tablet:absolute tablet:bottom-6 tablet:left-4 tablet:right-[17rem] tablet:mt-0'
                  : 'mx-1 my-1',
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
          )}
        </CardTag>
      </div>
    );
  },
);
