import type { ReactElement } from 'react';
import React, { useState } from 'react';

import type { NextSeoProps } from 'next-seo';
import TabContainer, {
  Tab,
} from '@dailydotdev/shared/src/components/tabs/TabContainer';
import {
  SquadDirectoryNavbar,
  SquadDirectoryNavbarItem,
} from '@dailydotdev/shared/src/components/squads/layout/SquadDirectoryNavbar';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import InAppNotificationsTab from '@dailydotdev/shared/src/components/notifications/InAppNotificationsTab';
import useNotificationSettings from '@dailydotdev/shared/src/hooks/notifications/useNotificationSettings';
import EmailNotificationsTab from '@dailydotdev/shared/src/components/notifications/EmailNotificationsTab';
import { useLayoutVariant } from '@dailydotdev/shared/src/hooks/layout/useLayoutVariant';
import { getSettingsLayout } from '../../components/layouts/SettingsLayout';

import { defaultSeo } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { AccountPageContent } from '../../components/layouts/SettingsLayout/common';
import { AccountPageContainer } from '../../components/layouts/SettingsLayout/AccountPageContainer';

const seo: NextSeoProps = {
  ...defaultSeo,
  ...getPageSeoTitles('Notifications'),
};

type NotificationsTab = 'in-app' | 'email';

const TABS: { value: NotificationsTab; label: string }[] = [
  { value: 'in-app', label: 'Notifications' },
  { value: 'email', label: 'Email' },
];

const AccountNotificationsPage = (): ReactElement => {
  const { isLoadingPreferences } = useNotificationSettings();
  const [activeTab, setActiveTab] = useState<NotificationsTab>('in-app');
  const { isV2 } = useLayoutVariant();
  const isV2Laptop = isV2;

  // Control variant keeps the legacy TabContainer rendering — no change.
  if (!isV2Laptop) {
    if (isLoadingPreferences) {
      return <div className="w-full" />;
    }
    return (
      <AccountPageContent>
        <TabContainer className={{ header: 'h-14 px-4' }}>
          <Tab label="Notifications">
            <InAppNotificationsTab />
          </Tab>
          <Tab label="Email">
            <EmailNotificationsTab />
          </Tab>
        </TabContainer>
      </AccountPageContent>
    );
  }

  // v2 + laptop: the tabs live inside the master PageHeader strip via
  // AccountPageContainer's title slot, reusing the Squads directory tab
  // components so the look matches the canonical tabbed header. The header
  // gets `!py-0` (below) so the tab row defines the strip height and each
  // item's bottom underline lands flush on the header's bottom border —
  // matching the Squads directory layout.
  const tabsTitle = (
    <SquadDirectoryNavbar
      aria-label="Notification channels"
      className="!mx-0 min-w-0 flex-1 !border-0 !px-0"
    >
      {TABS.map((tab) => (
        <SquadDirectoryNavbarItem
          key={tab.value}
          buttonSize={ButtonSize.Small}
          isActive={activeTab === tab.value}
          label={tab.label}
          ariaLabel={`Show ${tab.label.toLowerCase()} settings`}
          onClick={() => setActiveTab(tab.value)}
        />
      ))}
    </SquadDirectoryNavbar>
  );

  const body =
    activeTab === 'in-app' ? (
      <InAppNotificationsTab />
    ) : (
      <EmailNotificationsTab />
    );

  if (isLoadingPreferences) {
    return (
      <AccountPageContainer title={tabsTitle} className={{ header: '!py-0' }}>
        <div />
      </AccountPageContainer>
    );
  }

  return (
    <AccountPageContainer
      title={tabsTitle}
      className={{ section: 'p-0', header: '!py-0' }}
    >
      {body}
    </AccountPageContainer>
  );
};

AccountNotificationsPage.getLayout = getSettingsLayout;
AccountNotificationsPage.layoutProps = { seo };

export default AccountNotificationsPage;
