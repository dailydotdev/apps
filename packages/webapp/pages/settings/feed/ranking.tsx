import React from 'react';
import type { ReactElement } from 'react';
import type { NextSeoProps } from 'next-seo';

import { ForYouRankingSettings } from '@dailydotdev/shared/src/features/feedExplain/components/ForYouRankingSettings';
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

const FeedSettingsRankingPage = (): ReactElement => {
  return (
    <AccountPageContainer title={forYouSettingsTitle[FeedSettingsMenu.Ranking]}>
      <section className="flex flex-col gap-4">
        <ForYouRankingSettings />
      </section>
    </AccountPageContainer>
  );
};

const seoTitles = getPageSeoTitles(
  forYouSettingsTitle[FeedSettingsMenu.Ranking],
);
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  ...defaultSeo,
  ...noindexSeoProps,
};

FeedSettingsRankingPage.getLayout = getFeedSettingsLayout;
FeedSettingsRankingPage.layoutProps = { seo };

export default FeedSettingsRankingPage;
