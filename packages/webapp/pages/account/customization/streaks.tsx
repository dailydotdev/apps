import React, { useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import type { NextSeoProps } from 'next-seo';

import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';

import { ToggleWeekStart } from '@dailydotdev/shared/src/components/widgets/ToggleWeekStart';
import { ReadingStreakIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { TimezoneDropdown } from '@dailydotdev/shared/src/components/widgets/TimezoneDropdown';
import { getUserInitialTimezone } from '@dailydotdev/shared/src/lib/timezones';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { AccountPageContainer } from '../../../components/layouts/AccountLayout/AccountPageContainer';
import { getAccountLayout } from '../../../components/layouts/AccountLayout';
import { defaultSeo } from '../../../next-seo';
import { getTemplatedTitle } from '../../../components/layouts/utils';

type SettingsSwitchProps = {
  name?: string;
  children: ReactNode;
  checked: boolean;
  onToggle: () => void;
};

const SettingsSwitch = ({ name, children, ...props }: SettingsSwitchProps) => {
  return (
    <div className="flex justify-between gap-4">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
        className="flex-1"
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

const AccountManageSubscriptionPage = (): ReactElement => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();

  const [userTimeZone, setUserTimeZone] = useState<string>(
    getUserInitialTimezone({
      userTimezone: user?.timezone,
      update: true,
    }),
  );

  const { optOutReadingStreak, toggleOptOutReadingStreak } =
    useSettingsContext();

  return (
    <AccountPageContainer title="Streaks">
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-2">
          <Typography bold type={TypographyType.Subhead}>
            Show reading streaks
          </Typography>

          <SettingsSwitch
            name="new-tab"
            checked={!optOutReadingStreak}
            onToggle={toggleOptOutReadingStreak}
          >
            Receive notifications for mentions, replies, comments and more,
            keeping you connected with the community.
          </SettingsSwitch>
        </section>

        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <Typography bold type={TypographyType.Subhead}>
              Time preference
            </Typography>

            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Select your time zone and the beginning of the weekend in your
              area, so that we can be accurate in sending the notifications.
              This will also effect the{' '}
              <ReadingStreakIcon
                secondary
                size={IconSize.Size16}
                className="inline"
              />{' '}
              Reading streak freeze days.
            </Typography>
          </div>

          <TimezoneDropdown
            userTimeZone={userTimeZone}
            setUserTimeZone={setUserTimeZone}
            className={{ container: '!mt-0' }}
          />
        </section>

        <section className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <Typography bold type={TypographyType.Subhead}>
              Weekend days
            </Typography>

            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              This will affect the personalized digest, reading reminders and
              reading streak freeze days.
            </Typography>
          </div>

          <ToggleWeekStart />
        </section>
      </div>
    </AccountPageContainer>
  );
};

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Streaks'),
};

AccountManageSubscriptionPage.getLayout = getAccountLayout;
AccountManageSubscriptionPage.layoutProps = { seo };

export default AccountManageSubscriptionPage;
