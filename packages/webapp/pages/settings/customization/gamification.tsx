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
    optOutLevelSystem,
    optOutQuestSystem,
    optOutAchievements,
    isGamificationEnabled,
    toggleOptOutReadingStreak,
    toggleOptOutLevelSystem,
    toggleOptOutQuestSystem,
    toggleOptOutAchievements,
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

        <section className="flex flex-col gap-2">
          <Typography bold type={TypographyType.Subhead}>
            Show levels
          </Typography>

          <SettingsSwitch
            name="level-system"
            checked={!optOutLevelSystem}
            onToggle={toggleOptOutLevelSystem}
          >
            Toggle to display or hide your level progress. Turning levels off
            will also hide XP rewards on quests, but you will still earn the
            full XP in the background.
          </SettingsSwitch>
        </section>

        <section className="flex flex-col gap-2">
          <Typography bold type={TypographyType.Subhead}>
            Show quests
          </Typography>

          <SettingsSwitch
            name="quest-system"
            checked={!optOutQuestSystem}
            onToggle={toggleOptOutQuestSystem}
          >
            Toggle to display or hide the quest system UI across the product.
          </SettingsSwitch>
        </section>

        <section className="flex flex-col gap-2 border-b border-border-subtlest-tertiary pb-6">
          <Typography bold type={TypographyType.Subhead}>
            Show achievements
          </Typography>

          <SettingsSwitch
            name="achievements"
            checked={!optOutAchievements}
            onToggle={toggleOptOutAchievements}
          >
            Toggle to display or hide achievements, badges, and achievement
            notifications. Turning achievements off will not affect your
            progress or unlocks.
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
