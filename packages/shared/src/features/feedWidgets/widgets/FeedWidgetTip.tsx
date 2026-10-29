import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useInView } from 'react-intersection-observer';
import { useLogContext } from '../../../contexts/LogContext';
import useLogEventOnce from '../../../hooks/log/useLogEventOnce';
import { LogEvent, Origin } from '../../../lib/log';
import { IconSize } from '../../../components/Icon';
import { MinusIcon } from '../../../components/icons/Minus';
import { Button } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import Link from '../../../components/utilities/Link';
import { useSpotlight } from '../../../components/spotlight/SpotlightContext';
import { feedWidgetTipAccent, feedWidgetTipGlow } from '../../../styles/custom';
import { useInertRef } from '../FeedWidgetFrame';
import type { FeedWidgetTip as FeedWidgetTipItem } from '../tips';
import { feedWidgetTipLogEvent, tipsPageUrl } from '../tips';

const tipLogEvent = (eventName: LogEvent, tip: FeedWidgetTipItem) =>
  feedWidgetTipLogEvent(eventName, Origin.FeedWidgets, tip);

/**
 * A daily.dev tip over our slot, laid out like a promo card: its glyph and a
 * few words of title with All tips across from it, then one line of what to
 * do and the button that does it. The tip's accent lives only in a glow
 * behind the icon. It keeps the widgets' own inset and header height, so its
 * title sits level with the headers beside it. In edit mode it is removable,
 * never movable.
 */
export const FeedWidgetTip = ({
  tip,
  isEditing,
  onRemove,
}: {
  tip: FeedWidgetTipItem;
  isEditing: boolean;
  /** Absent where the rail cannot be written, such as a read-only rail. */
  onRemove?: () => void;
}): ReactElement => {
  const { logEvent } = useLogContext();
  const { open: openSearch } = useSpotlight();
  const isSearch = tip.id === 'search';
  // The slot's own terms: half of it on screen.
  const { ref, inView } = useInView({ threshold: 0.5 });
  useLogEventOnce(() => tipLogEvent(LogEvent.ImpressionFeedWidgetTip, tip), {
    condition: inView,
  });
  const contentRef = useInertRef<HTMLDivElement>(isEditing);
  const { icon: Icon } = tip;

  const action = (
    <Button
      tag={isSearch ? 'button' : 'a'}
      href={isSearch ? undefined : tip.href}
      {...(tip.isExternal && { target: '_blank', rel: 'noopener' })}
      variant={ButtonVariant.Float}
      size={ButtonSize.XSmall}
      className="shrink-0"
      onClick={() => {
        logEvent(tipLogEvent(LogEvent.ClickFeedWidgetTip, tip));
        if (isSearch) {
          openSearch();
        }
      }}
    >
      {tip.cta}
    </Button>
  );

  return (
    <div
      ref={ref}
      role="group"
      aria-label="daily.dev tip"
      className="relative flex shrink-0 flex-col"
      data-testid="feedWidgetTip"
      data-tip-id={tip.id}
    >
      <div
        ref={contentRef}
        className={classNames(
          'flex flex-col gap-1 rounded-16 border border-border-subtlest-tertiary bg-background-subtle px-4 py-3 transition-opacity',
          isEditing && 'opacity-60',
        )}
        style={{ backgroundImage: feedWidgetTipGlow(tip.tone) }}
      >
        <div className="flex h-6 items-center gap-2">
          <span
            aria-hidden
            className="flex size-5 items-center justify-center rounded-6 text-white"
            style={{ background: feedWidgetTipAccent(tip.tone) }}
          >
            <Icon secondary size={IconSize.Size16} />
          </span>
          <span className="min-w-0 flex-1 truncate font-bold text-text-primary typo-callout">
            {tip.headline}
          </span>
          {!isEditing && (
            <Link href={tipsPageUrl} passHref>
              <a
                href={tipsPageUrl}
                className="focus-outline rounded-4 text-text-tertiary typo-caption1 hover:text-text-primary"
              >
                All tips
              </a>
            </Link>
          )}
        </div>
        <div className="flex items-end gap-3">
          <span className="line-clamp-2 min-h-[2.5rem] min-w-0 flex-1 text-text-tertiary typo-subhead">
            {tip.blurb}
          </span>
          {tip.isExternal || isSearch ? (
            action
          ) : (
            <Link href={tip.href} passHref>
              {action}
            </Link>
          )}
        </div>
      </div>
      {isEditing && onRemove && (
        <button
          type="button"
          data-widget-control
          aria-label="Remove daily.dev tips"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={onRemove}
          className="feed-widget-controls-in absolute -left-2 -top-2 z-3 flex size-6 items-center justify-center rounded-max bg-text-primary text-surface-invert shadow-2"
        >
          <MinusIcon size={IconSize.Size16} />
        </button>
      )}
    </div>
  );
};
