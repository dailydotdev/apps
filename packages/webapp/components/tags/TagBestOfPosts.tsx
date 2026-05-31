import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import HorizontalFeed from '@dailydotdev/shared/src/components/feeds/HorizontalFeed';
import {
  MOST_DISCUSSED_FEED_QUERY,
  MOST_UPVOTED_FEED_QUERY,
  TAG_FEED_QUERY,
} from '@dailydotdev/shared/src/graphql/feed';
import { OtherFeedPage } from '@dailydotdev/shared/src/lib/query';
import { ActiveFeedNameContext } from '@dailydotdev/shared/src/contexts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import TabList from '@dailydotdev/shared/src/components/tabs/TabList';

const supportedTypes = [
  PostType.Article,
  PostType.VideoYouTube,
  PostType.Collection,
  PostType.Share,
  PostType.Freeform,
  PostType.LiveRoom,
];

type BestOfTabKey = 'top' | 'upvoted' | 'discussed';

interface BestOfTab {
  key: BestOfTabKey;
  label: string;
  query: string;
  feedName: OtherFeedPage;
  queryKeyPrefix: string;
}

const tabs: BestOfTab[] = [
  {
    key: 'top',
    label: 'Top posts',
    query: TAG_FEED_QUERY,
    feedName: OtherFeedPage.TagsTopPosts,
    queryKeyPrefix: 'tagsTopPosts',
  },
  {
    key: 'upvoted',
    label: 'Most upvoted',
    query: MOST_UPVOTED_FEED_QUERY,
    feedName: OtherFeedPage.TagsMostUpvoted,
    queryKeyPrefix: 'tagsMostUpvoted',
  },
  {
    key: 'discussed',
    label: 'Best discussed',
    query: MOST_DISCUSSED_FEED_QUERY,
    feedName: OtherFeedPage.TagsBestDiscussed,
    queryKeyPrefix: 'tagsBestDiscussed',
  },
];

interface TagBestOfPostsProps {
  tag: string;
  userId?: string;
}

/**
 * "Best of {tag}" — collapses the three previously-stacked horizontal feeds
 * (Top posts, Most upvoted, Best discussed) into a single tabbed surface.
 * Nothing is removed: every ranking is still reachable, just one tap away
 * instead of three full-height carousels competing for the same screen space.
 * The query keys/variables match the originals so the TanStack Query cache is
 * shared with anywhere else these feeds are used.
 */
export function TagBestOfPosts({
  tag,
  userId,
}: TagBestOfPostsProps): ReactElement {
  const [active, setActive] = useState<BestOfTabKey>('top');
  const activeTab = tabs.find((tab) => tab.key === active) ?? tabs[0];

  const variables = useMemo(() => {
    const base = { tag, supportedTypes };
    switch (activeTab.key) {
      case 'top':
        return { ...base, ranking: 'POPULARITY' };
      case 'upvoted':
        return { ...base, period: 365 };
      case 'discussed':
        return { ...base, period: 365 };
      default:
        return base;
    }
  }, [tag, activeTab.key]);

  return (
    <section className="mb-10 flex flex-col gap-1">
      <div className="mx-4 flex items-center gap-2 laptop:mx-4">
        <p className="font-bold typo-body">Best of {tag}</p>
      </div>
      <div className="mx-2 laptop:mx-2">
        <TabList<string>
          items={tabs.map((tab) => ({ label: tab.label }))}
          active={activeTab.label}
          onClick={(label) => {
            const next = tabs.find((tab) => tab.label === label);
            if (next) {
              setActive(next.key);
            }
          }}
          autoScrollActive
          className={{ item: '!py-2' }}
        />
      </div>
      <ActiveFeedNameContext.Provider value={{ feedName: activeTab.feedName }}>
        <HorizontalFeed
          key={activeTab.key}
          feedName={activeTab.feedName}
          feedQueryKey={[
            activeTab.queryKeyPrefix,
            userId ?? 'anonymous',
            Object.values(variables),
          ]}
          query={activeTab.query}
          variables={variables}
          title={{ copy: '' }}
          className="!mb-0 laptop:!mx-4"
          emptyScreen={<></>}
        />
      </ActiveFeedNameContext.Provider>
    </section>
  );
}
