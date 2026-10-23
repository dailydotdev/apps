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
import { IconSize } from '../../../components/Icon';
import { HotIcon } from '../../../components/icons/Hot';

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
  // The live lead; the feed keeps every lead shown this session out of its
  // grid, so one that rotates off never drops into a painted page.
  const { queryKey, leadPost, isPending, isLeadFresh } = useFeedHeroData();
  const lead = useMemo(() => (leadPost ? [leadPost] : []), [leadPost]);
  const cardProps = useFeedHeroCardProps({
    queryKey,
    feedName,
    origin: Origin.FeedWidgets,
  });

  const onPostImpression = useCallback(
    (post: Post) =>
      logEvent(
        postLogEvent(LogEvent.Impression, post, {
          extra: { origin: Origin.FeedWidgets },
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
      !isLeadFresh ||
      !post ||
      loggedSmall.current.has(post.id)
    ) {
      return;
    }
    loggedSmall.current.add(post.id);
    onPostImpression(post);
  }, [isSmall, isSmallInView, isLeadFresh, lead, onPostImpression]);

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
          {/* The label sits on the artwork's busiest part, so it gets its own
              scrim. */}
          <span className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-overlay-primary-pepper to-transparent" />
          <span className="absolute inset-x-4 top-4 flex h-6 min-w-0 items-center gap-1.5 text-white">
            <HotIcon secondary size={IconSize.Size16} className="shrink-0" />
            <span className="truncate font-bold typo-caption1">Top story</span>
          </span>
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
      // A lead painted from the last load's cache may be swapped as soon as
      // the refetch lands; only the live one counts as seen.
      onPostImpression={isLeadFresh ? onPostImpression : undefined}
      hero="compact"
      hideWhyFeatured
      // The carousel's bottom inset lines it up with the hero's other columns;
      // on the rail the card fills its cell like every other widget.
      className="min-h-0 flex-1 !pb-0"
      {...cardProps}
    />
  );
};
