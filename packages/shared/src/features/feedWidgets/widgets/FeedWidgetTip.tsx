import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useInView } from 'react-intersection-observer';
import { useLogContext } from '../../../contexts/LogContext';
import useLogEventOnce from '../../../hooks/log/useLogEventOnce';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import { IconSize } from '../../../components/Icon';
import { ArrowIcon } from '../../../components/icons/Arrow';
import { MinusIcon } from '../../../components/icons/Minus';
import Link from '../../../components/utilities/Link';
import { feedWidgetTipAccent, feedWidgetTipWash } from '../../../styles/custom';
import type { FeedWidgetTip as FeedWidgetTipItem } from '../tips';
import { tipsPageUrl } from '../tips';

const tipLogEvent = (eventName: LogEvent, tip: FeedWidgetTipItem) => ({
  event_name: eventName,
  target_type: TargetType.FeedWidget,
  target_id: tip.id,
  extra: JSON.stringify({ origin: Origin.FeedWidgets }),
});

/**
 * A daily.dev tip, one row over our slot: the tip's accent washes in from the
 * leading edge, its icon sits solid in a tile and again as a glow that leans
 * in on hover. In edit mode it is removable, never movable.
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
  // The slot's own terms: half of it on screen.
  const { ref, inView } = useInView({ threshold: 0.5 });
  useLogEventOnce(() => tipLogEvent(LogEvent.ImpressionFeedWidgetTip, tip), {
    condition: inView,
  });
  const accent = feedWidgetTipAccent(tip.tone);
  const { icon: Icon } = tip;

  const strip = (
    <a
      href={tip.href}
      {...(tip.isExternal && { target: '_blank', rel: 'noopener' })}
      onClick={() => logEvent(tipLogEvent(LogEvent.ClickFeedWidgetTip, tip))}
      aria-label={`daily.dev tip: ${tip.title}`}
      tabIndex={isEditing ? -1 : undefined}
      className={classNames(
        'group/strip focus-outline relative flex h-14 min-w-0 items-center gap-3 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle px-3 transition-[border-color,transform] duration-150 hover:border-border-subtlest-secondary active:scale-[0.98] motion-reduce:transition-none',
        isEditing && 'pointer-events-none',
      )}
      style={{ backgroundImage: feedWidgetTipWash(tip.tone) }}
    >
      <span
        aria-hidden
        className="group-hover/strip:opacity-60 pointer-events-none absolute -right-6 top-1/2 size-24 -translate-y-1/2 rounded-max opacity-40 blur-20 transition-[opacity,transform] duration-300 group-hover/strip:scale-125 motion-reduce:transition-none"
        style={{ background: accent }}
      />
      <span
        aria-hidden
        className="relative flex size-9 shrink-0 items-center justify-center rounded-12 text-white shadow-2"
        style={{ background: accent }}
      >
        <Icon secondary size={IconSize.Small} />
      </span>
      <span className="relative flex min-w-0 flex-1 flex-col">
        <span
          className="truncate font-bold typo-caption1"
          style={{ color: accent }}
        >
          Tip · {tip.eyebrow}
        </span>
        <span className="truncate font-bold text-text-primary typo-footnote">
          {tip.title}
        </span>
      </span>
      <ArrowIcon
        aria-hidden
        size={IconSize.Size16}
        className="relative shrink-0 rotate-90 text-text-quaternary transition-[transform,opacity] group-hover/strip:translate-x-0.5 group-hover/strip:text-text-primary motion-reduce:transition-none mouse:group-hover/tip:opacity-0"
      />
    </a>
  );

  return (
    <div
      ref={ref}
      className="group/tip relative flex shrink-0 flex-col"
      data-testid="feedWidgetTip"
      data-tip-id={tip.id}
    >
      {tip.isExternal ? (
        strip
      ) : (
        <Link href={tip.href} passHref>
          {strip}
        </Link>
      )}
      {!isEditing && (
        // Over the arrow, shown with it on a touch screen and on hover or
        // focus with a mouse, so the title keeps its width.
        <Link href={tipsPageUrl} passHref>
          <a
            href={tipsPageUrl}
            className="focus-outline absolute right-2 top-1/2 z-1 flex h-6 -translate-y-1/2 items-center rounded-8 bg-background-default px-2 font-bold text-text-secondary shadow-2 transition-opacity typo-caption2 hover:text-text-primary motion-reduce:transition-none mouse:opacity-0 mouse:focus-visible:opacity-100 mouse:group-hover/tip:opacity-100"
          >
            All tips
          </a>
        </Link>
      )}
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
