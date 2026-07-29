import React, { useState } from 'react';
import type { ReactElement } from 'react';
import type { NextSeoProps } from 'next-seo';

import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

import { ToggleWeekStart } from '@dailydotdev/shared/src/components/widgets/ToggleWeekStart';
import { ReadingStreakIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { TimezoneDropdown } from '@dailydotdev/shared/src/components/widgets/TimezoneDropdown';
import { getUserInitialTimezone } from '@dailydotdev/shared/src/lib/timezones';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useStreakFreeze } from '@dailydotdev/shared/src/hooks/streaks/useStreakFreeze';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { featureStreakFreeze } from '@dailydotdev/shared/src/lib/featureManagement';
import { useHasAccessToCores } from '@dailydotdev/shared/src/hooks/useCoresFeature';
import { AccountPageContainer } from '../../../components/layouts/SettingsLayout/AccountPageContainer';
import { getSettingsLayout } from '../../../components/layouts/SettingsLayout';
import { defaultSeo, noindexSeoProps } from '../../../next-seo';
import { getPageSeoTitles } from '../../../components/layouts/utils';
import { SettingsSwitch } from '../../../components/layouts/SettingsLayout/common';

const AccountManageSubscriptionPage = (): ReactElement => {
  const { user } = useAuthContext();
  const {
    optOutReadingStreak,
    toggleOptOutReadingStreak,
    optOutStreakFreeze,
    toggleOptOutStreakFreeze,
  } = useSettingsContext();
  const { openModal } = useLazyModal();
  const hasAccessToCores = useHasAccessToCores();
  const { value: isStreakFreezeEnabled } = useConditionalFeature({
    feature: featureStreakFreeze,
    shouldEvaluate: hasAccessToCores,
  });
  const showStreakFreezeSection = hasAccessToCores && isStreakFreezeEnabled;
  const { freezesAvailable } = useStreakFreeze({
    enabled: showStreakFreezeSection,
  });

  const [userTimeZone, setUserTimeZone] = useState<string>(
    getUserInitialTimezone({
      userTimezone: user?.timezone,
      update: true,
    }),
  );

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
            Toggle to display or hide your daily reading streaks. Turning
            streaks off will not affect your activity or progress.
          </SettingsSwitch>
        </section>

        {showStreakFreezeSection && (
          <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Typography bold type={TypographyType.Subhead}>
                Streak freezes
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                Freezes automatically cover a missed reading day so your streak
                survives. Buy packs with Cores below.
              </Typography>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-12 border border-border-subtlest-tertiary p-4">
              <Typography bold type={TypographyType.Body}>
                {freezesAvailable} freeze{freezesAvailable === 1 ? '' : 's'}{' '}
                available
              </Typography>
              <Button
                variant={ButtonVariant.Secondary}
                onClick={() =>
                  openModal({ type: LazyModal.StreakFreezePurchase })
                }
              >
                Buy freezes
              </Button>
            </div>

            <SettingsSwitch
              name="auto-streak-freeze"
              checked={!optOutStreakFreeze}
              onToggle={toggleOptOutStreakFreeze}
            >
              Automatically use streak freezes to cover missed reading days.
              Turning this off means a missed day resets your streak instead
              (you can still restore it with Cores).
            </SettingsSwitch>
          </section>
        )}

        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <Typography bold type={TypographyType.Subhead}>
              Time preference
            </Typography>

            <Typography
              type={TypographyType.Callout}
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
              type={TypographyType.Callout}
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
  ...getPageSeoTitles('Streaks'),
  ...noindexSeoProps,
};

AccountManageSubscriptionPage.getLayout = getSettingsLayout;
AccountManageSubscriptionPage.layoutProps = { seo };

export default AccountManageSubscriptionPage;
