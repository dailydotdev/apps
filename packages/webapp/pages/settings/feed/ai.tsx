import React from 'react';
import type { ReactElement } from 'react';
import type { NextSeoProps } from 'next-seo';

import { FeedSettingsAISection } from '@dailydotdev/shared/src/components/feeds/FeedSettings/sections/FeedSettingsAISection';
import { AccountPageContainer } from '../../../components/layouts/SettingsLayout/AccountPageContainer';
import { defaultOpenGraph, defaultSeo } from '../../../next-seo';
import { getPageSeoTitles } from '../../../components/layouts/utils';
import { getFeedSettingsLayout } from '../../../components/layouts/SettingsLayout/FeedSettingsLayout';

const AccountManageSubscriptionPage = (): ReactElement => {
  return (
    <AccountPageContainer title="AI superpowers">
      <section className="flex flex-col gap-4">
        <FeedSettingsAISection />
      </section>
    </AccountPageContainer>
  );
};

const seoTitles = getPageSeoTitles('Edit AI superpowers');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  ...defaultSeo,
};

AccountManageSubscriptionPage.getLayout = getFeedSettingsLayout;
AccountManageSubscriptionPage.layoutProps = { seo };

export default AccountManageSubscriptionPage;
