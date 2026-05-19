import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';

import type { NextSeoProps } from 'next-seo';
import TabContainer, {
  Tab,
} from '@dailydotdev/shared/src/components/tabs/TabContainer';
import InAppNotificationsTab from '@dailydotdev/shared/src/components/notifications/InAppNotificationsTab';
import useNotificationSettings from '@dailydotdev/shared/src/hooks/notifications/useNotificationSettings';
import EmailNotificationsTab from '@dailydotdev/shared/src/components/notifications/EmailNotificationsTab';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
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

interface NotificationsTabsProps {
  activeTab: NotificationsTab;
  onChange: (tab: NotificationsTab) => void;
}

// FindSquad-style tab nav. Each tab is a Float/Tertiary button inside a
// `py-3` row with a half-width bottom underline that aligns with the row's
// bottom edge. The laptop caller wraps it in a `-my-3` shell to cancel
// the master PageHeader's `py-3` so the underline lands on the header's
// bottom border.
const NotificationsTabs = ({
  activeTab,
  onChange,
}: NotificationsTabsProps): ReactElement => (
  <nav
    aria-label="Notifications channel"
    className="flex flex-row items-stretch gap-2"
  >
    {TABS.map((tab) => {
      const isActive = activeTab === tab.value;
      return (
        <div
          key={tab.value}
          className={classNames(
            'relative flex items-center py-3',
            'after:absolute after:bottom-0 after:left-0 after:right-0 after:mx-auto after:w-1/2 after:border-b-2',
            isActive ? 'after:border-text-primary' : 'after:hidden',
          )}
        >
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={isActive ? ButtonVariant.Float : ButtonVariant.Tertiary}
            pressed={isActive}
            onClick={() => onChange(tab.value)}
            aria-current={isActive ? 'page' : undefined}
          >
            {tab.label}
          </Button>
        </div>
      );
    })}
  </nav>
);

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
  // AccountPageContainer's title slot (NotificationsTabs renders inline as
  // the title node). `-my-3` cancels the header's `py-3` so the tab
  // underline lands flush on the header's bottom border.
  const tabsTitle = (
    <div className="-my-3 flex h-full">
      <NotificationsTabs activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );

  const body =
    activeTab === 'in-app' ? (
      <InAppNotificationsTab />
    ) : (
      <EmailNotificationsTab />
    );

  if (isLoadingPreferences) {
    return (
      <AccountPageContainer title={tabsTitle}>
        <div />
      </AccountPageContainer>
    );
  }

  return (
    <AccountPageContainer title={tabsTitle} className={{ section: 'p-0' }}>
      {body}
    </AccountPageContainer>
  );
};

AccountNotificationsPage.getLayout = getSettingsLayout;
AccountNotificationsPage.layoutProps = { seo };

export default AccountNotificationsPage;
