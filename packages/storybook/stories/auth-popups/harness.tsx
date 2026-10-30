import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { createStore, Provider as JotaiProvider, useAtom } from 'jotai';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fn } from 'storybook/test';
import AuthModal from '@dailydotdev/shared/src/components/auth/AuthModal';
import AuthOptions from '@dailydotdev/shared/src/components/auth/AuthOptions';
import { AuthDisplay } from '@dailydotdev/shared/src/components/auth/common';
import { BootDataProvider } from '@dailydotdev/shared/src/contexts/BootProvider';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import type { SignBackProvider } from '@dailydotdev/shared/src/hooks/auth/useSignBack';
import { useSignBack } from '@dailydotdev/shared/src/hooks/auth/useSignBack';
import { FunnelStepTopBar } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepTopBar';
import { authAtom } from '@dailydotdev/shared/src/features/onboarding/store/onboarding.store';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { fallbackImages } from '@dailydotdev/shared/src/lib/config';
import { defaultBootData, getBootMock } from '../../mock/boot';
import { useRouter } from '../../mock/next-router';

export const DEMO_EMAIL = 'ada@lovelace.dev';

const DEMO_USER = {
  name: 'Ada Lovelace',
  email: DEMO_EMAIL,
  image: fallbackImages.avatar,
};

// Call from `beforeEach`, so Storybook's mock restore undoes it between
// stories.
export const mockLoggedOutWebapp = (): void => {
  getBootMock.mockReturnValue({
    ...defaultBootData,
    user: { id: 'anonymous-visitor' },
    accessToken: { token: '1', expiresIn: '1' },
    visit: { sessionId: '1', visitId: '1' },
    feeds: [],
  });
  useRouter.mockImplementation(() => ({
    replace: fn(),
    push: fn(),
    pathname: '/posts',
    query: {},
    events: { on: fn(), off: fn() },
  }));
};

// The pop-up opens on "Welcome back" whenever the browser remembers the last
// sign-in, and every frame shares this origin's storage, so each screen sets
// or clears it before the pop-up mounts.
const RememberedAccount = ({
  provider,
  children,
}: {
  provider?: SignBackProvider;
  children: ReactNode;
}): ReactElement | null => {
  const { onUpdateSignBack } = useSignBack();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    onUpdateSignBack(provider ? DEMO_USER : null, provider ?? null).then(() =>
      setIsReady(true),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isReady ? <>{children}</> : null;
};

export const Providers = ({
  children,
  rememberedProvider,
}: {
  children: ReactNode;
  rememberedProvider?: SignBackProvider;
}): ReactElement => {
  const [queryClient] = useState(() => new QueryClient());
  const [store] = useState(() => createStore());

  return (
    <JotaiProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <BootDataProvider
          app={BootApp.Webapp}
          deviceId="123"
          getPage={fn()}
          getRedirectUri={fn()}
          version="pwa"
          localBootData={getBootMock()}
        >
          {/* react-modal looks for the app root the webapp renders. */}
          <div id="__next">
            <RememberedAccount provider={rememberedProvider}>
              {children}
            </RememberedAccount>
          </div>
        </BootDataProvider>
      </QueryClientProvider>
    </JotaiProvider>
  );
};

export interface PopupProps {
  trigger?: AuthTriggers;
  isLogin?: boolean;
  defaultDisplay?: AuthDisplay;
  email?: string;
}

// The real AuthModal, opened through `showLogin` the way every call site
// does, and mounted the way `_app` mounts it.
export const AuthPopup = ({
  trigger = AuthTriggers.MainButton,
  isLogin = false,
  defaultDisplay,
  email,
}: PopupProps): ReactElement => {
  const { showLogin, closeLogin, loginState } = useAuthContext();
  const open = (): void =>
    showLogin({
      trigger,
      options: {
        isLogin,
        defaultDisplay,
        ...(email && { formValues: { email } }),
      },
    });

  useEffect(() => {
    open();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-background-default">
      {loginState ? (
        <AuthModal
          isOpen
          onRequestClose={closeLogin}
          contentLabel="Login Modal"
          trigger={loginState.trigger}
        />
      ) : (
        <button
          type="button"
          className="rounded-12 bg-surface-float px-4 py-2 text-text-primary typo-callout"
          onClick={open}
        >
          Open the pop-up again
        </button>
      )}
    </div>
  );
};

// `/onboarding?action=login`, line for line: the funnel top bar over the
// simplified AuthOptions, the page the landing's "Log in" links to.
export const FullPageLogin = (): ReactElement | null => {
  const [auth, setAuth] = useAtom(authAtom);
  const formRef = useRef<HTMLFormElement>(null as unknown as HTMLFormElement);
  const [isSeeded, setIsSeeded] = useState(false);

  useEffect(() => {
    setAuth((prev) => ({
      ...prev,
      isAuthenticating: true,
      isLoginFlow: true,
      defaultDisplay: AuthDisplay.Default,
    }));
    setIsSeeded(true);
  }, [setAuth]);

  if (!isSeeded) {
    return null;
  }

  return (
    <div className="relative z-3 flex h-full max-h-dvh min-h-dvh w-full flex-1 flex-col items-center overflow-x-hidden bg-background-default">
      <FunnelStepTopBar />
      <div className="relative z-2 flex w-full flex-grow flex-col flex-wrap justify-start px-4 pt-3 tablet:flex-row tablet:justify-center tablet:gap-10 tablet:px-6">
        <AuthOptions
          simplified
          hideSignupDisclaimer
          isOnboardingFunnel
          formRef={formRef}
          className={{
            container: 'w-full rounded-none tablet:max-w-[30rem] h-full',
            onboardingSignup: '!gap-5 !pb-5 tablet:gap-8 tablet:pb-8',
          }}
          trigger={AuthTriggers.Onboarding}
          defaultDisplay={auth.defaultDisplay}
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
