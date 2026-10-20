import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  BellIcon,
  CompassIcon,
  HomeIcon,
  SourceIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import { OnboardingHeadline } from '@dailydotdev/shared/src/components/auth/OnboardingHeadline';
import {
  authGradientBg,
  BottomBannerContainer,
} from '@dailydotdev/shared/src/components/marketing/banners/common';
import {
  AuthPromptHost,
  Rail,
  SourcesProvider,
  SourcesStyles,
  ToastHost,
  useSources,
} from './kit';
import type { SuggestOpen } from './suggest';

// The logged-in (or not) app around /sources at the device's width.
// Laptop: the v2 rail and the floating page card. Tablet: SidebarTablet's
// 64px icon rail. Phone: no rail; the page draws Explore's block and the
// bar (phone.tsx). Toasts drop in at the top on phones and rise from the
// bottom from tablet up.

/** SidebarTablet: the icon rail between phone and laptop, Explore lit. */
const TabletRail = (): ReactElement => {
  const { goTo } = useSources();
  const item = (label: string, path: string, icon: ReactElement) => (
    <button
      type="button"
      aria-label={label}
      onClick={() => goTo(path)}
      className="text-text-tertiary hover:text-text-primary"
    >
      {icon}
    </button>
  );
  return (
    <aside className="fixed left-0 top-0 z-sidebar hidden h-full w-16 flex-col items-center gap-6 border-r border-border-subtlest-tertiary bg-background-default pt-4 tablet:flex laptop:hidden">
      <LogoIcon className={{ container: 'h-6 w-auto' }} />
      {item('Home', '/', <HomeIcon size={IconSize.Medium} />)}
      <span
        aria-current="page"
        className="flex size-10 items-center justify-center rounded-12 bg-surface-float text-text-primary"
      >
        <CompassIcon secondary size={IconSize.Medium} />
      </span>
      {item('Squads', '/squads', <SourceIcon size={IconSize.Medium} />)}
      {item('Activity', '/notifications', <BellIcon size={IconSize.Medium} />)}
    </aside>
  );
};

/**
 * PublicPageSignupBanner on a laptop, signed out: production's container,
 * gradient and headline, with the sign-up buttons drawn (the real form
 * needs the app's auth).
 */
const SignupBanner = (): ReactElement => {
  const { goTo } = useSources();
  return (
    <>
      <div aria-hidden className="hidden h-72 laptop:block" />
      <BottomBannerContainer
        className={`hidden border-t border-accent-cabbage-default py-10 shadow-3 laptop:flex ${authGradientBg}`}
      >
        <div className="flex max-w-[63.75rem] flex-row justify-center gap-10 px-10">
          <div className="flex max-w-full flex-grow basis-0 flex-col gap-4">
            <OnboardingHeadline />
          </div>
          <div className="flex w-[23.25rem] flex-col gap-3">
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              onClick={() => goTo('/onboarding')}
            >
              Continue with Google
            </Button>
            <Button
              type="button"
              variant={ButtonVariant.Float}
              onClick={() => goTo('/onboarding')}
            >
              Continue with GitHub
            </Button>
            <span className="text-center text-text-tertiary typo-callout">
              or sign up with email
            </span>
          </div>
        </div>
      </BottomBannerContainer>
    </>
  );
};

export const AppShell = ({
  loggedIn = true,
  children,
}: {
  loggedIn?: boolean;
  children: ReactNode;
}): ReactElement => (
  <div className="min-h-screen bg-background-default text-text-primary antialiased laptop:bg-[color-mix(in_srgb,var(--theme-surface-secondary)_3%,var(--theme-background-default))]">
    <SourcesStyles />
    <Rail
      loggedIn={loggedIn}
      className="fixed inset-y-0 left-0 z-sidebar hidden laptop:flex"
    />
    <TabletRail />
    <main className="flex flex-col tablet:pl-16 laptop:pl-20">
      <div className="flex min-h-0 flex-1 flex-col laptop:my-3 laptop:ml-1 laptop:mr-3">
        {/* Production's v2 card: a minimum height, clipped, so the window
            scrolls the page. */}
        <div className="relative flex min-h-0 flex-1 flex-col laptop:min-h-[calc(100vh-1.5rem)] laptop:overflow-clip laptop:rounded-24 laptop:border laptop:border-border-subtlest-quaternary laptop:bg-background-default laptop:p-0.5">
          {children}
        </div>
      </div>
    </main>
    {!loggedIn && <SignupBanner />}
    <ToastHost />
    <AuthPromptHost />
  </div>
);

/**
 * One page in one device's shell, with its own follow state. The provider
 * props freeze a starting point for the states catalog.
 */
export const SourcesApp = ({
  loggedIn = true,
  following,
  members,
  toast,
  authPrompt,
  suggestOpen,
  children,
}: {
  loggedIn?: boolean;
  following?: string[];
  members?: string[];
  toast?: { message: string; undo?: boolean };
  authPrompt?: string;
  suggestOpen?: SuggestOpen;
  children: ReactNode;
}): ReactElement => (
  <SourcesProvider
    loggedIn={loggedIn}
    following={following}
    members={members}
    toast={toast}
    authPrompt={authPrompt}
    suggestOpen={suggestOpen}
  >
    <AppShell loggedIn={loggedIn}>{children}</AppShell>
  </SourcesProvider>
);
