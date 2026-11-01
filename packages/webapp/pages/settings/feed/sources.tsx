import React from 'react';
import type { ReactElement } from 'react';
import type { NextSeoProps } from 'next-seo';

import { FeedSettingsContentSourcesSection } from '@dailydotdev/shared/src/components/feeds/FeedSettings/sections/FeedSettingsContentSourcesSection';
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

const AccountManageSubscriptionPage = (): ReactElement => {
  return (
    <AccountPageContainer
      title={forYouSettingsTitle[FeedSettingsMenu.ContentSources]}
    >
      <section className="flex flex-col gap-4">
        <FeedSettingsContentSourcesSection />
      </section>
    </AccountPageContainer>
  );
};

const seoTitles = getPageSeoTitles(
  forYouSettingsTitle[FeedSettingsMenu.ContentSources],
);
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  ...defaultSeo,
  ...noindexSeoProps,
};

AccountManageSubscriptionPage.getLayout = getFeedSettingsLayout;
AccountManageSubscriptionPage.layoutProps = { seo };

export default AccountManageSubscriptionPage;
