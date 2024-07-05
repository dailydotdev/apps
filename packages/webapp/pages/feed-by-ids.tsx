import React, { ReactElement } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { defaultOpenGraph, defaultSeo } from '../next-seo';
import {
  feedbyIdsLayoutProps,
  getFeedByIdsLayout,
} from '../components/layouts/FeedByIds/FeedByIdsPage';

const seo: NextSeoProps = {
  title: 'Feed by ids on daily.dev',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const FeedByIds = (): ReactElement => {
  return (
    <>
      <NextSeo {...seo} />
    </>
  );
};

FeedByIds.getLayout = getFeedByIdsLayout;
FeedByIds.layoutProps = feedbyIdsLayoutProps;

export default FeedByIds;
