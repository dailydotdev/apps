import React, { ReactElement, useEffect, useMemo } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { useFeeds, usePlusSubscription } from '@dailydotdev/shared/src/hooks';
import { useRouter } from 'next/router';
import {
  customFeedsPlusDate,
  webappUrl,
} from '@dailydotdev/shared/src/lib/constants';
import { defaultOpenGraph, defaultSeo } from '../../../next-seo';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../../../components/layouts/MainFeedPage';
import { getTemplatedTitle } from '../../../components/layouts/utils';

const FeedPage = (): ReactElement => {
  const router = useRouter();
  const { feeds } = useFeeds();
  const { isPlus } = usePlusSubscription();

  const feed = useMemo(() => {
    return feeds?.edges.find(({ node }) => node.id === router.query.slugOrId)
      ?.node;
  }, [feeds, router.query.slugOrId]);

  useEffect(() => {
    if (!feed) {
      router.replace(webappUrl);

      return;
    }

    if (!isPlus && new Date(feed.createdAt) > customFeedsPlusDate) {
      router.replace(webappUrl);
    }
  }, [router, isPlus, feed]);

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

export default FeedPage;
