import type { ReactElement } from 'react';
import React from 'react';

import type { NextSeoProps } from 'next-seo';
import TabContainer, {
  Tab,
} from '@dailydotdev/shared/src/components/tabs/TabContainer';
import InAppNotificationsTab from '@dailydotdev/shared/src/components/notifications/InAppNotificationsTab';
import useNotificationSettings from '@dailydotdev/shared/src/hooks/notifications/useNotificationSettings';
import EmailNotificationsTab from '@dailydotdev/shared/src/components/notifications/EmailNotificationsTab';
import { getSettingsLayout } from '../../components/layouts/SettingsLayout';

import { defaultSeo } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';
import { AccountPageContent } from '../../components/layouts/SettingsLayout/common';

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Manage account notifications'),
};

const AccountNotificationsPage = (): ReactElement => {
  const { isLoadingPreferences } = useNotificationSettings();

  if (isLoadingPreferences) {
    return <div>Loading...</div>;
  }
  return (
    <AccountPageContent className="px-4">
      <TabContainer>
        <Tab label="Notifications">
          <InAppNotificationsTab />
        </Tab>
        <Tab label="Email">
          <EmailNotificationsTab />
        </Tab>
      </TabContainer>
    </AccountPageContent>
  );
};

AccountNotificationsPage.getLayout = getSettingsLayout;
AccountNotificationsPage.layoutProps = { seo };

export default AccountNotificationsPage;
