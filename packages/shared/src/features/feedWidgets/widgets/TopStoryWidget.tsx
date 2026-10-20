import type { ReactElement } from 'react';
import React, { useCallback, useMemo } from 'react';
import { useLogContext } from '../../../contexts/LogContext';
import { usePostLogEvent } from '../../../lib/feed';
import { LogEvent, Origin } from '../../../lib/log';
import type { Post } from '../../../graphql/posts';
import { FeedHeroCarousel } from '../../../components/feeds/hero/FeedHeroCarousel';
import { useFeedHeroCardProps } from '../../../components/feeds/hero/useFeedHeroCardProps';
import { useFeedHeroData } from '../../../components/feeds/hero/useFeedHeroData';
import type { FeedWidgetComponentProps } from '../registry';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { useFeedWidgetsContext } from '../FeedWidgetsContext';
import { FeedWidgetEmpty } from '../FeedWidgetFrame';

/**
 * The lead story as a widget: one post, not a carousel, as the featured-wide
 * card across two columns at Large and the standard grid card at Tall.
 */
export const TopStoryWidget = ({
  size,
}: FeedWidgetComponentProps<FeedWidgetKind.TopStory>): ReactElement => {
  const { feedName } = useFeedWidgetsContext();
  const { logEvent } = useLogContext();
  const postLogEvent = usePostLogEvent();
  const { queryKey, posts, isPending } = useFeedHeroData();
  const lead = useMemo(() => posts.slice(0, 1), [posts]);
  const cardProps = useFeedHeroCardProps({ queryKey, feedName });

  const onPostImpression = useCallback(
    (post: Post) =>
      logEvent(
        postLogEvent(LogEvent.Impression, post, {
          extra: { origin: Origin.FeedHero },
        }),
      ),
    [logEvent, postLogEvent],
  );

  if (!lead.length) {
    return (
      <FeedWidgetEmpty
        kind={FeedWidgetKind.TopStory}
        isPending={isPending}
        message="No headlines right now."
      />
    );
  }

  return (
    <FeedHeroCarousel
      posts={lead}
      layout={size === FeedWidgetSize.Large ? 'wide' : 'split'}
      onPostImpression={onPostImpression}
      className="min-h-0 flex-1"
      {...cardProps}
    />
  );
};
