import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { BellIcon } from '@dailydotdev/shared/src/components/icons/Bell';
import { HomeIcon } from '@dailydotdev/shared/src/components/icons/Home';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons/Search';
import { SourceIcon } from '@dailydotdev/shared/src/components/icons/Source';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import HeaderLogo from '@dailydotdev/shared/src/components/layout/HeaderLogo';
import HeaderButtons from '@dailydotdev/shared/src/components/layout/HeaderButtons';
import { AiIcon } from '@dailydotdev/shared/src/components/icons/Ai';
import { SidebarDesktop } from '@dailydotdev/shared/src/components/sidebar/SidebarDesktop';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import type { HistoryItem } from './data';
import {
  FolderUpsellHost,
  HistoryProvider,
  HistoryStyles,
  MoveBookmarkHost,
  Rail,
  ToastHost,
} from './kit';

// The logged-in app around /history at every width, drawn from the shell's
// own recipes after the phone shell's step 3 (#6855): the v2 rail and the
// floating page card from laptop, SidebarTablet's rail on tablets, and on
// phones the page block (a back square and the title, 52px), the bottom
// bar on the 16px gutter, and toasts that drop in at the top.

/** The phone block's 38px glass square. */
const ShellSquare = ({
  label,
  children,
  onClick,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
}): ReactElement => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className="shell-material shell-press relative flex size-[2.375rem] shrink-0 items-center justify-center rounded-14 text-text-primary"
  >
    {children}
  </button>
);

/**
 * ShellBlock's page row on a page that is not a tab root: back square and
 * title on one 52px line. History is a page under You on phones.
 */
export const PhoneBlock = ({
  title,
  onBack,
  actions,
}: {
  title: ReactNode;
  onBack?: () => void;
  actions?: ReactNode;
}): ReactElement => (
  <>
    <header className="fixed inset-x-0 top-0 z-header flex h-[3.25rem] items-center gap-2 bg-background-default px-4 tablet:hidden">
      <ShellSquare label="Go back" onClick={onBack}>
        <ArrowIcon size={IconSize.Small} className="-rotate-90" />
      </ShellSquare>
      <h1 className="min-w-0 flex-1 truncate px-1 font-bold typo-callout">
        {title}
      </h1>
      {actions}
    </header>
    <div aria-hidden className="h-[3.25rem] shrink-0 tablet:hidden" />
  </>
);

const clusterTabs = [
  { label: 'Home', Icon: HomeIcon },
  { label: 'Explore', Icon: SearchIcon },
  { label: 'Squads', Icon: SourceIcon },
  { label: 'Activity', Icon: BellIcon },
];

/** The bar's height and its bottom edge (cluster.rest, cluster.floor). */
export const BAR = { height: 56, floor: 8, gap: 8, field: 52 };

/**
 * ShellCluster on a page no tab owns: four tabs, none lit, and the Create
 * square, at rest on the 16px gutter 8px above the bottom.
 */
const PhoneCluster = (): ReactElement => (
  <div
    className="pointer-events-none fixed inset-x-0 z-3 flex items-end gap-2 px-4 tablet:hidden"
    style={{ bottom: BAR.floor }}
  >
    <nav
      aria-label="Main"
      className="shell-material pointer-events-auto flex min-w-0 flex-1 items-stretch rounded-[1.375rem] p-1"
      style={{ height: BAR.height }}
    >
      {clusterTabs.map((tab) => (
        <span
          key={tab.label}
          aria-label={tab.label}
          className="flex min-w-0 flex-1 items-center justify-center text-text-primary opacity-[0.72]"
        >
          <tab.Icon size={IconSize.Large} />
        </span>
      ))}
    </nav>
    <span
      aria-label="Create post"
      className="shell-material shell-material-action pointer-events-auto flex shrink-0 items-center justify-center rounded-[1.375rem] text-text-primary"
      style={{ width: BAR.height, height: BAR.height }}
    >
      <PlusIcon size={IconSize.Large} />
    </span>
  </div>
);

/** Where something floats above the bar: the search field, the capsule. */
export const aboveBar = BAR.floor + BAR.height + BAR.gap;

/** SidebarTablet: the 64px icon rail between phone and laptop. */
const TabletRail = (): ReactElement => (
  <aside className="fixed left-0 top-0 z-sidebar hidden h-full w-16 flex-col items-center gap-6 border-r border-border-subtlest-tertiary bg-background-default pt-4 tablet:flex laptop:hidden">
    <LogoIcon className={{ container: 'h-6 w-auto' }} />
    {[HomeIcon, SearchIcon, SourceIcon, BellIcon].map((Icon, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <span key={index} className="text-text-tertiary">
        <Icon size={IconSize.Medium} />
      </span>
    ))}
  </aside>
);

/** Which laptop navigation production serves: `layout_v2_2` on or off. */
export type Nav = 'new' | 'old';

/**
 * Production's legacy laptop chrome: MainLayoutHeader's 64px header (its
 * logo and buttons; the search trigger drawn, it needs the app's Spotlight)
 * and the real SidebarDesktop with History lit.
 */
const OldLaptopChrome = (): ReactElement => (
  <div className="hidden laptop:block">
    <header className="fixed left-0 top-0 z-header flex h-16 w-full flex-row content-center items-center justify-center gap-3 border-b border-border-subtlest-tertiary bg-background-default px-4 py-3">
      <div>
        <HeaderLogo />
      </div>
      <div className="mx-2 flex min-w-0 flex-1 items-center py-3">
        <span className="relative flex h-12 w-full items-center overflow-hidden rounded-12 border border-transparent bg-background-subtle px-3 py-1 laptop:max-w-[26.25rem]">
          <AiIcon size={IconSize.Large} className="mr-3 text-text-tertiary" />
          <span className="min-w-0 flex-1 text-text-tertiary typo-body">
            Search
          </span>
        </span>
      </div>
      <HeaderButtons />
    </header>
    <SidebarDesktop activePage={`${webappUrl}history`} />
  </div>
);

/**
 * The whole app at the device's width. Laptop: the rail and the floating
 * card the page fills. Tablet: the icon rail. Phone: the bottom bar (the
 * page draws its own block), toasts at the top.
 */
export const AppShell = ({
  children,
  empty,
  transform,
  holdToasts,
  isPlus,
  nav = 'new',
}: {
  children: ReactNode;
  empty?: boolean;
  transform?: (items: HistoryItem[]) => HistoryItem[];
  holdToasts?: boolean;
  /** The reader is a Plus member; free by default, like most readers. */
  isPlus?: boolean;
  /** Laptop only: phones and tablets get the same shell either way. */
  nav?: Nav;
}): ReactElement => (
  <HistoryProvider
    empty={empty}
    transform={transform}
    holdToasts={holdToasts}
    isPlus={isPlus}
  >
    <HistoryStyles />
    <div
      className={classNames(
        'min-h-screen bg-background-default text-text-primary antialiased',
        nav === 'new' &&
          'laptop:bg-[color-mix(in_srgb,var(--theme-surface-secondary)_3%,var(--theme-background-default))]',
      )}
    >
      {nav === 'new' ? (
        <Rail className="fixed inset-y-0 left-0 hidden laptop:flex" />
      ) : (
        <OldLaptopChrome />
      )}
      <TabletRail />
      <main
        className={classNames(
          'flex flex-col tablet:pl-16',
          nav === 'new' ? 'laptop:pl-20' : 'laptop:pl-60 laptop:pt-16',
        )}
      >
        <div
          className={classNames(
            'flex min-h-0 flex-1 flex-col',
            nav === 'new' && 'laptop:my-3 laptop:ml-1 laptop:mr-3',
          )}
        >
          <div
            className={classNames(
              'relative flex min-h-0 flex-1 flex-col',
              // As production's v2 card: a minimum height, clipped without
              // becoming a scroll container, so the window scrolls the page
              // and sticky columns stick to the viewport. --hx-top and
              // --hx-bottom are where the page's frame starts and ends.
              nav === 'new'
                ? 'laptop:min-h-[calc(100vh-1.5rem)] laptop:overflow-clip laptop:rounded-24 laptop:border laptop:border-border-subtlest-quaternary laptop:bg-background-default laptop:p-0.5 laptop:[--hx-bottom:2.4375rem] laptop:[--hx-top:1.9375rem]'
                : 'laptop:min-h-[calc(100vh-4rem)] laptop:[--hx-bottom:1.5rem] laptop:[--hx-top:5rem]',
            )}
          >
            {children}
          </div>
        </div>
      </main>
      <PhoneCluster />
      <ToastHost />
      <MoveBookmarkHost className="fixed inset-0" />
      <FolderUpsellHost className="fixed inset-0" />
    </div>
  </HistoryProvider>
);
