import type { ReactElement } from 'react';
import React from 'react';

import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import TabContainer, {
  Tab,
} from '@dailydotdev/shared/src/components/tabs/TabContainer';
import InAppNotificationsTab from '@dailydotdev/shared/src/components/notifications/InAppNotificationsTab';
import useNotificationSettings from '@dailydotdev/shared/src/hooks/notifications/useNotificationSettings';
import { getSettingsLayout } from '../../components/layouts/SettingsLayout';

import { defaultSeo } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Manage account notifications'),
};

const AccountNotificationsPage = (): ReactElement => {
  const router = useRouter();
  const { isLoadingPreferences } = useNotificationSettings();

  if (isLoadingPreferences) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <TabContainer>
        <Tab label="Notifications">
          <InAppNotificationsTab />
        </Tab>
        <Tab label="Email" />
      </TabContainer>
    </div>
  );
};

AccountNotificationsPage.getLayout = getSettingsLayout;
AccountNotificationsPage.layoutProps = { seo };

export default AccountNotificationsPage;
