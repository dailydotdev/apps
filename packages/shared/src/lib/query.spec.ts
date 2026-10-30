import { QueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import type { Ad } from '../graphql/posts';
import defaultAd from '../../__tests__/fixture/ad';
import defaultFeed from '../../__tests__/fixture/feed';
import { getAdConsentQueryKey } from '../features/monetization/adConsent';
import {
  createAdPostRollbackHandler,
  feedAdsQueryFilters,
  RequestKey,
  updateFeedAndAdsCache,
} from './query';

it('updates boosted posts across consent variants without changing rotation or other feed caches', () => {
  const client = new QueryClient();
  const feedKey = ['custom', 'consent-cache'];
  const post = { ...defaultFeed.edges[0].node, bookmarked: false };
  const ad = { ...defaultAd, data: { post } };
  const data: InfiniteData<Ad> = { pages: [ad], pageParams: [''] };
  const keys = ['before-consent', 'after-consent'].map((consentString) => [
    RequestKey.Ads,
    ...feedKey,
    ...getAdConsentQueryKey({ gdprApplies: true, consentString }),
  ]);
  keys.forEach((key) => client.setQueryData(key, data));
  const rotationKey = [...keys[0], 0];
  client.setQueryData(rotationKey, ad);
  const otherFeedKey = [RequestKey.Ads, 'custom', 'another-feed'];
  client.setQueryData(otherFeedKey, data);

  updateFeedAndAdsCache(post.id, feedKey, client, { bookmarked: true });

  keys.forEach((key) => {
    expect(
      client.getQueryData<InfiniteData<Ad>>(key)?.pages[0].data?.post
        ?.bookmarked,
    ).toBe(true);
  });
  expect(client.getQueryData(rotationKey)).toEqual(ad);
  expect(client.getQueryData(otherFeedKey)).toEqual(data);

  client.setQueriesData<InfiniteData<Ad>>(
    feedAdsQueryFilters(feedKey),
    createAdPostRollbackHandler(post.id, { bookmarked: false }),
  );
  keys.forEach((key) => {
    expect(
      client.getQueryData<InfiniteData<Ad>>(key)?.pages[0].data?.post
        ?.bookmarked,
    ).toBe(false);
  });
  client.clear();
});
