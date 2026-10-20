import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { createStore, Provider as JotaiProvider, useAtom } from 'jotai';
import { fn } from 'storybook/test';
import AuthOptions from '@dailydotdev/shared/src/components/auth/AuthOptions';
import { AuthDisplay } from '@dailydotdev/shared/src/components/auth/common';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { FunnelStepTopBar } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepTopBar';
import { authAtom } from '@dailydotdev/shared/src/features/onboarding/store/onboarding.store';
import { FunnelProgressContext } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepDots';
import { FunnelHeroLanding } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelHeroLanding';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import ExtensionProviders, { bootAsAnonymous } from '../extension/_providers';
import { useRouter } from '../../mock/next-router';

export const DEMO_EMAIL = 'ada@lovelace.dev';

export const mockOnboardingRouter = (): void => {
  bootAsAnonymous();
  useRouter.mockImplementation(() => ({
    replace: fn(),
    push: fn(),
    pathname: '/onboarding',
    query: {},
    events: { on: fn(), off: fn() },
  }));
};

// The `/onboarding` page while `isAuthenticating`, line for line: the funnel
// top bar over the simplified AuthOptions.
export const OnboardingAuthPage = ({
  defaultDisplay,
}: {
  defaultDisplay: AuthDisplay;
}): ReactElement | null => {
  const [auth, setAuth] = useAtom(authAtom);
  const formRef = useRef<HTMLFormElement>(null as unknown as HTMLFormElement);
  const [isSeeded, setIsSeeded] = useState(false);

  useEffect(() => {
    setAuth((prev) => ({ ...prev, defaultDisplay }));
    setIsSeeded(true);
  }, [defaultDisplay, setAuth]);

  if (!isSeeded) {
    return null;
  }

  const authBackTarget: Partial<Record<AuthDisplay, AuthDisplay>> = {
    ...(!auth.isLoginFlow && {
      [AuthDisplay.Registration]: AuthDisplay.OnboardingSignup,
    }),
    [AuthDisplay.EmailVerification]: auth.isLoginFlow
      ? AuthDisplay.Default
      : AuthDisplay.Registration,
  };
  const authBack = auth.defaultDisplay && authBackTarget[auth.defaultDisplay];
  const onAuthBack = authBack
    ? () => setAuth((prev) => ({ ...prev, defaultDisplay: authBack }))
    : undefined;

  return (
    <div className="relative z-3 flex h-full max-h-dvh min-h-dvh w-full flex-1 flex-col items-center overflow-x-hidden bg-background-default">
      <FunnelStepTopBar onBack={onAuthBack} />
      <div className="relative z-2 flex w-full flex-grow flex-col flex-wrap justify-start px-4 pt-3 tablet:flex-row tablet:justify-center tablet:gap-10 tablet:px-6">
        <AuthOptions
          simplified
          formRef={formRef}
          hideSignupDisclaimer
          isOnboardingFunnel
          className={{
            container: 'w-full rounded-none tablet:max-w-[30rem] h-full',
            onboardingSignup: '!gap-5 !pb-5 tablet:gap-8 tablet:pb-8',
          }}
          trigger={AuthTriggers.Onboarding}
          defaultDisplay={auth.defaultDisplay}
          initialEmail={DEMO_EMAIL}
          isLoginFlow={auth.isLoginFlow}
          onAuthStateUpdate={(props) => {
            const { isAuthenticating, ...rest } = props;
            setAuth((prev) => ({
              ...prev,
              ...rest,
              isAuthenticating: isAuthenticating ?? true,
            }));
          }}
          onSuccessfulLogin={fn()}
          onSuccessfulRegistration={fn()}
        />
      </div>
    </div>
  );
};

export const Providers = ({
  children,
  isAuthenticating = true,
}: {
  children: ReactNode;
  // `/onboarding` sets it once it swaps the funnel for a bare auth screen;
  // the hero step runs inside the funnel with it off.
  isAuthenticating?: boolean;
}): ReactElement => {
  // `/onboarding` only renders these screens while the auth atom says the
  // user is authenticating, and RegistrationForm reads that same flag.
  const [store] = useState(() => {
    const value = createStore();
    value.set(authAtom, { ...value.get(authAtom), isAuthenticating });
    return value;
  });

  return (
    <JotaiProvider store={store}>
      <ExtensionProviders>
        {/* react-modal looks for the app root the webapp renders. */}
        <div id="__next">{children}</div>
      </ExtensionProviders>
    </JotaiProvider>
  );
};

// The real first screen of `/onboarding`: the hero step inside the funnel,
// which owns its own provider list → email form → verify sequence.
export const OnboardingHero = (): ReactElement => (
  <FunnelProgressContext.Provider
    value={{
      chapters: [{ steps: 1 }],
      position: { chapter: 0, step: 0 },
      isOnboarding: true,
    }}
  >
    <FunnelHeroLanding
      id="hero-landing-step"
      type={FunnelStepType.HeroLanding}
      transitions={[]}
      onTransition={fn()}
      isActive
      parameters={{
        headline: "Where developers discover what's next.",
        background: 'horizon',
        oauthOrder: 'googleFirst',
      }}
    />
  </FunnelProgressContext.Provider>
);
