import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useFeedLayout } from '@dailydotdev/shared/src/hooks/useFeedLayout';
import { FeedSettingsEdit } from '@dailydotdev/shared/src/components/feeds/FeedSettings/FeedSettingsEdit';
import { useRouter } from 'next/router';

import { useFeeds, usePlusSubscription } from '@dailydotdev/shared/src/hooks';
import { FeedType } from '@dailydotdev/shared/src/graphql/feed';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../../../components/layouts/MainFeedPage';
import { defaultOpenGraph, defaultSeo } from '../../../next-seo';
import { getTemplatedTitle } from '../../../components/layouts/utils';

const seo: NextSeoProps = {
  title: getTemplatedTitle('Edit feed'),
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const EditFeedPage = (): ReactElement => {
  const router = useRouter();
  const { FeedPageLayoutComponent } = useFeedLayout();
  const feedSlugOrId = router.query.slugOrId as string;
  const { isPlus } = usePlusSubscription();
  const { feeds } = useFeeds();
  const feed = feeds?.edges.find(
    (item) => item.node.id === feedSlugOrId || item.node.slug === feedSlugOrId,
  );

  const isFeedEditRestricted = !isPlus && feed?.node.type === FeedType.Custom;

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
