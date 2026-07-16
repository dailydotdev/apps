import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useFeedLayout } from '@dailydotdev/shared/src/hooks/useFeedLayout';
import { FeedSettingsEdit } from '@dailydotdev/shared/src/components/feeds/FeedSettings/FeedSettingsEdit';
import { useRouter } from 'next/router';
import {
  useConditionalFeature,
  useFeeds,
  usePlusSubscription,
} from '@dailydotdev/shared/src/hooks';
import { FeedType } from '@dailydotdev/shared/src/graphql/feed';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import {
  FeedChipsVariant,
  featureFeedChips,
} from '@dailydotdev/shared/src/lib/featureManagement';

import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../../../components/layouts/MainFeedPage';
import {
  defaultOpenGraph,
  defaultSeo,
  noindexSeoProps,
} from '../../../next-seo';
import { getPageSeoTitles } from '../../../components/layouts/utils';

const seoTitles = getPageSeoTitles('Edit feed');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  ...defaultSeo,
  ...noindexSeoProps,
};

const EditFeedPage = (): ReactElement | null => {
  const router = useRouter();
  const { FeedPageLayoutComponent } = useFeedLayout();
  const feedSlugOrId = router.query.slugOrId as string;
  const { isPlus } = usePlusSubscription();
  const { value: feedChipsVariant } = useConditionalFeature({
    feature: featureFeedChips,
    shouldEvaluate: !isPlus,
  });
  const isFeedChipsEnabled = feedChipsVariant === FeedChipsVariant.V2;
  const { feeds } = useFeeds();
  const feed = feeds?.edges.find(
    (item) => item.node.id === feedSlugOrId || item.node.slug === feedSlugOrId,
  );

  // Pre-chips behavior: non-Plus cannot edit custom feeds. Once the chips
  // feature is on, free users own their custom feeds and the editor opens.
  const isFeedEditRestricted =
    !isFeedChipsEnabled && !isPlus && feed?.node.type === FeedType.Custom;

  useEffect(() => {
    document.body.classList.add('hidden-scrollbar');

    return () => {
      document.body.classList.remove('hidden-scrollbar');
    };
  }, []);

  useEffect(() => {
    if (isFeedEditRestricted) {
      router?.replace(webappUrl);
    }
  }, [isFeedEditRestricted, router]);

  if (isFeedEditRestricted) {
    return null;
  }

  return (
    <FeedPageLayoutComponent>
      <FeedSettingsEdit feedSlugOrId={feedSlugOrId} />
    </FeedPageLayoutComponent>
  );
};

EditFeedPage.getLayout = getMainFeedLayout;
EditFeedPage.layoutProps = { ...mainFeedLayoutProps, seo };

export default EditFeedPage;
