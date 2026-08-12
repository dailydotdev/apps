import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import { cloudinaryGivebackOpenGraph } from '@dailydotdev/shared/src/lib/image';
import { GivebackPage } from '@dailydotdev/shared/src/features/giveback/components/GivebackPage';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';

const seoTitles = getPageSeoTitles('Giveback');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: {
    ...defaultOpenGraph,
    ...seoTitles.openGraph,
    // Dedicated giveback share card, overriding the site-wide default OG image.
    images: [
      {
        url: cloudinaryGivebackOpenGraph,
        width: 1280,
        height: 800,
        alt: 'daily.dev Giveback: thank you, the campaign is now closed',
      },
    ],
  },
  ...defaultSeo,
  description:
    'The daily.dev Giveback campaign has ended. See what the community unlocked together and where the donations go.',
  nofollow: true,
  noindex: true,
};

const GivebackRoute = (): ReactElement => <GivebackPage />;

const getGivebackLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

GivebackRoute.getLayout = getGivebackLayout;
GivebackRoute.layoutProps = { screenCentered: false, seo };

export default GivebackRoute;
