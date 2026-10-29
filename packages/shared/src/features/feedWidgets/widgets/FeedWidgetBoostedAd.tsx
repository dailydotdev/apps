import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { QueryClient, QueryKey } from '@tanstack/react-query';
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
import type { AdSquadItem } from '../../../hooks/useFeed';
import { FeedCardContext } from '../../posts/FeedCardContext';
import type { PostCacheAdapter } from '../../../components/feeds/hero/useFeedHeroPostActions';
import { useFeedHeroCardProps } from '../../../components/feeds/hero/useFeedHeroCardProps';
import { useFeedWidgetsContext } from '../FeedWidgetsContext';
import { getFeedWidgetAdQueryKey } from '../feedState';

type BoostedPostAd = Ad & { data: { post: Post } };
type BoostedSquadAd = AdSquadItem['ad'];

export const isBoostedPostCreative = (ad: Ad): ad is BoostedPostAd =>
  !!ad.data?.post;

export const isBoostedSquadCreative = (ad: Ad): ad is BoostedSquadAd =>
  !!ad.data?.source;

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
 * click event, not an ad click.
 */
const BoostedPostCard = ({
  ad,
  onViewable,
}: Omit<FeedWidgetBoostedAdProps<BoostedPostAd>, 'onClick'>): ReactElement => {
  const { user } = useAuthContext();
  const { feedName } = useFeedWidgetsContext();
  const queryKey = useMemo(() => getFeedWidgetAdQueryKey(user), [user]);
  const cache = useMemo(() => widgetAdPostCache(queryKey), [queryKey]);
  const cardProps = useFeedHeroCardProps({
    queryKey,
    feedName,
    origin: Origin.FeedWidgets,
    cache,
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
