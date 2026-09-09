import type { CSSProperties, ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { getHighlightsUrl } from '../../../components/cards/highlight/common';
import Link from '../../../components/utilities/Link';
import { RelativeTime } from '../../../components/utilities/RelativeTime';
import { useLogContext } from '../../../contexts/LogContext';
import type { StatuslineItem } from '../../../graphql/statusline';
import useLogEventOnce from '../../../hooks/log/useLogEventOnce';
import { feedHighlightsLogEvent } from '../../../lib/feed';
import {
  feedFrameInsetX,
  feedGutter,
  feedWidth,
} from '../../../components/utilities/common';
import { LogEvent, Origin } from '../../../lib/log';

const HEADLINES_FEED_NAME = 'sponsor-strip-headlines';

const isHeadline = (item: StatuslineItem) => item.kind === 'HEADLINE';

/**
 * A curated headline keeps the `/highlights` destination the Happening Now card
 * leads to, so the reader lands in the same curated context from either. Only a
 * popular post goes straight to its discussion page.
 */
const destinationOf = (item: StatuslineItem): string =>
  isHeadline(item) ? getHighlightsUrl(item.id) : item.permalink;

/**
 * The row carries more than fits on purpose: it should read as a ticker
 * continuing past the edge, not a list that happens to end. The fade is what
 * makes that read as intentional — a hard clip chops a headline in half and
 * looks like a bug.
 */
const fadeStyle: CSSProperties = {
  maskImage:
    'linear-gradient(to right, black calc(100% - 2.5rem), transparent)',
  WebkitMaskImage:
    'linear-gradient(to right, black calc(100% - 2.5rem), transparent)',
};

const ItemSignal = ({
  item,
}: {
  item: StatuslineItem;
}): ReactElement | null => {
  // Keyed on kind rather than on the timestamp being present, so a headline
  // served without one stays bare instead of falling through to an upvote
  // count it was never meant to show.
  if (isHeadline(item)) {
    return item.highlightedAt ? (
      <RelativeTime
        dateTime={item.highlightedAt}
        className="text-text-quaternary"
      />
    ) : null;
  }

  return item.upvotes > 0 ? (
    <span className="text-text-quaternary">{`▲${item.upvotes}`}</span>
  ) : null;
};

export const SponsorStripHeadlines = ({
  headlines,
  widthStyle,
}: {
  headlines: StatuslineItem[];
  widthStyle: CSSProperties;
}): ReactElement => {
  const { logEvent } = useLogContext();

  // Conditional because the row is mounted empty to hold its height open
  // while the query runs, and an impression logged then would report a ticker
  // of nothing.
  useLogEventOnce(
    () =>
      feedHighlightsLogEvent(LogEvent.Impression, {
        feedName: HEADLINES_FEED_NAME,
        action: 'impression',
        count: headlines.length,
        // Split by kind: `id` is a highlight id for a headline and a post id
        // for a popular post, so merging them would hand one field two key
        // spaces and silently mis-join against the highlights table.
        highlightIds: headlines.filter(isHeadline).map(({ id }) => id),
        postIds: headlines
          .filter((item) => !isHeadline(item))
          .map(({ id }) => id),
        origin: Origin.Feed,
      }),
    { condition: !!headlines.length },
  );

  const onHeadlineClick = useCallback(
    (item: StatuslineItem, position: number) =>
      logEvent(
        feedHighlightsLogEvent(LogEvent.Click, {
          feedName: HEADLINES_FEED_NAME,
          kind: item.kind,
          ...(isHeadline(item)
            ? {
                clickedHighlight: {
                  id: item.id,
                  headline: item.title,
                  post: { id: item.postId, commentsPermalink: item.permalink },
                },
              }
            : {
                clickedPost: {
                  id: item.postId,
                  title: item.title,
                  permalink: item.permalink,
                },
              }),
          position,
          origin: Origin.Feed,
        }),
      ),
    [logEvent],
  );

  return (
    <div
      data-testid="sponsorStripHeadlines"
      className="w-full border-t border-border-subtlest-tertiary bg-background-default"
    >
      <div className={classNames(feedGutter, feedWidth)} style={widthStyle}>
        {/* See the sponsor row: the frame inset is nested rather than stacked
          so the three horizontal paddings compose instead of racing. */}
        <div
          className={classNames('flex h-8 items-center gap-4', feedFrameInsetX)}
        >
          {/* The sacrificial left zone, and the reason the strip has two rows
            at all: the browser paints its link-status bubble over this corner,
            and a label losing a word to it costs nothing, where the row above
            it is the one somebody paid for. */}
          <span className="shrink-0 whitespace-nowrap text-text-quaternary typo-caption2">
            Trending
          </span>
          {/* Scrollable rather than merely clipped: the row carries more than
            it can show, and a reader who wants the headline under the fade has
            no other way to reach it. The bar is hidden because the fade
            already says the row continues. */}
          <div
            className="no-scrollbar flex min-w-0 flex-1 items-center gap-5 overflow-x-auto"
            style={fadeStyle}
          >
            {headlines.map((item, index) => {
              const href = destinationOf(item);

              return (
                <Link href={href} key={item.id}>
                  <a
                    href={href}
                    onClick={() => onHeadlineClick(item, index)}
                    className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-text-secondary typo-caption1 hover:text-text-primary"
                  >
                    {item.title}
                    <ItemSignal item={item} />
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
