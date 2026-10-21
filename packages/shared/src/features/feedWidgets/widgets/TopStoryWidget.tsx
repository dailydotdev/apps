import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
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
  // The lead held for the session, the same post the feed keeps out of its
  // grid, so the two never disagree while the query refreshes.
  const { queryKey, leadPost, isPending } = useFeedHeroData();
  const lead = useMemo(() => (leadPost ? [leadPost] : []), [leadPost]);
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

  // The carousel logs its impressions at Tall and Large; the Small tile has
  // to, on the same terms (half on screen, once per post), or every click on
  // it lands with no impression to divide by.
  const { ref: smallInViewRef, inView: isSmallInView } = useInView({
    threshold: 0.5,
  });
  const loggedSmall = useRef(new Set<string>());
  const isSmall = size === FeedWidgetSize.Small;
  useEffect(() => {
    const [post] = lead;
    if (
      !isSmall ||
      !isSmallInView ||
      !post ||
      loggedSmall.current.has(post.id)
    ) {
      return;
    }
    loggedSmall.current.add(post.id);
    onPostImpression(post);
  }, [isSmall, isSmallInView, lead, onPostImpression]);

  if (!lead.length) {
    return (
      <FeedWidgetEmpty
        kind={FeedWidgetKind.TopStory}
        isPending={isPending}
        message="No headlines right now."
      />
    );
  }

  if (isSmall) {
    const [post] = lead;

    return (
      <Link href={post.commentsPermalink}>
        <a
          ref={smallInViewRef}
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
