import React, { ReactElement } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
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

const FeedByIds = (): ReactElement => <></>;

FeedByIds.getLayout = getFeedByIdsLayout;
FeedByIds.layoutProps = { ...feedbyIdsLayoutProps, seo };

export default FeedByIds;
