import type { CSSProperties, ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { getHighlightsUrl } from '../../../components/cards/highlight/common';
import Link from '../../../components/utilities/Link';
import { RelativeTime } from '../../../components/utilities/RelativeTime';
import { useLogContext } from '../../../contexts/LogContext';
import type { PostHighlight } from '../../../graphql/highlights';
import useLogEventOnce from '../../../hooks/log/useLogEventOnce';
import { feedHighlightsLogEvent } from '../../../lib/feed';
import { DOCK_GUTTER } from './sponsorStripOffset';
import { LogEvent, Origin } from '../../../lib/log';

const HEADLINES_FEED_NAME = 'sponsor-strip-headlines';

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

export const SponsorStripHeadlines = ({
  headlines,
}: {
  headlines: PostHighlight[];
}): ReactElement => {
  const { logEvent } = useLogContext();

  useLogEventOnce(() =>
    feedHighlightsLogEvent(LogEvent.Impression, {
      feedName: HEADLINES_FEED_NAME,
      action: 'impression',
      count: headlines.length,
      highlightIds: headlines.map(({ id }) => id),
      origin: Origin.Feed,
    }),
  );

  const onHeadlineClick = useCallback(
    (highlight: PostHighlight, position: number) =>
      logEvent(
        feedHighlightsLogEvent(LogEvent.Click, {
          feedName: HEADLINES_FEED_NAME,
          clickedHighlight: highlight,
          position,
          origin: Origin.Feed,
        }),
      ),
    [logEvent],
  );

  return (
    <div
      data-testid="sponsorStripHeadlines"
      className={classNames(
        'flex h-8 w-full items-center gap-4 border-t border-border-subtlest-tertiary bg-background-default',
        DOCK_GUTTER,
      )}
    >
      {/* The sacrificial left zone, and the reason the strip has two rows at
          all: the browser paints its link-status bubble over this corner, and
          a label losing a word to it costs nothing, where the row above it is
          the one somebody paid for. */}
      <span className="shrink-0 whitespace-nowrap text-text-quaternary typo-caption2">
        Breaking news
      </span>
      <div
        className="flex min-w-0 flex-1 items-center gap-5 overflow-hidden"
        style={fadeStyle}
      >
        {headlines.map((highlight, index) => (
          <Link href={getHighlightsUrl(highlight.id)} key={highlight.id}>
            <a
              href={getHighlightsUrl(highlight.id)}
              onClick={() => onHeadlineClick(highlight, index)}
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-text-secondary typo-caption1 hover:text-text-primary"
            >
              {highlight.headline}
              <RelativeTime
                dateTime={highlight.highlightedAt}
                className="text-text-quaternary"
              />
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
};
