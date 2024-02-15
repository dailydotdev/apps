import React, { ReactElement } from 'react';
import classed from '../../lib/classed';
import { OnboardingHeadline } from './OnboardingHeadline';
import AuthOptions, { AuthDisplay } from './AuthOptions';
import { AuthTriggers } from '../../lib/auth';
import { MemberAlready } from '../onboarding/MemberAlready';
import { useAuthContext } from '../../contexts/AuthContext';

const Container = classed('div', 'flex flex-col w-[23.25rem]');

export function AuthenticationBanner(): ReactElement {
  const { showLogin } = useAuthContext();

  return (
    <div
      className="fixed bottom-0 left-0 z-modal flex w-full flex-row justify-center gap-6 py-10"
      style={{
        background: `linear-gradient(270deg, rgba(206, 61, 243, 0.16) 0%, rgba(113, 71, 237, 0.16) 100%), var(--theme-background-primary)`,
      }}
    >
      <Container>
        <OnboardingHeadline
          className={{ title: 'typo-mega3', description: 'typo-title3' }}
        />
      </Container>
      <Container className="pt-2">
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
      </Container>
    </div>
  );
}
