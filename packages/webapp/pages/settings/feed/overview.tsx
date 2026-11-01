import React from 'react';
import type { ReactElement } from 'react';
import type { NextSeoProps } from 'next-seo';

import { FeedSettingsOverviewSection } from '@dailydotdev/shared/src/components/feeds/FeedSettings/sections/FeedSettingsOverviewSection';
import { FeedSettingsMenu } from '@dailydotdev/shared/src/components/feeds/FeedSettings/types';
import { forYouSettingsTitle } from '@dailydotdev/shared/src/components/feeds/FeedSettings/forYouSettingsPages';
import { AccountPageContainer } from '../../../components/layouts/SettingsLayout/AccountPageContainer';
import {
  defaultOpenGraph,
  defaultSeo,
  noindexSeoProps,
} from '../../../next-seo';
import { getPageSeoTitles } from '../../../components/layouts/utils';
import { getFeedSettingsLayout } from '../../../components/layouts/SettingsLayout/FeedSettingsLayout';

const FeedSettingsOverviewPage = (): ReactElement => {
  return (
    <AccountPageContainer
      title={forYouSettingsTitle[FeedSettingsMenu.Overview]}
    >
      <section className="flex flex-col gap-4">
        <FeedSettingsOverviewSection />
      </section>
    </AccountPageContainer>
  );
};

const seoTitles = getPageSeoTitles(
  forYouSettingsTitle[FeedSettingsMenu.Overview],
);
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  ...defaultSeo,
  ...noindexSeoProps,
};

FeedSettingsOverviewPage.getLayout = getFeedSettingsLayout;
FeedSettingsOverviewPage.layoutProps = { seo };

export default FeedSettingsOverviewPage;
