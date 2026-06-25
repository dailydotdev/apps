import React, { useCallback } from 'react';
import type { ReactElement } from 'react';
import type { NextSeoProps } from 'next-seo';
import dynamic from 'next/dynamic';

import { ThemeSection } from '@dailydotdev/shared/src/components/ProfileMenu/sections/ThemeSection';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { useSettingsBooleanFlag } from '@dailydotdev/shared/src/hooks/useSettingsBooleanFlag';
import { useLayoutVariant } from '@dailydotdev/shared/src/hooks/layout/useLayoutVariant';
import { useReaderModalEligibility } from '@dailydotdev/shared/src/components/post/reader/hooks/useReaderModalEligibility';
import { useLegacyPostLayoutOptOut } from '@dailydotdev/shared/src/components/post/reader/hooks/useLegacyPostLayoutOptOut';
import { useEnableReaderInside } from '@dailydotdev/shared/src/components/post/reader/hooks/useEnableReaderInside';
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
import { iOSSupportsAppIconChange } from '@dailydotdev/shared/src/lib/ios';
import { AccountPageContainer } from '../../components/layouts/SettingsLayout/AccountPageContainer';
import { getSettingsLayout } from '../../components/layouts/SettingsLayout';
import { defaultSeo } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { SettingsSwitch } from '../../components/layouts/SettingsLayout/common';

const IOSIconPicker = dynamic(
  () =>
    import('../../components/IOSIconPicker').then(
      (module) => module.IOSIconPicker,
    ),
  { ssr: false },
);

const AccountManageSubscriptionPage = (): ReactElement => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { logEvent } = useLogContext();
  const supportsAppIconChange =
    typeof window !== 'undefined' && iOSSupportsAppIconChange();

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
    flags,
  } = useSettingsContext();
  const { isEligible: isReaderEligible, isReaderEnabled } =
    useReaderModalEligibility();
  const { optIn, optOut } = useLegacyPostLayoutOptOut();
  const { enable: enableReaderInside } = useEnableReaderInside();
  // The reader settings toggle is now available to every eligible user (the
  // reader_modal_v2 experiment that used to gate it has graduated).
  const showReaderToggle = isReaderEligible;
  const { value: isHighlightCardsOptedOut, toggle: toggleHighlightCards } =
    useSettingsBooleanFlag('highlightCardsOptOut');
  const isReadInsideEnabled = isReaderEnabled;
  const isReaderPermissionGranted =
    flags?.readerInstallPromptAcknowledged ?? false;
  const { isV2: isLayoutV2 } = useLayoutVariant();
  const { value: isSidebarCompact, toggle: toggleSidebarCompact } =
    useSettingsBooleanFlag('sidebarCompact');
  const onToggleReadInside = () => {
    if (isReadInsideEnabled) {
      optOut();
      return;
    }
    // Already granted permission before (just opted out) → flip back on.
    // Otherwise drive the install/permission flow so the reader actually works.
    if (isReaderPermissionGranted) {
      optIn();
      return;
    }
    enableReaderInside();
  };

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

            {isLayoutV2 && (
              <SettingsSwitch
                name="compact-sidebar"
                checked={isSidebarCompact}
                onToggle={toggleSidebarCompact}
              >
                Compact sidebar (hide labels)
              </SettingsSwitch>
            )}
          </FlexCol>
        )}

        {supportsAppIconChange && <IOSIconPicker />}

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

          {showReaderToggle && (
            <SettingsSwitch
              name="read-inside-dailydev"
              checked={isReadInsideEnabled}
              onToggle={onToggleReadInside}
            >
              Read articles inside daily.dev
            </SettingsSwitch>
          )}

          <SettingsSwitch
            name="highlight-cards"
            checked={!isHighlightCardsOptedOut}
            onToggle={toggleHighlightCards}
          >
            Show hero cards for highlighted news
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
  ...getPageSeoTitles('Appearance'),
};

AccountManageSubscriptionPage.getLayout = getSettingsLayout;
AccountManageSubscriptionPage.layoutProps = { seo };

export default AccountManageSubscriptionPage;
