import type { CSSProperties, ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useLogContext } from '../../../contexts/LogContext';
import { feedHighlightsLogEvent } from '../../../lib/feed';
import { getHighlightsUrl } from '../../../lib/links';
import { LogEvent, Origin } from '../../../lib/log';
import type { PostHighlight } from '../../../graphql/highlights';
import { RelativeTime } from '../../../components/utilities/RelativeTime';
import Link from '../../../components/utilities/Link';
import { Button } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import { CopyHighlightsLink } from '../../../components/highlights/CopyHighlightsLink';
import { useFeedHeroData } from '../../../components/feeds/hero/useFeedHeroData';
import type { FeedWidgetComponentProps } from '../registry';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { useFeedWidgetsContext } from '../FeedWidgetsContext';
import { FeedWidgetEmpty } from '../FeedWidgetFrame';
import { useWidgetScroll } from '../useWidgetScroll';

// The widget's own material: a newsroom on air, lit green from the live dot.
const liveStyle: CSSProperties = {
  backgroundImage:
    'radial-gradient(90% 60% at 0% 0%, color-mix(in srgb, var(--theme-accent-avocado-default) 22%, transparent) 0%, transparent 70%), linear-gradient(to right, color-mix(in srgb, var(--theme-accent-avocado-default) 60%, transparent), transparent 60%)',
  backgroundSize: '100% 100%, 100% 2px',
  backgroundRepeat: 'no-repeat',
};

const LiveDot = (): ReactElement => (
  <span aria-hidden className="relative flex size-4 shrink-0 items-center">
    <span className="absolute left-1 size-2 animate-ping rounded-max bg-accent-avocado-default opacity-50 motion-reduce:animate-none" />
    <span className="relative left-1 size-2 rounded-max bg-accent-avocado-default" />
  </span>
);

const HighlightRow = ({
  highlight,
  isSmall,
  onClick,
}: {
  highlight: PostHighlight;
  isSmall: boolean;
  onClick: () => void;
}): ReactElement => {
  const href = getHighlightsUrl(highlight.id);
  const time = (
    <RelativeTime dateTime={highlight.highlightedAt} maxHoursAgo={72} />
  );

  return (
    <li className="snap-start break-inside-avoid">
      <Link href={href}>
        <a
          href={href}
          onClick={onClick}
          className="group/highlight flex flex-col rounded-12 px-2 py-1.5 transition-colors duration-150 hover:bg-surface-hover focus-visible:bg-surface-hover motion-reduce:transition-none"
        >
          {isSmall ? (
            <>
              <span className="line-clamp-2 break-words font-bold text-text-primary typo-footnote">
                {highlight.headline}
              </span>
              <span className="truncate text-text-tertiary typo-caption1">
                {time}
              </span>
            </>
          ) : (
            // The time trails the headline in its own text flow, so it wraps
            // with the last word rather than taking a line of its own.
            <span className="break-words font-bold text-text-primary typo-callout">
              {highlight.headline}
              <span className="font-normal text-text-tertiary typo-footnote">
                <span aria-hidden> · </span>
                {time}
                <CopyHighlightsLink
                  className="-my-1 ml-1 mouse:pointer-events-none mouse:opacity-0 mouse:transition-opacity mouse:group-focus-within/highlight:opacity-100 mouse:group-hover/highlight:pointer-events-auto mouse:group-hover/highlight:opacity-100"
                  highlight={highlight}
                  origin={Origin.HighlightsCard}
                  size={ButtonSize.XSmall}
                />
              </span>
            </span>
          )}
        </a>
      </Link>
    </li>
  );
};

/** The hero's Happening Now list, the major headlines as they land. */
export const HappeningNowWidget = ({
  size,
}: FeedWidgetComponentProps<FeedWidgetKind.HappeningNow>): ReactElement => {
  const { feedName } = useFeedWidgetsContext();
  const { logEvent } = useLogContext();
  const { highlights, isPending } = useFeedHeroData();
  const scroll = useWidgetScroll();

  const logClick = useCallback(
    (action: string, clickedHighlight?: PostHighlight, position?: number) =>
      logEvent(
        feedHighlightsLogEvent(LogEvent.Click, {
          feedName,
          action,
          position,
          count: highlights.length,
          clickedHighlight,
          highlightIds: highlights.map(({ id }) => id),
          origin: Origin.FeedWidgets,
        }),
      ),
    [feedName, highlights, logEvent],
  );

  if (!highlights.length) {
    return (
      <FeedWidgetEmpty
        kind={FeedWidgetKind.HappeningNow}
        isPending={isPending}
        message="Nothing major right now."
      />
    );
  }

  const readAllHref = getHighlightsUrl(highlights[0].id);

  return (
    <div
      className="relative isolate flex min-h-0 min-w-0 flex-1 flex-col"
      data-size={size}
    >
      <span
        aria-hidden
        // Up to the card's top edge, where the live line runs.
        className="pointer-events-none absolute -inset-x-4 -bottom-4 -top-3 -z-1"
        style={liveStyle}
      />
      <header className="flex h-6 min-w-0 shrink-0 items-center gap-1.5 px-4">
        <LiveDot />
        <span className="truncate font-bold text-text-primary typo-caption1">
          Happening now
        </span>
        <Link href={readAllHref} passHref>
          <Button
            tag="a"
            href={readAllHref}
            aria-label="Read all highlights"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.XSmall}
            className="-mr-2 ml-auto"
            onClick={() => logClick('read_all_click')}
          >
            Read all
          </Button>
        </Link>
      </header>
      <div
        ref={scroll.ref}
        onScroll={scroll.onScroll}
        style={scroll.style}
        className={classNames('mt-2 px-2', scroll.className)}
      >
        <ul
          aria-label="Highlights"
          className={classNames(
            size === FeedWidgetSize.Large
              ? 'columns-2 gap-x-4'
              : 'flex flex-col gap-1',
          )}
        >
          {highlights.map((highlight, index) => (
            <HighlightRow
              key={highlight.id}
              highlight={highlight}
              isSmall={size === FeedWidgetSize.Small}
              onClick={() => logClick('highlight_click', highlight, index + 1)}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};
