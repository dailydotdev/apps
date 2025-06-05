import React from 'react';
import type { ReactElement } from 'react';
import type { NextSeoProps } from 'next-seo';

import { FeedSettingsContentPreferencesSection } from '@dailydotdev/shared/src/components/feeds/FeedSettings/sections/FeedSettingsContentPreferencesSection';
import { AccountPageContainer } from '../../../components/layouts/SettingsLayout/AccountPageContainer';
import { defaultOpenGraph, defaultSeo } from '../../../next-seo';
import { getTemplatedTitle } from '../../../components/layouts/utils';
import { getFeedSettingsLayout } from '../../../components/layouts/SettingsLayout/FeedSettingsLayout';

const AccountManageSubscriptionPage = (): ReactElement => {
  return (
    <AccountPageContainer title="Content preferences">
      <section className="flex flex-col gap-4">
        <FeedSettingsContentPreferencesSection />
      </section>
    </AccountPageContainer>
  );
};

const seo: NextSeoProps = {
  title: getTemplatedTitle('Edit content preferences'),
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

AccountManageSubscriptionPage.getLayout = getFeedSettingsLayout;
AccountManageSubscriptionPage.layoutProps = { seo };

export default AccountManageSubscriptionPage;
