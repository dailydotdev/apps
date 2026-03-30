import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks';
import { questsFeature } from '@dailydotdev/shared/src/lib/featureManagement';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { AccountPageContainer } from '../../../components/layouts/SettingsLayout/AccountPageContainer';
import { getSettingsLayout } from '../../../components/layouts/SettingsLayout';
import { defaultSeo } from '../../../next-seo';
import { getTemplatedTitle } from '../../../components/layouts/utils';
import { SettingsSwitch } from '../../../components/layouts/SettingsLayout/common';

const GamificationSettingsPage = (): ReactElement => {
  const router = useRouter();
  const {
    optOutLevelSystem,
    optOutQuestSystem,
    toggleOptOutLevelSystem,
    toggleOptOutQuestSystem,
  } = useSettingsContext();
  const { value: isQuestsFeatureEnabled, isLoading: isQuestsFeatureLoading } =
    useConditionalFeature({
      feature: questsFeature,
    });

  useEffect(() => {
    if (isQuestsFeatureLoading || isQuestsFeatureEnabled === true) {
      return;
    }

    router.replace('/settings/customization/streaks');
  }, [isQuestsFeatureEnabled, isQuestsFeatureLoading, router]);

  if (isQuestsFeatureLoading || isQuestsFeatureEnabled !== true) {
    return null;
  }

  return (
    <AccountPageContainer title="Gamification">
      <div className="flex flex-col gap-6">
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
          <div className="flex flex-col gap-1">
            <Typography bold type={TypographyType.Subhead}>
              Show quests
            </Typography>

            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Turn quest UI on or off across the product.
            </Typography>
          </div>

          <SettingsSwitch
            name="quest-system"
            checked={!optOutQuestSystem}
            onToggle={toggleOptOutQuestSystem}
          >
            Toggle to display or hide the quest system UI.
          </SettingsSwitch>
        </section>
      </div>
    </AccountPageContainer>
  );
};

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Gamification'),
};

GamificationSettingsPage.getLayout = getSettingsLayout;
GamificationSettingsPage.layoutProps = { seo };

export default GamificationSettingsPage;
