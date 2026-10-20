import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  AiIcon,
  BellIcon,
  CompassIcon,
  GiftIcon,
  GitHubIcon,
  GoogleIcon,
  HelpIcon,
  HomeIcon,
  HotIcon,
  MegaphoneIcon,
  PhoneIcon,
  SearchIcon,
  SourceIcon,
  SquadIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import Logo, { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
import {
  railGlyphBoxClass,
  railTabClass,
} from '@dailydotdev/shared/src/components/sidebar/common';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import { OnboardingHeadline } from '@dailydotdev/shared/src/components/auth/OnboardingHeadline';
import { AuthPromptHost, authLines } from './auth';
import type { AuthPrompt } from './auth';
import {
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

/* ------------------------------------------------------- signed out */

// Signed out, production's laptop is not the v2 card: the v2 rail stays,
// collapsed to 64px with no labels, but the v1 header sits over it and the
// page runs straight in <main> (MainLayout's sidebarOwnsHeader needs a
// user). Tablet keeps SidebarTablet and the FeedNav chips instead of the
// header. Phones are drawn by the page (phone.tsx).

const signedOutRailButton =
  'flex size-10 items-center justify-center rounded-12 text-text-tertiary hover:bg-surface-hover hover:text-text-primary';

/** SidebarDesktopV2, signed out: Explore, Squads, Streak; Invite, Support. */
const SignedOutRail = (): ReactElement => {
  const { goTo } = useSources();
  const tab = (
    label: string,
    path: string,
    icon: ReactElement,
    active = false,
  ) => (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      onClick={() => !active && goTo(path)}
      className={classNames(
        railTabClass,
        active && '!text-text-primary bg-background-default',
      )}
    >
      <span className={railGlyphBoxClass}>{icon}</span>
    </button>
  );
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-y-0 left-0 z-sidebar hidden h-dvh w-16 flex-col items-center gap-0.5 bg-[color-mix(in_srgb,var(--theme-surface-secondary)_3%,var(--theme-background-default))] px-1.5 pb-3 pt-[0.8125rem] laptop:flex"
    >
      <span className="mt-2.5 flex size-10 items-center justify-center rounded-12 text-text-primary">
        <LogoIcon className={{ container: 'h-[1.125rem] w-auto' }} />
      </span>
      <button
        type="button"
        aria-label="Home"
        onClick={() => goTo('/')}
        className={signedOutRailButton}
      >
        <HomeIcon size={IconSize.Small} />
      </button>
      <button
        type="button"
        aria-label="Search"
        onClick={() => goTo('/search')}
        className={signedOutRailButton}
      >
        <SearchIcon size={IconSize.Small} />
      </button>
      <span className="my-1 h-px w-6 bg-border-subtlest-quaternary" />
      {tab(
        'Explore',
        '/posts',
        <CompassIcon secondary size={IconSize.Small} className="scale-105" />,
        true,
      )}
      {tab('Squads', '/squads', <SquadIcon size={IconSize.Small} />)}
      {tab('Current Streak', '/streak', <HotIcon size={IconSize.Small} />)}
      <span className="mt-auto" />
      <button
        type="button"
        aria-label="Invite friends"
        onClick={() => goTo('/settings/invite')}
        className={signedOutRailButton}
      >
        <GiftIcon size={IconSize.Small} />
      </button>
      <button
        type="button"
        aria-label="Support"
        onClick={() => goTo('/support')}
        className={signedOutRailButton}
      >
        <HelpIcon size={IconSize.Small} />
      </button>
    </nav>
  );
};

/** MainLayoutHeader, signed out on a laptop: logo, search, the app, Log in. */
const SignedOutHeader = (): ReactElement => {
  const { goTo, openAuth } = useSources();
  return (
    <header className="fixed left-0 top-0 z-header hidden h-16 w-full flex-row content-center items-center justify-center gap-3 border-b border-border-subtlest-tertiary bg-background-default px-4 py-3 laptop:flex">
      <Logo
        position={LogoPosition.Initial}
        onLogoClick={(event: React.MouseEvent) => {
          event.preventDefault();
          goTo('/');
        }}
      />
      <div className="mx-2 flex min-w-0 flex-1 py-3">
        <button
          type="button"
          onClick={() => goTo('/search')}
          className="relative flex h-12 w-full max-w-[26.25rem] items-center gap-2 rounded-12 bg-background-subtle px-3 py-1 text-text-tertiary"
        >
          <AiIcon size={IconSize.Large} />
          <span className="flex-1 text-left typo-callout">Search</span>
          <span className="text-text-quaternary typo-footnote">⌘K</span>
        </button>
      </div>
      <div className="ml-auto flex justify-end gap-3">
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Medium}
          icon={<PhoneIcon />}
          onClick={() => goTo('/download')}
        >
          Get the app
        </Button>
        <span className="flex flex-row gap-4">
          <Button
            type="button"
            variant={ButtonVariant.Secondary}
            onClick={() => openAuth({ view: 'login' })}
          >
            Log in
          </Button>
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            onClick={() =>
              openAuth({ view: 'signup', line: authLines.mainButton })
            }
          >
            Sign up
          </Button>
        </span>
      </div>
    </header>
  );
};

/** SidebarTablet, signed out: Home lit (/sources counts as home). */
const SignedOutTabletRail = (): ReactElement => {
  const { goTo } = useSources();
  const item = (
    label: string,
    path: string,
    icon: ReactElement,
    active = false,
  ) => (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={() => !active && goTo(path)}
      className={classNames(
        'flex flex-col items-center gap-1 rounded-12 px-1 py-1.5 typo-caption1',
        active
          ? 'text-text-primary'
          : 'text-text-tertiary hover:text-text-primary',
      )}
    >
      <span
        className={classNames(
          'flex size-10 items-center justify-center rounded-12',
          active && 'bg-surface-float',
        )}
      >
        {icon}
      </span>
      {label}
    </button>
  );
  return (
    <aside className="fixed left-0 top-0 z-sidebar hidden h-full w-16 flex-col items-center gap-4 border-r border-border-subtlest-tertiary bg-background-default tablet:flex laptop:hidden">
      <span className="flex h-10 items-center pt-4">
        <LogoIcon className={{ container: 'h-6 w-auto' }} />
      </span>
      {item('Home', '/', <HomeIcon secondary size={IconSize.Medium} />, true)}
      {item('Explore', '/posts', <AiIcon size={IconSize.Medium} />)}
      {item(
        'Headlines',
        '/highlights',
        <MegaphoneIcon size={IconSize.Medium} />,
      )}
      {item('Activity', '/notifications', <BellIcon size={IconSize.Medium} />)}
      {item(
        'Squads',
        '/squads/discover',
        <SourceIcon size={IconSize.Medium} />,
      )}
    </aside>
  );
};

const feedChips = [
  { label: 'Popular', path: '/popular' },
  { label: 'Tags', path: '/tags' },
  { label: 'Sources', path: '/sources' },
  { label: 'Leaderboard', path: '/users' },
  { label: 'Squads', path: '/squads' },
];

/** FeedNav's chips on a tablet, signed out, Sources lit, and the bell. */
const SignedOutFeedNav = (): ReactElement => {
  const { goTo } = useSources();
  const chip = (label: string, path: string) => {
    const active = label === 'Sources';
    return (
      <button
        key={label}
        type="button"
        aria-current={active ? 'page' : undefined}
        onClick={() => !active && goTo(path)}
        className={classNames(
          'shell-press shrink-0 rounded-10 border px-2.5 py-1.5 font-bold typo-callout',
          active
            ? 'border-border-subtlest-tertiary bg-surface-float text-text-primary'
            : 'border-transparent text-text-tertiary',
        )}
      >
        {label}
      </button>
    );
  };
  return (
    <div className="sticky top-0 z-header hidden w-full bg-background-default tablet:block laptop:hidden">
      <div className="flex h-12 w-full items-stretch border-b border-border-subtlest-tertiary">
        <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-4">
          {chip('Home', '/')}
          <span className="mx-1 h-4 w-px shrink-0 bg-border-subtlest-tertiary" />
          {feedChips.map(({ label, path }) => chip(label, path))}
        </div>
        <div className="flex shrink-0 items-center py-2 pl-2 pr-4">
          <Button
            type="button"
            aria-label="Notifications"
            variant={ButtonVariant.Option}
            icon={<BellIcon />}
            onClick={() => goTo('/notifications')}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * AuthenticationBanner's split layout, laptop only: the gradient, the
 * headline, Google and GitHub, "Continue with email" and "Log in".
 */
const SignupBanner = (): ReactElement => {
  const { goTo, openAuth } = useSources();
  return (
    <>
      <div aria-hidden className="hidden h-72 laptop:block" />
      <div className="fixed bottom-0 left-0 z-modal hidden w-full flex-row justify-center border-t border-accent-cabbage-default bg-background-default bg-gradient-to-l from-theme-overlay-active-cabbage from-0% to-theme-overlay-active-onion to-100% py-10 shadow-3 laptop:flex">
        <div className="flex max-w-[63.75rem] flex-row justify-center gap-10 px-10">
          <div className="flex max-w-full flex-grow basis-0 flex-col gap-4">
            <OnboardingHeadline />
          </div>
          <div className="flex w-[23.25rem] flex-col">
            <ul className="flex flex-col gap-4">
              <li>
                <Button
                  type="button"
                  variant={ButtonVariant.Primary}
                  size={ButtonSize.Large}
                  className="w-full"
                  icon={<GoogleIcon secondary size={IconSize.XSmall} />}
                  onClick={() => goTo('/onboarding')}
                >
                  Continue with Google
                </Button>
              </li>
              <li>
                <Button
                  type="button"
                  variant={ButtonVariant.Float}
                  size={ButtonSize.Large}
                  className="w-full !text-text-primary"
                  icon={<GitHubIcon size={IconSize.XSmall} />}
                  onClick={() => goTo('/onboarding')}
                >
                  Continue with GitHub
                </Button>
              </li>
            </ul>
            <button
              type="button"
              onClick={() => openAuth({ view: 'signup' })}
              className="mx-auto flex min-h-12 items-center justify-center px-3 text-text-tertiary underline underline-offset-4 typo-callout"
            >
              Continue with email
            </button>
            <p className="mx-auto mt-1 justify-center text-center text-text-tertiary typo-callout laptop:mt-2">
              Already have an account?{' '}
              <button
                type="button"
                className="!text-text-primary"
                onClick={() => openAuth({ view: 'login' })}
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export const AppShell = ({
  loggedIn = true,
  children,
}: {
  loggedIn?: boolean;
  children: ReactNode;
}): ReactElement =>
  loggedIn ? (
    <div className="min-h-screen bg-background-default text-text-primary antialiased laptop:bg-[color-mix(in_srgb,var(--theme-surface-secondary)_3%,var(--theme-background-default))]">
      <SourcesStyles />
      <Rail className="fixed inset-y-0 left-0 z-sidebar hidden laptop:flex" />
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
      <ToastHost />
      <AuthPromptHost />
    </div>
  ) : (
    <div className="min-h-screen bg-background-default text-text-primary antialiased [--sx-sticky-top:0rem] tablet:[--sx-sticky-top:3rem] laptop:[--sx-sticky-top:4rem]">
      <SourcesStyles />
      <SignedOutRail />
      <SignedOutHeader />
      <SignedOutTabletRail />
      <main className="flex flex-col tablet:pl-16 laptop:pt-16">
        <SignedOutFeedNav />
        {children}
      </main>
      <SignupBanner />
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
  authPrompt?: AuthPrompt;
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
