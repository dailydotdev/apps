import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { QueryClient, QueryKey } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import type { Ad, Post } from '../../../graphql/posts';
import type { ViewabilityData } from '../../monetization/viewability';
import { useAuthContext } from '../../../contexts/AuthContext';
import { ActivePostContextProvider } from '../../../contexts/ActivePostContext';
import { Origin } from '../../../lib/log';
import { FeedItemType } from '../../../components/cards/common/common';
import { PostTypeToGridCard } from '../../../components/cards/common/gridCards';
import { ArticleGrid } from '../../../components/cards/article/ArticleGrid';
import { SquadAdGrid } from '../../../components/cards/ad/squad/SquadAdGrid';
import { AdPixel } from '../../../components/cards/ad/common/AdPixel';
import { AdMeasurement } from '../../../components/cards/ad/common/AdMeasurement';
import { AdViewability } from '../../../components/cards/ad/common/AdViewability';
import type { AdItem } from '../../../hooks/useFeed';
import {
  isBoostedPostCreative,
  isBoostedSquadCreative,
} from '../../../hooks/useFeed';
import { useFeedWidgetPostModal } from '../useFeedWidgetPostModal';
import { FeedCardContext } from '../../posts/FeedCardContext';
import type { PostCacheAdapter } from '../../../components/feeds/hero/useFeedHeroPostActions';
import { useFeedHeroCardProps } from '../../../components/feeds/hero/useFeedHeroCardProps';
import { useFeedWidgetsContext } from '../FeedWidgetsContext';
import { getFeedWidgetAdQueryKey } from '../feedState';

type BoostedPostAd = Ad & { data: { post: Post } };

export { isBoostedPostCreative, isBoostedSquadCreative };

/**
 * The modal's route state names the feed it navigates; the rail's slot gets
 * its own name so the feed on the same page, which can carry the same boost,
 * never opens the post as well.
 */
export const getFeedWidgetModalFeedName = (feedName: string): string =>
  `${feedName}:feed-widgets`;

/**
 * The rail's ad lives in its own query, under every consent variant of its
 * key: votes and bookmarks patch the boosted post there, so the card shows
 * them.
 */
const widgetAdPostCache = (queryKey: QueryKey): PostCacheAdapter => ({
  readPost: (client: QueryClient, id: string) =>
    client
      .getQueriesData<Ad | null>({ queryKey })
      .map(([, ad]) => ad?.data?.post)
      .find((post) => post?.id === id),
  writePost: (client: QueryClient, id: string, patch: Partial<Post>) =>
    client.setQueriesData<Ad | null>({ queryKey }, (ad) => {
      const post = ad?.data?.post;
      if (!ad || !post || post.id !== id) {
        return ad;
      }

      return { ...ad, data: { ...ad.data, post: { ...post, ...patch } } };
    }),
});

interface FeedWidgetBoostedAdProps<T extends Ad> {
  ad: T;
  onClick: () => void;
  onViewable: (data: ViewabilityData) => void;
}

/**
 * Must render under the card's `FeedCardContext`, so the post events it logs
 * carry `is_ad`. As in the feed, a boosted post's click is the post's own
 * click event, not an ad click, and it opens the post in the feed's modal.
 */
const BoostedPostCard = ({
  ad,
  onViewable,
}: Omit<FeedWidgetBoostedAdProps<BoostedPostAd>, 'onClick'>): ReactElement => {
  const { user } = useAuthContext();
  const { feedName } = useFeedWidgetsContext();
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => getFeedWidgetAdQueryKey(user), [user]);
  const cache = useMemo(() => widgetAdPostCache(queryKey), [queryKey]);
  const items = useMemo<AdItem[]>(
    () => [
      {
        type: FeedItemType.Ad,
        ad,
        index: 0,
        updatedAt: 0,
        dataUpdatedAt: 0,
      },
    ],
    [ad],
  );
  const { openPost, modal } = useFeedWidgetPostModal({
    items,
    feedName: getFeedWidgetModalFeedName(feedName),
    updatePost: (_, __, updated) =>
      cache.writePost(queryClient, updated.id, updated),
  });
  const cardProps = useFeedHeroCardProps({
    queryKey,
    feedName,
    origin: Origin.FeedWidgets,
    cache,
    onOpenPost: openPost,
  });
  const { post } = ad.data;
  const Card = PostTypeToGridCard[post.type] ?? ArticleGrid;

  return (
    <ActivePostContextProvider post={post}>
      <Card post={post} {...cardProps}>
        <AdPixel pixel={ad.pixel} />
        <AdMeasurement ad={ad} />
        <AdViewability ad={ad} onViewable={onViewable} />
      </Card>
      {modal}
    </ActivePostContextProvider>
  );
};

/**
 * A boost in the rail's slot: the boosted post or squad, as the feed renders
 * it. Skadi answers a boost with `data.post` or `data.source` and no creative
 * of its own, so the plain ad card would paint empty.
 */
export const FeedWidgetBoostedAd = ({
  ad,
  onClick,
  onViewable,
}: FeedWidgetBoostedAdProps<Ad>): ReactElement | null => {
  if (isBoostedSquadCreative(ad)) {
    return (
      <SquadAdGrid
        item={{
          type: FeedItemType.Ad,
          ad,
          index: 0,
          updatedAt: 0,
          dataUpdatedAt: 0,
        }}
        onClickAd={onClick}
        // The slot logs the impression on its own terms, as for every ad.
        onViewable={onViewable}
      />
    );
  }

  if (isBoostedPostCreative(ad)) {
    return (
      <FeedCardContext.Provider
        value={{ boostedBy: ad.data.post.author || ad.data.post.scout }}
      >
        <BoostedPostCard ad={ad} onViewable={onViewable} />
      </FeedCardContext.Provider>
    );
  }

  return null;
};
