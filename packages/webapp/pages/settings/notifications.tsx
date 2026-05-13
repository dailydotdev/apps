import type { ReactElement } from 'react';
import React, { useState } from 'react';

import type { NextSeoProps } from 'next-seo';
import InAppNotificationsTab from '@dailydotdev/shared/src/components/notifications/InAppNotificationsTab';
import useNotificationSettings from '@dailydotdev/shared/src/hooks/notifications/useNotificationSettings';
import EmailNotificationsTab from '@dailydotdev/shared/src/components/notifications/EmailNotificationsTab';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { getSettingsLayout } from '../../components/layouts/SettingsLayout';

import { defaultSeo } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';
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

  // Lift the in-app/email switcher into the master PageHeader's actions
  // slot so the settings page header stays consistent with every other
  // page (single sticky strip, no second header bar between content and
  // chrome). Plain Subtle/Tertiary buttons keep the visual weight in
  // line with other header actions across the app (e.g. Squad bar).
  const tabsAction = (
    <>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <Button
            key={tab.value}
            type="button"
            size={ButtonSize.Small}
            variant={isActive ? ButtonVariant.Subtle : ButtonVariant.Tertiary}
            onClick={() => setActiveTab(tab.value)}
            aria-pressed={isActive}
          >
            {tab.label}
          </Button>
        );
      })}
    </>
  );

  if (isLoadingPreferences) {
    return (
      <AccountPageContainer title="Notifications" actions={tabsAction}>
        <div />
      </AccountPageContainer>
    );
  }

  return (
    <AccountPageContainer
      title="Notifications"
      actions={tabsAction}
      className={{ section: 'p-0' }}
    >
      {activeTab === 'in-app' ? (
        <InAppNotificationsTab />
      ) : (
        <EmailNotificationsTab />
      )}
    </AccountPageContainer>
  );
};

AccountNotificationsPage.getLayout = getSettingsLayout;
AccountNotificationsPage.layoutProps = { seo };

export default AccountNotificationsPage;
