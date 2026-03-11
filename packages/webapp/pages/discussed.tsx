import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../components/layouts/MainFeedPage';
import { defaultOpenGraph } from '../next-seo';
import { getPageSeoTitles } from '../components/layouts/utils';

const seoTitles = getPageSeoTitles(
  'Real-time discussions in the developer community',
);
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  description:
    'Stay on top of real-time developer discussions on daily.dev. Join conversations happening now and engage with the most active community members.',
};

const Discussed = (): ReactElement => <></>;

Discussed.getLayout = getMainFeedLayout;
Discussed.layoutProps = { ...mainFeedLayoutProps, seo };

export default Discussed;
