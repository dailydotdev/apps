import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  AiIcon,
  AppIcon,
  BellIcon,
  BookmarkIcon,
  DevPlusIcon,
  EarthIcon,
  EyeIcon,
  HashtagIcon,
  SidebarArrowRight,
  CompassIcon,
  GitHubIcon,
  GoogleIcon,
  HomeIcon,
  MegaphoneIcon,
  PhoneIcon,
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
  authGradientBg,
  BottomBannerContainer,
} from '@dailydotdev/shared/src/components/marketing/banners/common';
import { authBannerHeadlineClassName } from '@dailydotdev/shared/src/components/auth/AuthenticationBanner';
import { KeyboadShortcutLabel } from '@dailydotdev/shared/src/components/KeyboardShortcutLabel';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import {
  cloudinaryAuthBannerBackground,
  cloudinaryAuthBannerBackground1440w,
  cloudinaryAuthBannerBackground1920w,
} from '@dailydotdev/shared/src/lib/image';
import { MedalIcon } from '@dailydotdev/shared/src/components/icons/Medal';
import { BookmarkReminderIcon } from '@dailydotdev/shared/src/components/icons/Bookmark/Reminder';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import { OnboardingHeadline } from '@dailydotdev/shared/src/components/auth/OnboardingHeadline';
import { AuthPromptHost } from './auth';
import type { AuthPrompt } from './authLines';
import { authLines } from './authLines';
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
// bar (phone.tsx). Toasts drop in at the top on every device, as
// production's do. Signed out, each width gets what production serves
// visitors instead (see "signed out" below).

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

/**
 * SidebarDesktop (v1), collapsed, signed out: production still serves the
 * legacy 44px sidebar to visitors. The toggle, then MainSection (Home, Get
 * Plus, Following, History, Happening Now, Marketplace), Find Squads, the
 * saves, and Discover with Sources lit.
 */
const SignedOutRail = (): ReactElement => {
  const { goTo, openAuth } = useSources();
  const item = (
    label: string,
    icon: ReactElement,
    action: () => void,
    active = false,
  ) => (
    <li key={label} className="flex items-center justify-center">
      <button
        type="button"
        aria-label={label}
        title={label}
        aria-current={active ? 'page' : undefined}
        onClick={active ? undefined : action}
        className={classNames(
          'flex size-9 items-center justify-center rounded-10 transition-colors',
          active
            ? 'bg-surface-float text-text-primary'
            : 'text-text-tertiary hover:bg-surface-hover hover:text-text-primary',
        )}
      >
        {icon}
      </button>
    </li>
  );
  const signUp = () => openAuth({ view: 'signup' });
  const divider = (key: string) => (
    <li
      key={key}
      aria-hidden
      className="mx-2 my-2 h-px bg-border-subtlest-tertiary"
    />
  );
  const icon = (Icon: typeof HomeIcon, active = false) => (
    <Icon secondary={active} className="pointer-events-none h-5 w-5" />
  );
  return (
    <aside className="fixed left-0 top-0 z-sidebar hidden h-full w-11 flex-col border-r border-border-subtlest-tertiary bg-background-default pt-16 laptop:flex">
      <nav className="no-scrollbar flex flex-col overflow-y-auto pb-3 pt-1">
        <div className="flex h-9 items-center justify-center px-1">
          <Button
            type="button"
            aria-label="Expand sidebar"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.XSmall}
            className="text-text-tertiary hover:text-text-primary"
            icon={<SidebarArrowRight size={IconSize.Size16} />}
          />
        </div>
        <ul className="flex flex-col gap-1">
          {item('Home', icon(HomeIcon), () => goTo('/'))}
          {item(
            'Get Plus',
            <DevPlusIcon className="pointer-events-none h-5 w-5 text-action-plus-default" />,
            signUp,
          )}
          {item('Following', icon(SquadIcon), signUp)}
          {item('History', icon(EyeIcon), signUp)}
          {item('Happening Now', icon(MegaphoneIcon), signUp)}
          {item('Marketplace', icon(AppIcon), () => goTo('/marketplace'))}
          {divider('network')}
          {item('Find Squads', icon(SourceIcon), () =>
            goTo('/squads/discover'),
          )}
          {divider('saved')}
          {item('Quick saves', icon(BookmarkIcon), signUp)}
          {item('Read it later', icon(BookmarkReminderIcon), signUp)}
          {divider('discover')}
          {item('Explore', icon(CompassIcon), () => goTo('/posts'))}
          {item('Tags', icon(HashtagIcon), () => goTo('/tags'))}
          {item('Sources', icon(EarthIcon, true), () => undefined, true)}
          {item('Leaderboard', icon(MedalIcon), () => goTo('/users'))}
        </ul>
      </nav>
    </aside>
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
          aria-label="Open search"
          onClick={() => goTo('/search')}
          className="relative flex h-12 w-full max-w-[26.25rem] items-center overflow-hidden rounded-12 border border-transparent bg-background-subtle px-3 py-1 text-left transition-colors hover:bg-surface-hover"
        >
          <AiIcon size={IconSize.Large} className="mr-3 text-text-tertiary" />
          <span className="min-w-0 flex-1 text-text-tertiary typo-body">
            Search
          </span>
          <div className="z-1 flex items-center gap-3">
            <KeyboadShortcutLabel keys={['⌘', 'K']} />
          </div>
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

/**
 * CustomAuthBanner: tablet only, signed out. The gradient strip with Log in
 * and Sign up that the source page, the featured Squads and posts carry,
 * pinned to the top over everything.
 */
const TabletAuthBanner = (): ReactElement => {
  const { openAuth } = useSources();
  return (
    <span
      className={classNames(
        authGradientBg,
        'left-0 top-0 hidden w-full flex-row justify-center gap-2 border-b border-accent-cabbage-default px-4 py-2 tablet:sticky tablet:z-max tablet:flex laptop:hidden',
      )}
    >
      <Button
        type="button"
        variant={ButtonVariant.Secondary}
        className="flex-1 tablet:max-w-[9rem]"
        onClick={() => openAuth({ view: 'login' })}
      >
        Log in
      </Button>
      <Button
        type="button"
        variant={ButtonVariant.Primary}
        className="flex-1 tablet:max-w-[9rem]"
        onClick={() => openAuth({ view: 'signup', line: authLines.mainButton })}
      >
        Sign up
      </Button>
    </span>
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
    <div className="sticky top-14 z-header hidden w-full bg-background-default tablet:block laptop:hidden">
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

// GeoPersonalizedBanner names the visitor's country; the story shows the
// one the team sees.
const BANNER_COUNTRY = 'Israel';

/**
 * PublicPageSignupBanner, laptop only: AuthenticationBanner's column layout
 * with GeoPersonalizedBanner's headline, Google and GitHub side by side and
 * the inline footer, as production serves it.
 */
const SignupBanner = (): ReactElement => {
  const { goTo, openAuth } = useSources();
  return (
    <>
      <div aria-hidden className="hidden h-72 laptop:block" />
      <BottomBannerContainer
        className={classNames(
          'hidden min-h-[17.75rem] items-center border-t border-accent-cabbage-default px-10 py-4 pe-[388px] shadow-3 laptop:flex laptopXL:pe-10',
          authGradientBg,
        )}
      >
        <Image
          className="absolute left-0 top-0 -z-1 h-full w-full"
          src={cloudinaryAuthBannerBackground}
          srcSet={`${cloudinaryAuthBannerBackground1440w} 1440w, ${cloudinaryAuthBannerBackground1920w} 1920w, ${cloudinaryAuthBannerBackground} 2880w`}
          sizes="(max-width: 1440px) 100vw, (max-width: 1920px) 1920px, 100vw"
        />
        <div className="flex w-full max-w-3xl flex-col items-start text-start laptopXL:items-center laptopXL:text-center">
          <OnboardingHeadline
            className={authBannerHeadlineClassName}
            title={`daily.dev is the fastest growing developer platform in ${BANNER_COUNTRY}!`}
            description="We know how hard it is to be a developer. It doesn't have to be. Personalized news feed, dev community and search, much better than what's out there. Maybe ;)"
          />
          <div className="mt-4 flex w-full max-w-[32rem] flex-col gap-4">
            <div className="flex flex-row gap-4">
              <Button
                type="button"
                variant={ButtonVariant.Primary}
                size={ButtonSize.Large}
                className="flex-1"
                icon={<GoogleIcon secondary className="socialIcon" />}
                onClick={() => goTo('/onboarding')}
              >
                Continue with Google
              </Button>
              <Button
                type="button"
                variant={ButtonVariant.Float}
                size={ButtonSize.Large}
                className="flex-1 !text-text-primary"
                icon={<GitHubIcon className="socialIcon" />}
                onClick={() => goTo('/onboarding')}
              >
                Continue with GitHub
              </Button>
            </div>
            <p className="text-text-tertiary typo-callout laptopXL:text-center">
              <button
                type="button"
                className="underline underline-offset-4"
                onClick={() => openAuth({ view: 'signup' })}
              >
                Continue with email
              </button>
              {' · '}Already have an account?{' '}
              <button
                type="button"
                className="text-text-primary underline underline-offset-4"
                onClick={() => openAuth({ view: 'login' })}
              >
                Log in
              </button>
            </p>
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
    <div className="min-h-screen bg-background-default text-text-primary antialiased [--sx-sticky-top:0rem] tablet:[--sx-sticky-top:6.5rem] laptop:[--sx-sticky-top:4rem]">
      <SourcesStyles />
      <TabletAuthBanner />
      <SignedOutRail />
      <SignedOutHeader />
      <SignedOutTabletRail />
      <main className="flex flex-col tablet:pl-16 laptop:pl-11 laptop:pt-16">
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
