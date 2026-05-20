import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import { BriefCover } from '@dailydotdev/shared/src/features/briefingHome/BriefCover';
import { defaultOpenGraph, defaultSeo } from '../next-seo';
import { getLayout } from '../components/layouts/FeedLayout';

const seo: NextSeoProps = {
  title: 'Your brief',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const BriefingPage = (): ReactElement => <BriefCover />;

BriefingPage.getLayout = getLayout;
BriefingPage.layoutProps = { mainPage: true, screenCentered: false, seo };

export default BriefingPage;
