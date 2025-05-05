import React from 'react';
import type { ReactElement } from 'react';
import type { NextSeoProps } from 'next-seo';

import { FeedSettingsContentSourcesSection } from '@dailydotdev/shared/src/components/feeds/FeedSettings/sections/FeedSettingsContentSourcesSection';
import { AccountPageContainer } from '../../../components/layouts/AccountLayout/AccountPageContainer';
import { defaultOpenGraph, defaultSeo } from '../../../next-seo';
import { getTemplatedTitle } from '../../../components/layouts/utils';
import { getFeedSettingsLayout } from '../../../components/layouts/AccountLayout/FeedSettingsLayout';

const AccountManageSubscriptionPage = (): ReactElement => {
  return (
    <AccountPageContainer title="Content sources">
      <section className="flex flex-col gap-4">
        <FeedSettingsContentSourcesSection />
      </section>
    </AccountPageContainer>
  );
};

const seo: NextSeoProps = {
  title: getTemplatedTitle('Edit content sources'),
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

AccountManageSubscriptionPage.getLayout = getFeedSettingsLayout;
AccountManageSubscriptionPage.layoutProps = { seo };

export default AccountManageSubscriptionPage;
