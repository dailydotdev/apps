import type { ReactElement } from 'react';
import React, { useState } from 'react';
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
import { AccountPageContainer } from '../../../components/layouts/SettingsLayout/AccountPageContainer';
import { getSettingsLayout } from '../../../components/layouts/SettingsLayout';
import { defaultSeo } from '../../../next-seo';
import { getTemplatedTitle } from '../../../components/layouts/utils';
import { SettingsSwitch } from '../../../components/layouts/SettingsLayout/common';

// Combined Streaks & gamification settings. The reading-streak visibility
// toggle used to live on both this page and the separate Streaks page; they're
// now one page (the Streaks route re-exports this), so the toggle appears once
// alongside the streak time/weekend preferences.
const GamificationSettingsPage = (): ReactElement => {
  const { user } = useAuthContext();
  const {
    optOutReadingStreak,
    isGamificationEnabled,
    isQuestExperienceEnabled,
    toggleOptOutReadingStreak,
    toggleQuestExperience,
    toggleAllGamification,
  } = useSettingsContext();

  const [userTimeZone, setUserTimeZone] = useState<string>(
    getUserInitialTimezone({ userTimezone: user?.timezone, update: true }),
  );

  return (
    <AccountPageContainer title="Streaks & gamification">
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-2 border-b border-border-subtlest-tertiary pb-6">
          <Typography bold type={TypographyType.Subhead}>
            Show gamification features
          </Typography>

          <SettingsSwitch
            name="all-gamification"
            checked={isGamificationEnabled}
            onToggle={toggleAllGamification}
          >
            Master toggle for all gamification features. Turning this off hides
            streaks, levels, quests, and achievements across daily.dev.
          </SettingsSwitch>
        </section>

        <section className="flex flex-col gap-2">
          <Typography bold type={TypographyType.Subhead}>
            Show reading streaks
          </Typography>

          <SettingsSwitch
            name="reading-streak"
            checked={!optOutReadingStreak}
            onToggle={toggleOptOutReadingStreak}
          >
            Toggle to display or hide your daily reading streaks. Turning
            streaks off will not affect your activity or progress.
          </SettingsSwitch>
        </section>

        {/* One switch for the whole quest experience — quests, level/XP
            progress, and achievements move together (reading streaks stay
            separate above). */}
        <section className="flex flex-col gap-2 border-b border-border-subtlest-tertiary pb-6">
          <Typography bold type={TypographyType.Subhead}>
            Show quests
          </Typography>

          <SettingsSwitch
            name="quest-experience"
            checked={isQuestExperienceEnabled}
            onToggle={toggleQuestExperience}
          >
            Toggle to display or hide quests, level/XP progress, and
            achievements across daily.dev. Turning this off won&apos;t affect
            your progress — you&apos;ll still earn everything in the background.
          </SettingsSwitch>
        </section>

        {/* Streak time preferences (merged from the former Streaks page). */}
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
  title: getTemplatedTitle('Streaks & gamification'),
};

GamificationSettingsPage.getLayout = getSettingsLayout;
GamificationSettingsPage.layoutProps = { seo };

export default GamificationSettingsPage;
