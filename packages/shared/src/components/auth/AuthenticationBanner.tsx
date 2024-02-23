import React, { ReactElement } from 'react';
import classNames from 'classnames';
import classed from '../../lib/classed';
import { OnboardingHeadline } from './OnboardingHeadline';
import AuthOptions, { AuthDisplay } from './AuthOptions';
import { AuthTriggers } from '../../lib/auth';
import { MemberAlready } from '../onboarding/MemberAlready';
import { useAuthContext } from '../../contexts/AuthContext';
import { BottomBannerContainer } from '../banners';

const Section = classed('div', 'flex flex-col w-[23.25rem]');
export const authGradientBg =
  'bg-theme-bg-primary bg-gradient-to-l from-theme-overlay-active-cabbage from-0% to-theme-overlay-active-onion to-100%';

export function AuthenticationBanner(): ReactElement {
  const { showLogin } = useAuthContext();

  return (
    <BottomBannerContainer
      className={classNames(
        'gap-6 border-t border-theme-color-cabbage py-10 shadow-3',
        authGradientBg,
      )}
    >
      <Section>
        <OnboardingHeadline
          className={{ title: 'typo-mega3', description: 'typo-title3' }}
        />
      </Section>
      <Section className="pt-2">
        <AuthOptions
          ignoreMessages
          formRef={null}
          trigger={AuthTriggers.Onboarding}
          simplified
          defaultDisplay={AuthDisplay.OnboardingSignup}
          forceDefaultDisplay
          className={{ onboardingSignup: '!gap-4' }}
          onAuthStateUpdate={() =>
            showLogin({ trigger: AuthTriggers.Onboarding })
          }
        />
        <MemberAlready
          onLogin={() =>
            showLogin({
              trigger: AuthTriggers.Onboarding,
              options: { isLogin: true },
            })
          }
          className={{
            container: 'justify-center text-theme-label-secondary typo-callout',
            login: 'font-bold',
          }}
        />
      </Section>
    </BottomBannerContainer>
  );
}
