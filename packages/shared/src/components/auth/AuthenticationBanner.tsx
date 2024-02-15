import React, { ReactElement } from 'react';
import classNames from 'classnames';
import classed from '../../lib/classed';
import { OnboardingHeadline } from './OnboardingHeadline';
import AuthOptions, { AuthDisplay } from './AuthOptions';
import { AuthTriggers } from '../../lib/auth';
import { MemberAlready } from '../onboarding/MemberAlready';
import { useAuthContext } from '../../contexts/AuthContext';
import { useViewSize, ViewSize } from '../../hooks';
import LoginButton from '../LoginButton';
import { bottomBannerBaseClasses, BottomBannerContainer } from '../banners';

const Section = classed('div', 'flex flex-col w-[23.25rem]');
const gradientBg =
  'bg-theme-bg-primary bg-gradient-to-l from-theme-overlay-active-cabbage from-0% to-theme-overlay-active-onion to-100%';

export function AuthenticationBanner(): ReactElement {
  const { showLogin } = useAuthContext();
  const isLaptop = useViewSize(ViewSize.Laptop);

  if (!isLaptop) {
    return (
      <LoginButton
        className={{
          container: classNames(
            bottomBannerBaseClasses,
            gradientBg,
            'gap-2 px-4 py-2',
          ),
          button: 'flex-1 tablet:max-w-[9rem]',
        }}
      />
    );
  }

  return (
    <BottomBannerContainer
      className={classNames('gap-6 py-10 shadow-3', gradientBg)}
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
