import React, { CSSProperties, ReactElement } from 'react';
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
const style: CSSProperties = {
  background: `linear-gradient(270deg, var(--theme-overlay-active-cabbage) 0%, var(--theme-overlay-active-onion) 100%), var(--theme-background-primary)`,
};

export function AuthenticationBanner(): ReactElement {
  const { showLogin } = useAuthContext();
  const isLaptop = useViewSize(ViewSize.Laptop);

  if (!isLaptop) {
    return (
      <LoginButton
        style={style}
        className={{
          container: classNames(bottomBannerBaseClasses, 'gap-2 px-4 py-2'),
          button: 'flex-1 tablet:max-w-[9rem]',
        }}
      />
    );
  }

  return (
    <BottomBannerContainer className="gap-6 py-10" style={style}>
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
