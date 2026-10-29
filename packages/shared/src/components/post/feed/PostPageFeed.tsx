import type { ReactElement } from 'react';
import React, { useCallback, useId, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import Feed from '../../Feed';
import type { Post } from '../../../graphql/posts';
import {
  baseFeedSupportedTypes,
  CUSTOM_FEED_QUERY,
  FEED_V2_QUERY,
  FOLLOWING_FEED_QUERY,
} from '../../../graphql/feed';
import { OtherFeedPage } from '../../../lib/query';
import { customFeedVersion, feature } from '../../../lib/featureManagement';
import { LogEvent } from '../../../lib/log';
import { webappUrl } from '../../../lib/constants';
import {
  cloudinaryCharmEmptySquads,
  cloudinaryCharmNoPosts,
  cloudinaryCharmNotEnoughTags,
  cloudinaryCharmSearchNoResults,
} from '../../../lib/image';
import { useFeature } from '../../GrowthBookProvider';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useFeeds } from '../../../hooks/feed/useFeeds';
import { useSortedFeeds } from '../../../hooks/feed/useSortedFeeds';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { ActiveFeedNameContext } from '../../../contexts/ActiveFeedNameContext';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '../../charm/CharmEmptyState';
import { TagLinks } from '../../TagLinks';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { ArrowIcon } from '../../icons/Arrow';
import Link from '../../utilities/Link';
import type { PostPageFeedTab } from './PostPageFeedTabs';
import { PostPageFeedTabs } from './PostPageFeedTabs';
import styles from './PostPageFeed.module.css';

// The post page feed (`post_page_feed`): after the comments, in the post's
// main column, the home page's feed tabs: For you, Following and the
// reader's custom feeds, with the home page's queries. The production Feed
// renders every tab; the `posts[id]` feed name already keeps it in list
// layout at every width. Signed-in readers only: the page decides (see
// pages/posts/[id]).

const FOR_YOU_ID = 'for_you';
const FOLLOWING_ID = 'following';

const postFeedName = { feedName: OtherFeedPage.Post };

type TabKind = 'forYou' | 'following' | 'custom';

interface FeedTab extends PostPageFeedTab {
  kind: TabKind;
  /** What the tab-switch log calls it: for_you, following, the feed id. */
  targetId: string;
  query: string;
  variables: Record<string, unknown>;
}

const scrollToTop = (): void =>
  globalThis?.window?.scrollTo({ top: 0, behavior: 'smooth' });

/** The end of a Following or custom feed tab. For you pages forever. */
const EndOfTab = ({ tab }: { tab: FeedTab }): ReactElement => (
  <div className="flex flex-col items-center gap-2 px-4 pb-4 pt-10 text-center">
    <strong className="typo-title3">You’re all caught up</strong>
    <p className="text-pretty text-text-tertiary typo-callout">
      That’s everything in {tab.label} for now.
    </p>
    <div className="mt-3 flex flex-wrap justify-center gap-3">
      <Button
        type="button"
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Small}
        icon={<ArrowIcon />}
        onClick={scrollToTop}
      >
        Back to top
      </Button>
      <Link href={webappUrl} passHref>
        <Button
          tag="a"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
        >
          Go to my feed
        </Button>
      </Link>
    </div>
  </div>
);

export function PostPageFeed({ post }: { post: Post }): ReactElement {
  const headingId = useId();
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const queryClient = useQueryClient();
  const feedVersion = useFeature(feature.feedVersion);
  const { feeds } = useFeeds();
  const customFeeds = useSortedFeeds({ edges: feeds?.edges });
  const activeTabQueryKey = useMemo(
    () => ['postPageFeedTab', user?.id ?? 'anonymous', post.id],
    [post.id, user?.id],
  );
  const [activeId, setActiveId] = useState(
    () => queryClient.getQueryData<string>(activeTabQueryKey) ?? FOR_YOU_ID,
  );
  const [hasSwitchedTab, setHasSwitchedTab] = useState(false);

  const { value: customFeedV } = useConditionalFeature({
    feature: customFeedVersion,
    shouldEvaluate: activeId.startsWith('feed:'),
  });

  const tabs = useMemo<FeedTab[]>(
    () => [
      {
        id: FOR_YOU_ID,
        label: 'For you',
        kind: 'forYou',
        targetId: FOR_YOU_ID,
        query: FEED_V2_QUERY,
        variables: {
          version: feedVersion,
          supportedTypes: baseFeedSupportedTypes,
        },
      },
      {
        id: FOLLOWING_ID,
        label: 'Following',
        kind: 'following',
        targetId: FOLLOWING_ID,
        query: FOLLOWING_FEED_QUERY,
        variables: { supportedTypes: baseFeedSupportedTypes },
      },
      ...customFeeds.map(
        ({ node: feed }): FeedTab => ({
          id: `feed:${feed.id}`,
          label: feed.flags?.name || `Feed ${feed.id}`,
          kind: 'custom',
          targetId: feed.id,
          query: CUSTOM_FEED_QUERY,
          variables: {
            feedId: feed.id,
            version: customFeedV,
            supportedTypes: baseFeedSupportedTypes,
          },
        }),
      ),
    ],
    [customFeedV, customFeeds, feedVersion],
  );

  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];
  const showTabs = tabs.length > 1;
  const feedQueryKey = useMemo(
    () => ['postPageFeed', user?.id ?? 'anonymous', post.id, active.id],
    [active.id, post.id, user?.id],
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
  const sectionRef = useRef<HTMLElement | null>(null);
  const setSectionRef = useCallback(
    (element: HTMLElement | null) => {
      sectionRef.current = element;
      inViewRef(element);
    },
    [inViewRef],
  );

  const onSelect = useCallback(
    (tab: PostPageFeedTab) => {
      const next = tabs.find((entry) => entry.id === tab.id);
      if (!next || next.id === activeId) {
        return;
      }
      setActiveId(next.id);
      setHasSwitchedTab(true);
      queryClient.setQueryData(activeTabQueryKey, next.id);
      const section = sectionRef.current;
      if (section && section.getBoundingClientRect().top < 0) {
        section.scrollIntoView({ block: 'start' });
      }
      logEvent({
        event_name: LogEvent.ChangePostPageFeedTab,
        target_id: next.targetId,
        extra: JSON.stringify({ post_id: post.id, kind: next.kind }),
      });
    },
    [activeId, activeTabQueryKey, logEvent, post.id, queryClient, tabs],
  );

  const excludedPostIds = useMemo(() => [post.id], [post.id]);

  const showForYou = {
    label: 'Show posts for you',
    onClick: () => onSelect(tabs[0]),
  };
  const emptyScreenByKind: Record<TabKind, ReactElement> = {
    forYou: (
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
    ),
    following: (
      <CharmEmptyState
        placement={CharmEmptyStatePlacement.Inline}
        image={cloudinaryCharmEmptySquads}
        imageAlt="daily.dev charm waving in an empty squad"
        title="Nothing from your follows yet"
        description="Posts from the people, squads and sources you follow land here."
        action={showForYou}
        className="py-10"
      />
    ),
    custom: (
      <CharmEmptyState
        placement={CharmEmptyStatePlacement.Inline}
        image={cloudinaryCharmNotEnoughTags}
        imageAlt="daily.dev charm holding tags"
        title="Your feed filters are too specific"
        description="Not enough posts match this feed's filters yet. Loosen them and it fills up."
        action={showForYou}
        className="py-10"
      />
    ),
  };

  return (
    <section
      ref={setSectionRef}
      aria-labelledby={headingId}
      data-testid="postPageFeed"
      className={classNames(
        '-mx-4 mt-6 flex scroll-mt-[var(--shell-top,0rem)] flex-col border-t border-border-subtlest-tertiary tablet:-mx-6 laptop:-mx-8',
        '[--post-feed-gutter:1rem] tablet:[--post-feed-gutter:1.5rem] laptop:[--post-feed-gutter:2rem]',
      )}
    >
      <h2 id={headingId} className="sr-only">
        Keep reading
      </h2>
      {showTabs && (
        <PostPageFeedTabs
          tabs={tabs}
          activeId={active.id}
          onSelect={onSelect}
        />
      )}
      <div
        className={classNames(
          styles.list,
          showTabs ? styles.tabbed : styles.untabbed,
          hasSwitchedTab && 'min-h-screen',
        )}
        data-testid="postPageFeedList"
      >
        {shouldRenderFeed && (
          <ActiveFeedNameContext.Provider value={postFeedName}>
            <Feed
              key={active.id}
              feedName={OtherFeedPage.Post}
              feedQueryKey={feedQueryKey}
              query={active.query}
              variables={active.variables}
              excludedPostIds={excludedPostIds}
              disableListFrame
              disableAds
              disableTopHero
              disableHighlightCards
              className="desktopL:!max-w-full"
              emptyScreen={emptyScreenByKind[active.kind]}
              footer={
                active.kind === 'forYou' ? undefined : <EndOfTab tab={active} />
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
        )}
      </div>
    </section>
  );
}
