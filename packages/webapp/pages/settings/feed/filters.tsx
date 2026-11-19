import React from 'react';
import type { ReactElement } from 'react';
import type { NextSeoProps } from 'next-seo';

import { FeedSettingsContentFiltersSection } from '@dailydotdev/shared/src/components/feeds/FeedSettings/sections/FeedSettingsContentFiltersSection';
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

const FeedSettingsFiltersPage = (): ReactElement => {
  return (
    <AccountPageContainer title={forYouSettingsTitle[FeedSettingsMenu.Filters]}>
      <section className="flex flex-col gap-4">
        <FeedSettingsContentFiltersSection />
      </section>
    </AccountPageContainer>
  );
};

const seoTitles = getPageSeoTitles(
  forYouSettingsTitle[FeedSettingsMenu.Filters],
);
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  ...defaultSeo,
  ...noindexSeoProps,
};

FeedSettingsFiltersPage.getLayout = getFeedSettingsLayout;
FeedSettingsFiltersPage.layoutProps = { seo };

export default FeedSettingsFiltersPage;
