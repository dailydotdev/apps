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
import Link from '../../../components/utilities/Link';
import { Image } from '../../../components/image/Image';

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

  if (size === FeedWidgetSize.Small) {
    const [post] = lead;

    return (
      <Link href={post.commentsPermalink}>
        <a
          href={post.commentsPermalink}
          className="group relative flex min-h-0 flex-1 flex-col justify-end overflow-hidden rounded-16 bg-surface-float"
          onClick={() => cardProps.onPostClick?.(post)}
        >
          {!!post.image && (
            <Image
              src={post.image}
              alt=""
              className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
            />
          )}
          <span className="via-raw-pepper-90/60 pointer-events-none absolute inset-0 bg-gradient-to-t from-raw-pepper-90 to-transparent" />
          <span className="relative flex flex-col gap-1 p-4">
            <span className="line-clamp-3 font-bold text-white typo-callout">
              {post.title}
            </span>
            {!!post.source?.name && (
              <span className="text-white/70 truncate typo-footnote">
                {post.source.name}
              </span>
            )}
          </span>
        </a>
      </Link>
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
