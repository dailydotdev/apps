import React, { ReactElement } from 'react';
import classNames from 'classnames';
import classed from '../../lib/classed';
import { OnboardingHeadline } from './OnboardingHeadline';
import AuthOptions, { AuthDisplay } from './AuthOptions';
import { AuthTriggers } from '../../lib/auth';
import { MemberAlready } from '../onboarding/MemberAlready';
import { useAuthContext } from '../../contexts/AuthContext';
import { BottomBannerContainer } from '../banners';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { OnboardingBanner } from '../../lib/featureValues';

const Section = classed('div', 'flex flex-col');
export const authGradientBg =
  'bg-background-default bg-gradient-to-l from-theme-overlay-active-cabbage from-0% to-theme-overlay-active-onion to-100%';

export function AuthenticationBanner(): ReactElement {
  const { showLogin } = useAuthContext();
  const onboardingBanner = useFeature(feature.onboardingBanner);

  return (
    <BottomBannerContainer
      className={classNames(
        'gap-24 border-t border-accent-cabbage-default shadow-3 laptopL:gap-32',
        authGradientBg,
        onboardingBanner === OnboardingBanner.V1 ? 'pb-5 pt-10' : 'py-10',
      )}
    >
      <Section className="w-[32.5rem]">
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
              '!gap-4',
              onboardingBanner === OnboardingBanner.V1 && '!flex-row',
            ),
            ...(onboardingBanner === OnboardingBanner.V1 && {
              onboardingDivider: '!mb-3 h-8',
              onboardingForm: '!gap-4 !mb-3',
            }),
          }}
          onAuthStateUpdate={(props) =>
            showLogin({
              trigger: AuthTriggers.Onboarding,
              options: {
                formValues: {
                  email: props?.email,
                },
              },
            })
          }
          onboardingSignupButton={{
            variant: ButtonVariant.Primary,
            ...(onboardingBanner === OnboardingBanner.V1 && {
              className: 'flex-1',
              size: ButtonSize.Medium,
            }),
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
            container: 'justify-center text-text-secondary typo-callout',
            login: 'font-bold',
          }}
        />
      </Section>
    </BottomBannerContainer>
  );
}
