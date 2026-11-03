import React, { useCallback, useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import type { NextSeoProps } from 'next-seo';
import dynamic from 'next/dynamic';

import { ThemeSection } from '@dailydotdev/shared/src/components/ProfileMenu/sections/ThemeSection';
import { SidebarDensitySection } from '@dailydotdev/shared/src/components/ProfileMenu/sections/SidebarDensitySection';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { useSettingsBooleanFlag } from '@dailydotdev/shared/src/hooks/useSettingsBooleanFlag';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { featureFeedWidgets } from '@dailydotdev/shared/src/lib/featureManagement';
import { useToggleFeedbackButton } from '@dailydotdev/shared/src/hooks/useToggleFeedbackButton';
import { useLaptopLayout } from '@dailydotdev/shared/src/hooks/layout/useLaptopLayout';
import { useReaderModalEligibility } from '@dailydotdev/shared/src/components/post/reader/hooks/useReaderModalEligibility';
import { useLegacyPostLayoutOptOut } from '@dailydotdev/shared/src/components/post/reader/hooks/useLegacyPostLayoutOptOut';
import { useEnableReaderInside } from '@dailydotdev/shared/src/components/post/reader/hooks/useEnableReaderInside';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { ToggleRadio } from '@dailydotdev/shared/src/components/fields/ToggleRadio';
import { Radio } from '@dailydotdev/shared/src/components/fields/Radio';
import type { RadioItemProps } from '@dailydotdev/shared/src/components/fields/RadioItem';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import {
  LogEvent,
  TargetId,
  TargetType,
} from '@dailydotdev/shared/src/lib/log';
import { FlexCol } from '@dailydotdev/shared/src/components/utilities';
import { iOSSupportsAppIconChange } from '@dailydotdev/shared/src/lib/ios';
import { isIOSNative } from '@dailydotdev/shared/src/lib/func';
import { supportsReading } from '@dailydotdev/shared/src/components/shell/readingStore';
import { AccountPageContainer } from '../../components/layouts/SettingsLayout/AccountPageContainer';
import { getSettingsLayout } from '../../components/layouts/SettingsLayout';
import { defaultSeo, noindexSeoProps } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { SettingsSwitch } from '../../components/layouts/SettingsLayout/common';

const IOSIconPicker = dynamic(
  () =>
    import('../../components/IOSIconPicker').then(
      (module) => module.IOSIconPicker,
    ),
  { ssr: false },
);

enum OpenLinksIn {
  App = 'app',
  Browser = 'browser',
  NewTab = 'new-tab',
  SameTab = 'same-tab',
}

// The notifications page's list: the label and its line of help on the
// left, the radio on the right.
const openLinksInClassName = {
  label: 'w-[calc(100%-2.4rem)]',
  content: 'w-full !pr-0',
  container: 'gap-4',
};

const OpenLinksInLabel = ({
  label,
  help,
}: {
  label: string;
  help: string;
}): ReactElement => (
  <>
    <Typography
      bold
      type={TypographyType.Callout}
      color={TypographyColor.Primary}
    >
      {label}
    </Typography>
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
      className="text-wrap font-normal"
    >
      {help}
    </Typography>
  </>
);

const AccountManageSubscriptionPage = (): ReactElement => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { logEvent } = useLogContext();
  const supportsAppIconChange =
    typeof window !== 'undefined' && iOSSupportsAppIconChange();
  // Known after mount: the bridge exists only on the client, and the rows
  // it picks must match what the server drew.
  const [canReadInApp, setCanReadInApp] = useState(false);
  useEffect(() => {
    setCanReadInApp(supportsReading());
  }, []);

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
  const { value: isOpenLinksInAppOptedOut, set: setOpenLinksInAppOptOut } =
    useSettingsBooleanFlag('openLinksInAppOptOut');
  const isIos = canReadInApp && isIOSNative();
  const browser = isIos ? 'Safari' : 'your browser';
  const openLinksInOptions: RadioItemProps<OpenLinksIn>[] = canReadInApp
    ? [
        {
          value: OpenLinksIn.App,
          label: (
            <OpenLinksInLabel
              label="In daily.dev"
              help="The page opens over the post. Upvote, comment and save stay one pull away."
            />
          ),
        },
        {
          value: OpenLinksIn.Browser,
          label: (
            <OpenLinksInLabel
              label={`In ${browser}`}
              help={
                isIos
                  ? 'Every link leaves the app for Safari. The daily.dev link at the top left brings you back.'
                  : 'Every link leaves the app for your browser.'
              }
            />
          ),
        },
      ]
    : [
        {
          value: OpenLinksIn.NewTab,
          label: (
            <OpenLinksInLabel
              label="A new tab"
              help="The post stays open in this tab."
            />
          ),
        },
        {
          value: OpenLinksIn.SameTab,
          label: (
            <OpenLinksInLabel
              label="This tab"
              help="Back returns you to the post."
            />
          ),
        },
      ];
  const openLinksIn = (() => {
    if (canReadInApp) {
      return isOpenLinksInAppOptedOut ? OpenLinksIn.Browser : OpenLinksIn.App;
    }
    return openNewTab ? OpenLinksIn.NewTab : OpenLinksIn.SameTab;
  })();
  const onOpenLinksIn = (value: OpenLinksIn) => {
    if (canReadInApp) {
      setOpenLinksInAppOptOut(value === OpenLinksIn.Browser);
      return;
    }
    if ((value === OpenLinksIn.NewTab) !== openNewTab) {
      toggleOpenNewTab();
    }
  };
  const { value: isFeedWidgetsOptedOut, toggle: toggleFeedWidgets } =
    useSettingsBooleanFlag('feedWidgetsOptOut');
  // Only readers who have met the rail, so opening this page is no exposure.
  const { value: isFeedWidgetsOn } = useConditionalFeature({
    feature: featureFeedWidgets,
    shouldEvaluate: isFeedWidgetsOptedOut || !!flags?.feedWidgets,
  });
  const { showFeedbackButton, toggleFeedbackButton } =
    useToggleFeedbackButton();
  const isReadInsideEnabled = isReaderEnabled;
  const isReaderPermissionGranted =
    flags?.readerInstallPromptAcknowledged ?? false;
  const isLaptopLayout = useLaptopLayout();
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

            {isLaptopLayout && <SidebarDensitySection />}
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

          {isFeedWidgetsOn && (
            <SettingsSwitch
              name="feed-widgets"
              checked={!isFeedWidgetsOptedOut}
              onToggle={toggleFeedWidgets}
            >
              Show widgets above the feed
            </SettingsSwitch>
          )}

          <SettingsSwitch
            name="feedback-button"
            checked={showFeedbackButton}
            onToggle={toggleFeedbackButton}
          >
            Show feedback button
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

        <FlexCol className="gap-5">
          <Typography bold type={TypographyType.Subhead}>
            Reading
          </Typography>

          <FlexCol className="gap-3">
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Open links in
            </Typography>
            <Radio<OpenLinksIn>
              name="open-links-in"
              reverse
              className={openLinksInClassName}
              options={openLinksInOptions}
              value={openLinksIn}
              onChange={onOpenLinksIn}
            />
          </FlexCol>
        </FlexCol>
      </FlexCol>
    </AccountPageContainer>
  );
};

const seo: NextSeoProps = {
  ...defaultSeo,
  ...getPageSeoTitles('Appearance'),
  ...noindexSeoProps,
};

AccountManageSubscriptionPage.getLayout = getSettingsLayout;
AccountManageSubscriptionPage.layoutProps = { seo };

export default AccountManageSubscriptionPage;
