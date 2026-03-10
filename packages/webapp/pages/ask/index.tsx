import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { NextSeoProps } from 'next-seo';
import { usePlusSubscription } from '@dailydotdev/shared/src/hooks';
import { FlexCol } from '@dailydotdev/shared/src/components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { DevPlusIcon } from '@dailydotdev/shared/src/components/icons';
import { plusUrl } from '@dailydotdev/shared/src/lib/constants';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent, TargetId } from '@dailydotdev/shared/src/lib/log';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { AskHero } from '@dailydotdev/shared/src/features/ask/components/AskHero';
import { AskProblem } from '@dailydotdev/shared/src/features/ask/components/AskProblem';
import { AskHowItWorks } from '@dailydotdev/shared/src/features/ask/components/AskHowItWorks';
import { AskComparison } from '@dailydotdev/shared/src/features/ask/components/AskComparison';
import { AskInstall } from '@dailydotdev/shared/src/features/ask/components/AskInstall';
import { AskFAQ } from '@dailydotdev/shared/src/features/ask/components/AskFAQ';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { defaultSeo } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  ...defaultSeo,
  ...getPageSeoTitles('Ask — WebSearch for developers'),
};

type AskPath = 'learn' | 'dev' | null;

const AskPage = (): ReactElement => {
  const [selectedPath, setSelectedPath] = useState<AskPath>(null);
  const { isPlus } = usePlusSubscription();
  const { isLoggedIn, showLogin } = useAuthContext();
  const { logEvent } = useLogContext();

  const showLearnSections = selectedPath === 'learn';
  const showInstall = selectedPath !== null;

  const handlePathSelect = (path: AskPath) => {
    setSelectedPath(path);
    logEvent({
      event_name: LogEvent.Click,
      target_id: TargetId.AskPage,
      extra: JSON.stringify({ path }),
    });
  };

  return (
    <div className="mx-auto w-full border-border-subtlest-tertiary laptop:max-w-[48rem] laptop:border-x">
      <FlexCol className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-xl items-center justify-center gap-10 px-4 py-10 laptop:max-w-4xl">
        <AskHero
          onLearnClick={() => handlePathSelect('learn')}
          onDevClick={() => handlePathSelect('dev')}
        />

        <div
          className={`flex w-full flex-col items-center gap-10 transition-all duration-500 ${
            showLearnSections
              ? 'max-h-[5000px] opacity-100'
              : 'max-h-0 overflow-hidden opacity-0'
          }`}
        >
          <AskProblem />
          <AskHowItWorks />
          <AskComparison />
        </div>

        <div
          className={`flex w-full flex-col items-center gap-10 transition-all duration-500 ${
            showInstall
              ? 'max-h-[3000px] opacity-100'
              : 'max-h-0 overflow-hidden opacity-0'
          }`}
        >
          {!isPlus && (
            <div className="plus-entry-gradient flex w-full flex-col items-center gap-3 overflow-hidden rounded-16 p-6">
              <Typography type={TypographyType.Title3} bold center>
                Unlock daily-dev-ask with Plus
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Secondary}
                center
              >
                daily-dev-ask requires a Plus subscription. Upgrade to get API
                access and connect your AI tools.
              </Typography>
              <Button
                tag="a"
                href={plusUrl}
                variant={ButtonVariant.Primary}
                color={ButtonColor.Avocado}
                size={ButtonSize.Large}
                icon={<DevPlusIcon />}
                onClick={(e) => {
                  if (!isLoggedIn) {
                    e.preventDefault();
                    showLogin({ trigger: AuthTriggers.Plus });
                    return;
                  }
                  logEvent({
                    event_name: LogEvent.UpgradeSubscription,
                    target_id: TargetId.AskPage,
                  });
                }}
              >
                Upgrade to Plus
              </Button>
            </div>
          )}

          <AskInstall />
          <AskFAQ />
        </div>
      </FlexCol>
    </div>
  );
};

const getAskLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

AskPage.getLayout = getAskLayout;
AskPage.layoutProps = { screenCentered: false, seo };

export default AskPage;
