import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { useLogContext } from '../../../contexts/LogContext';
import { feedHighlightsLogEvent } from '../../../lib/feed';
import { LogEvent, Origin } from '../../../lib/log';
import type { PostHighlight } from '../../../graphql/highlights';
import { HighlightCardContent } from '../../../components/cards/highlight/common';
import { useFeedHeroData } from '../../../components/feeds/hero/useFeedHeroData';
import type { FeedWidgetComponentProps } from '../registry';
import { FeedWidgetKind } from '../types';
import { useFeedWidgetsContext } from '../FeedWidgetsContext';
import { FeedWidgetEmpty } from '../FeedWidgetFrame';

/** The hero's Happening Now list, the feed card's own rows, in one widget. */
export const HappeningNowWidget = ({
  size,
}: FeedWidgetComponentProps<FeedWidgetKind.HappeningNow>): ReactElement => {
  const { feedName } = useFeedWidgetsContext();
  const { logEvent } = useLogContext();
  const { highlights, isPending } = useFeedHeroData();

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
          origin: Origin.Feed,
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

  return (
    <div
      className="group flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
      data-size={size}
    >
      <HighlightCardContent
        highlights={highlights}
        onHighlightClick={(highlight, position) =>
          logClick('highlight_click', highlight, position)
        }
        onReadAllClick={() => logClick('read_all_click')}
        variant="grid"
        compact
      />
    </div>
  );
};
