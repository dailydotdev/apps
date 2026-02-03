import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import type { NextSeoProps } from 'next-seo';

import { ThemeSection } from '@dailydotdev/shared/src/components/ProfileMenu/sections/ThemeSection';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { RadioItemProps } from '@dailydotdev/shared/src/components/fields/Radio';
import { Radio } from '@dailydotdev/shared/src/components/fields/Radio';
import { ToggleRadio } from '@dailydotdev/shared/src/components/fields/ToggleRadio';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import {
  LogEvent,
  TargetId,
  TargetType,
} from '@dailydotdev/shared/src/lib/log';
import classNames from 'classnames';
import { FlexCol } from '@dailydotdev/shared/src/components/utilities';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { parseOrDefault } from '@dailydotdev/shared/src/lib/func';
import {
  iOSSupportsAppIconChange,
  postWebKitMessage,
  WebKitMessageHandlers,
} from '@dailydotdev/shared/src/lib/ios';
import { AccountPageContainer } from '../../components/layouts/SettingsLayout/AccountPageContainer';
import { getSettingsLayout } from '../../components/layouts/SettingsLayout';
import { defaultSeo } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';
import { SettingsSwitch } from '../../components/layouts/SettingsLayout/common';

type AppIconOption = {
  name: string | null;
  displayName: string;
  isSelected: boolean;
};

type AppIconResult = {
  action?: 'get' | 'set';
  icons?: AppIconOption[];
  selectedName?: string | null;
  supportsAlternateIcons?: boolean;
};

const densities: RadioItemProps[] = [
  { label: 'Eco', value: 'eco' },
  { label: 'Roomy', value: 'roomy' },
  { label: 'Cozy', value: 'cozy' },
];

const AccountManageSubscriptionPage = (): ReactElement => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { logEvent } = useLogContext();
  const supportsAppIconChange =
    typeof window !== 'undefined' && iOSSupportsAppIconChange();
  const [appIcons, setAppIcons] = useState<AppIconOption[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [supportsAlternateIcons, setSupportsAlternateIcons] = useState(false);
  const [appIconLoading, setAppIconLoading] = useState(false);
  const [appIconError, setAppIconError] = useState<string | null>(null);

  const {
    spaciness,
    setSpaciness,
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

  const appIconOptions = useMemo<RadioItemProps[]>(() => {
    return appIcons.map((icon) => ({
      label: icon.displayName,
      value: icon.name ?? 'default',
    }));
  }, [appIcons]);

  const handleAppIconResult = useCallback((event: Event) => {
    const rawDetail = (event as CustomEvent).detail as unknown;
    const detail =
      typeof rawDetail === 'string'
        ? (parseOrDefault<AppIconResult>(rawDetail) as AppIconResult)
        : (rawDetail as AppIconResult);

    if (!detail || typeof detail !== 'object') {
      return;
    }

    if (detail.action === 'get') {
      const selected =
        detail.selectedName ??
        detail.icons?.find((icon) => icon.isSelected)?.name ??
        null;

      setAppIcons(detail.icons ?? []);
      setSelectedIcon(selected);
      setSupportsAlternateIcons(!!detail.supportsAlternateIcons);
      setAppIconError(null);
      setAppIconLoading(false);
      return;
    }

    if (detail.action === 'set') {
      setSelectedIcon(detail.selectedName ?? null);
      setAppIconError(null);
      setAppIconLoading(false);
    }
  }, []);

  const handleAppIconError = useCallback((event: Event) => {
    const rawDetail = (event as CustomEvent).detail as unknown;
    const detail =
      typeof rawDetail === 'string'
        ? (parseOrDefault<{ reason?: string; message?: string }>(rawDetail) as {
            reason?: string;
            message?: string;
          })
        : (rawDetail as { reason?: string; message?: string });
    const reason = detail?.message || detail?.reason || 'Unable to update icon.';

    setAppIconError(reason);
    setAppIconLoading(false);
  }, []);

  const requestAppIcons = useCallback(() => {
    if (!supportsAppIconChange) {
      return;
    }

    setAppIconLoading(true);
    setAppIconError(null);

    try {
      postWebKitMessage(WebKitMessageHandlers.AppIconGet, null);
    } catch (error) {
      setAppIconError(
        error instanceof Error ? error.message : 'Unable to load icons.',
      );
      setAppIconLoading(false);
    }
  }, [supportsAppIconChange]);

  const handleAppIconChange = useCallback(
    (value: string) => {
      if (!supportsAppIconChange || appIconLoading) {
        return;
      }

      const nextName = value === 'default' ? null : value;
      setAppIconLoading(true);
      setAppIconError(null);

      try {
        postWebKitMessage(WebKitMessageHandlers.AppIconSet, { name: nextName });
      } catch (error) {
        setAppIconError(
          error instanceof Error ? error.message : 'Unable to update icon.',
        );
        setAppIconLoading(false);
      }
    },
    [appIconLoading, supportsAppIconChange],
  );

  useEffect(() => {
    if (!supportsAppIconChange) {
      return;
    }

    window.addEventListener('app-icon-result', handleAppIconResult);
    window.addEventListener('app-icon-error', handleAppIconError);

    requestAppIcons();

    return () => {
      window.removeEventListener('app-icon-result', handleAppIconResult);
      window.removeEventListener('app-icon-error', handleAppIconError);
    };
  }, [
    handleAppIconError,
    handleAppIconResult,
    requestAppIcons,
    supportsAppIconChange,
  ]);

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

        <FlexCol className="gap-2">
          <Typography bold type={TypographyType.Subhead}>
            Density
          </Typography>

          {insaneMode && (
            <Typography
              type={TypographyType.Subhead}
              color={TypographyColor.Tertiary}
            >
              Not available in list layout
            </Typography>
          )}

          <Radio
            name="density"
            options={densities}
            value={spaciness}
            onChange={setSpaciness}
            disabled={insaneMode}
            className={{
              content: 'w-full justify-between !pr-0',
              container: '!gap-0',
              label: classNames(
                'font-normal typo-callout',
                insaneMode ? 'text-text-disabled' : 'text-text-secondary',
              ),
            }}
            reverse
          />
        </FlexCol>

        {supportsAppIconChange && (
          <FlexCol className="gap-2">
            <Typography bold type={TypographyType.Subhead}>
              App icon
            </Typography>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Choose which icon appears on your iOS Home Screen.
            </Typography>

            {appIconLoading && (
              <div className="flex items-center gap-2">
                <Loader className="h-4 w-4" />
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Tertiary}
                >
                  Loading icons…
                </Typography>
              </div>
            )}

            {!appIconLoading && appIconError && (
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                {appIconError}
              </Typography>
            )}

            {!appIconLoading && !supportsAlternateIcons && !appIconError && (
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                Alternate icons aren&apos;t supported on this device.
              </Typography>
            )}

            {!appIconLoading &&
              supportsAlternateIcons &&
              appIconOptions.length > 0 && (
                <Radio
                  name="app-icon"
                  options={appIconOptions}
                  value={selectedIcon ?? 'default'}
                  onChange={handleAppIconChange}
                  disabled={appIconLoading}
                  className={{
                    content: 'w-full justify-between !pr-0',
                    container: '!gap-0',
                    label: 'font-normal typo-callout text-text-secondary',
                  }}
                  reverse
                />
              )}
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
