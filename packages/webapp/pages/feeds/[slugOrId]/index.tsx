import React, { ReactElement, useMemo } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { withExperiment } from '@dailydotdev/shared/src/components/withExperiment';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';
import { CustomFeedsExperiment } from '@dailydotdev/shared/src/lib/featureValues';
import { Redirect } from '@dailydotdev/shared/src/components';
import { useFeeds } from '@dailydotdev/shared/src/hooks';
import { useRouter } from 'next/router';
import { defaultOpenGraph, defaultSeo } from '../../../next-seo';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../../../components/layouts/MainFeedPage';
import { getTemplatedTitle } from '../../../components/layouts/utils';

const FeedPage = (): ReactElement => {
  const router = useRouter();
  const { feeds } = useFeeds();

  const feed = useMemo(() => {
    return feeds?.edges.find(({ node }) => node.id === router.query.slugOrId)
      ?.node;
  }, [feeds, router.query.slugOrId]);

  const seo: NextSeoProps = {
    title: getTemplatedTitle(
      feed?.flags?.name ? `${feed?.flags?.name} feed` : 'Custom feed',
    ),
    openGraph: { ...defaultOpenGraph },
    ...defaultSeo,
  };

  return (
    <>
      <NextSeo {...seo} />
    </>
  );
};

FeedPage.getLayout = getMainFeedLayout;
FeedPage.layoutProps = mainFeedLayoutProps;

export default withExperiment(FeedPage, {
  feature: feature.customFeeds,
  value: CustomFeedsExperiment.V1,
  fallback: Redirect,
});
