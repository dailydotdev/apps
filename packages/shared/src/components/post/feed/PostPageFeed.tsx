import type { ReactElement } from 'react';
import React, { useId, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import Feed from '../../Feed';
import type { Post } from '../../../graphql/posts';
import { baseFeedSupportedTypes, FEED_V2_QUERY } from '../../../graphql/feed';
import { OtherFeedPage } from '../../../lib/query';
import { feature } from '../../../lib/featureManagement';
import {
  cloudinaryCharmNoPosts,
  cloudinaryCharmSearchNoResults,
} from '../../../lib/image';
import { useFeature } from '../../GrowthBookProvider';
import { useAuthContext } from '../../../contexts/AuthContext';
import { ActiveFeedNameContext } from '../../../contexts/ActiveFeedNameContext';
import { FeedLayoutProvider } from '../../../contexts/FeedContext';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '../../charm/CharmEmptyState';
import { TagLinks } from '../../TagLinks';
import { ButtonSize } from '../../buttons/Button';
import styles from './PostPageFeed.module.css';

// The post page feed (`post_page_feed`): after the comments, in the post's
// main column, under a "More for you" title, the reader's For you feed with
// the home page's query and ads. No tabs: one list that pages as the reader
// scrolls. The production Feed renders it;
// the `posts[id]` feed name already keeps it in list layout at every width.
// Signed-in readers only: the page decides (see pages/posts/[id]).

const postFeedName = { feedName: OtherFeedPage.Post };

export function PostPageFeed({ post }: { post: Post }): ReactElement {
  const headingId = useId();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const feedVersion = useFeature(feature.feedVersion);
  const variables = useMemo(
    () => ({ version: feedVersion, supportedTypes: baseFeedSupportedTypes }),
    [feedVersion],
  );
  const feedQueryKey = useMemo(
    () => ['postPageFeed', user?.id ?? 'anonymous', post.id],
    [post.id, user?.id],
  );
  const [hasCachedFeed] = useState(
    () => !!queryClient.getQueryData(feedQueryKey),
  );
  const { ref: inViewRef, inView } = useInView({
    rootMargin: '1200px 0px',
    triggerOnce: true,
    skip: hasCachedFeed,
  });
  const shouldRenderFeed = hasCachedFeed || inView;
  const excludedPostIds = useMemo(() => [post.id], [post.id]);

  return (
    <section
      ref={inViewRef}
      aria-labelledby={headingId}
      data-testid="postPageFeed"
      className={classNames(
        '-mx-4 mt-6 flex flex-col border-t border-border-subtlest-tertiary tablet:-mx-6 laptop:-mx-8',
        '[--post-feed-gutter:1rem] tablet:[--post-feed-gutter:1.5rem] laptop:[--post-feed-gutter:2rem]',
      )}
    >
      <h2
        id={headingId}
        className="px-[var(--post-feed-gutter)] pb-4 pt-6 font-bold typo-title3"
      >
        More for you
      </h2>
      <div className={styles.list} data-testid="postPageFeedList">
        {shouldRenderFeed && (
          // The home feed's layout settings, so the ads follow the same
          // template (the ad template experiment included) and page size.
          // One column: the cards stay in list layout under the post.
          <FeedLayoutProvider maxNumCards={1}>
            <ActiveFeedNameContext.Provider value={postFeedName}>
              <Feed
                feedName={OtherFeedPage.Post}
                feedQueryKey={feedQueryKey}
                query={FEED_V2_QUERY}
                variables={variables}
                excludedPostIds={excludedPostIds}
                disableListFrame
                disableTopHero
                disableHighlightCards
                className="desktopL:!max-w-full"
                emptyScreen={
                  <div className="flex w-full flex-col items-center py-6">
                    <CharmEmptyState
                      placement={CharmEmptyStatePlacement.Inline}
                      image={cloudinaryCharmSearchNoResults}
                      imageAlt="daily.dev charm searching with a magnifying glass"
                      title="Your feed is empty for now"
                      description="Follow this post’s tags to fill it with posts like this one."
                    />
                    {!!post.tags?.length && (
                      <div className="mt-6 w-full px-4">
                        <TagLinks
                          tags={post.tags}
                          className={{ container: 'justify-center gap-3' }}
                          buttonProps={{ size: ButtonSize.Large }}
                        />
                      </div>
                    )}
                  </div>
                }
                errorScreen={
                  <CharmEmptyState
                    placement={CharmEmptyStatePlacement.Inline}
                    image={cloudinaryCharmNoPosts}
                    imageAlt="daily.dev charm with an empty feed"
                    title="We couldn’t load more posts"
                    description="Your post is fine. The posts under it didn’t load."
                    action={{
                      label: 'Try again',
                      onClick: () =>
                        queryClient.resetQueries({ queryKey: feedQueryKey }),
                    }}
                    className="py-10"
                  />
                }
              />
            </ActiveFeedNameContext.Provider>
          </FeedLayoutProvider>
        )}
      </div>
    </section>
  );
}
