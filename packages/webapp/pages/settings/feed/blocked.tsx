import React from 'react';
import type { ReactElement } from 'react';
import type { NextSeoProps } from 'next-seo';

import { FeedSettingsBlockingSection } from '@dailydotdev/shared/src/components/feeds/FeedSettings/sections/FeedSettingsBlockingSection';
import { AccountPageContainer } from '../../../components/layouts/SettingsLayout/AccountPageContainer';
import { defaultOpenGraph, defaultSeo } from '../../../next-seo';
import { getTemplatedTitle } from '../../../components/layouts/utils';
import { getFeedSettingsLayout } from '../../../components/layouts/SettingsLayout/FeedSettingsLayout';

const AccountManageSubscriptionPage = (): ReactElement => {
  return (
    <AccountPageContainer title="Blocked content">
      <section className="flex flex-col gap-4">
        <FeedSettingsBlockingSection />
      </section>
    </AccountPageContainer>
  );
};

const seo: NextSeoProps = {
  title: getTemplatedTitle('Edit blocked content'),
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

AccountManageSubscriptionPage.getLayout = getFeedSettingsLayout;
AccountManageSubscriptionPage.layoutProps = { seo };

export default AccountManageSubscriptionPage;
