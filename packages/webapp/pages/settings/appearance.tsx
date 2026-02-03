import React, { useCallback } from 'react';
import type { ReactElement } from 'react';
import type { NextSeoProps } from 'next-seo';

import { ThemeSection } from '@dailydotdev/shared/src/components/ProfileMenu/sections/ThemeSection';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import {
  Typography,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { ToggleRadio } from '@dailydotdev/shared/src/components/fields/ToggleRadio';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import {
  LogEvent,
  TargetId,
  TargetType,
} from '@dailydotdev/shared/src/lib/log';
import { FlexCol } from '@dailydotdev/shared/src/components/utilities';
import { AccountPageContainer } from '../../components/layouts/SettingsLayout/AccountPageContainer';
import { getSettingsLayout } from '../../components/layouts/SettingsLayout';
import { defaultSeo } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';
import { SettingsSwitch } from '../../components/layouts/SettingsLayout/common';

const AccountManageSubscriptionPage = (): ReactElement => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { logEvent } = useLogContext();

  const {
    openNewTab,
    toggleOpenNewTab,
    insaneMode,
    toggleInsaneMode,
    sortingEnabled,
    toggleSortingEnabled,
    optOutCompanion,
    toggleOptOutCompanion,
    autoDismissNotifications,
    toggleAutoDismissNotifications,
  } = useSettingsContext();

  const onLayoutToggle = useCallback(
    async (enabled: boolean) => {
      logEvent({
        event_name: LogEvent.ChangeSettings,
        target_type: TargetType.Layout,
        target_id: enabled ? TargetId.List : TargetId.Cards,
      });
      return toggleInsaneMode(enabled);
    },
    [logEvent, toggleInsaneMode],
  );

  return (
    <AccountPageContainer title="Appearance">
      <FlexCol className="gap-6">
        <ThemeSection />

        {isLaptop && (
          <FlexCol className="gap-2">
            <Typography bold type={TypographyType.Subhead}>
              Layout
            </Typography>

            <ToggleRadio
              name="layout"
              value={insaneMode}
              onToggle={onLayoutToggle}
              className={{
                content: 'w-full justify-between !pr-0',
                container: '!gap-0',
                label: 'font-normal text-text-secondary typo-callout',
              }}
              reverse
              offLabel="Cards"
              onLabel="List"
            />
          </FlexCol>
        )}

        <FlexCol className="gap-5">
          <Typography bold type={TypographyType.Subhead}>
            Preferences
          </Typography>

          <SettingsSwitch
            name="feed-sorting"
            checked={sortingEnabled}
            onToggle={toggleSortingEnabled}
          >
            Show feed sorting menu
          </SettingsSwitch>

          <SettingsSwitch
            name="new-tab"
            checked={openNewTab}
            onToggle={toggleOpenNewTab}
          >
            Open links in new tab
          </SettingsSwitch>

          <SettingsSwitch
            name="hide-companion"
            checked={!optOutCompanion}
            onToggle={toggleOptOutCompanion}
          >
            Show companion widget on external sites
          </SettingsSwitch>
        </FlexCol>

        <FlexCol className="gap-5">
          <Typography bold type={TypographyType.Subhead}>
            Accessibility
          </Typography>

          <SettingsSwitch
            name="auto-dismiss-notifications"
            checked={autoDismissNotifications}
            onToggle={toggleAutoDismissNotifications}
          >
            Auto-hide notifications after a few seconds
          </SettingsSwitch>
        </FlexCol>
      </FlexCol>
    </AccountPageContainer>
  );
};

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Appearance'),
};

AccountManageSubscriptionPage.getLayout = getSettingsLayout;
AccountManageSubscriptionPage.layoutProps = { seo };

export default AccountManageSubscriptionPage;
