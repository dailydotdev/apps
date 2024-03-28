import React, { ReactElement } from 'react';
import classNames from 'classnames';
import classed from '../../lib/classed';
import { OnboardingHeadline } from './OnboardingHeadline';
import AuthOptions, { AuthDisplay } from './AuthOptions';
import { AuthTriggers } from '../../lib/auth';
import { MemberAlready } from '../onboarding/MemberAlready';
import { useAuthContext } from '../../contexts/AuthContext';
import { BottomBannerContainer } from '../banners';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { PostPageOnboarding } from '../../lib/featureValues';
import { ButtonVariant } from '../buttons/common';

const Section = classed('div', 'flex flex-col');
export const authGradientBg =
  'bg-background-default bg-gradient-to-l from-theme-overlay-active-cabbage from-0% to-theme-overlay-active-onion to-100%';

export function AuthenticationBanner(): ReactElement {
  const { showLogin } = useAuthContext();
  const isPostPageOnboardingV5 =
    useFeature(feature.postPageOnboarding) === PostPageOnboarding.V5;

  return (
    <BottomBannerContainer
      className={classNames(
        'border-t border-theme-color-cabbage py-10 shadow-3 laptopL:gap-32',
        isPostPageOnboardingV5 ? 'gap-10' : 'gap-24',
        authGradientBg,
      )}
    >
      <Section
        className={isPostPageOnboardingV5 ? 'w-[23.25rem]' : 'w-[32.5rem]'}
      >
        <OnboardingHeadline
          className={{ title: 'typo-mega3', description: 'typo-title3' }}
        />
      </Section>
      <Section className="w-[23.25rem] pt-2">
        <AuthOptions
          ignoreMessages
          formRef={null}
          trigger={AuthTriggers.Onboarding}
          simplified
          defaultDisplay={AuthDisplay.OnboardingSignup}
          forceDefaultDisplay
          className={{
            onboardingSignup: classNames(
              isPostPageOnboardingV5
                ? 'flex !flex-row !gap-3 !pb-3 *:grow'
                : '!gap-4',
            ),
          }}
          onAuthStateUpdate={() =>
            showLogin({ trigger: AuthTriggers.Onboarding })
          }
          compact={isPostPageOnboardingV5}
          onboardingSignupButton={{
            variant: isPostPageOnboardingV5
              ? ButtonVariant.Float
              : ButtonVariant.Primary,
          }}
        />
        <MemberAlready
          onLogin={() =>
            showLogin({
              trigger: AuthTriggers.Onboarding,
              options: { isLogin: true },
            })
          }
          className={{
            container: classNames(
              'justify-center text-text-secondary typo-callout',
              isPostPageOnboardingV5 && 'py-3',
            ),
            login: 'font-bold',
          }}
        />
      </Section>
    </BottomBannerContainer>
  );
}
