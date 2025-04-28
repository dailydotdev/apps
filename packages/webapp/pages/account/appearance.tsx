import React, { useCallback } from 'react';
import type { ReactElement, ReactNode } from 'react';
import type { NextSeoProps } from 'next-seo';

import { ThemeSection } from '@dailydotdev/shared/src/components/ProfileMenu/sections/ThemeSection';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import { Radio } from '@dailydotdev/shared/src/components/fields/Radio';
import { ToggleRadio } from '@dailydotdev/shared/src/components/fields/ToggleRadio';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import {
  LogEvent,
  TargetId,
  TargetType,
} from '@dailydotdev/shared/src/lib/log';
import classNames from 'classnames';
import { AccountPageContainer } from '../../components/layouts/AccountLayout/AccountPageContainer';
import { getAccountLayout } from '../../components/layouts/AccountLayout';
import { defaultSeo } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

type SettingsSwitchProps = {
  name?: string;
  children: ReactNode;
  checked: boolean;
  onToggle: () => void;
};

const SettingsSwitch = ({ name, children, ...props }: SettingsSwitchProps) => {
  return (
    <div className="flex justify-between">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
      >
        {children}
      </Typography>
      <Switch
        inputId={`${name}-switch`}
        name={name}
        compact={false}
        {...props}
      />
    </div>
  );
};

const densities = [
  { label: 'Eco', value: 'eco' },
  { label: 'Roomy', value: 'roomy' },
  { label: 'Cozy', value: 'cozy' },
];

const AccountManageSubscriptionPage = (): ReactElement => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { logEvent } = useLogContext();

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

  return (
    <AccountPageContainer title="Appearance">
      <div className="flex flex-col gap-6">
        <ThemeSection />

        {isLaptop && (
          <section className="flex flex-col gap-2">
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
          </section>
        )}

        <section className="flex flex-col gap-2">
          <Typography bold type={TypographyType.Subhead}>
            Density
          </Typography>

          {insaneMode && (
            <Typography
              type={TypographyType.Subhead}
              color={TypographyColor.Tertiary}
            >
              Density is not customizable in list mode layout.
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
        </section>

        <section className="flex flex-col gap-5">
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
            Enable companion
          </SettingsSwitch>
        </section>

        <section className="flex flex-col gap-5">
          <Typography bold type={TypographyType.Subhead}>
            Accessibility
          </Typography>

          <SettingsSwitch
            name="auto-dismiss-notifications"
            checked={autoDismissNotifications}
            onToggle={toggleAutoDismissNotifications}
          >
            Automatically dismiss notifications
          </SettingsSwitch>
        </section>
      </div>
    </AccountPageContainer>
  );
};

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Appearance'),
};

AccountManageSubscriptionPage.getLayout = getAccountLayout;
AccountManageSubscriptionPage.layoutProps = { seo };

export default AccountManageSubscriptionPage;
