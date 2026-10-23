import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  ArrowIcon,
  BellIcon,
  HomeIcon,
  MiniCloseIcon,
  PlusIcon,
  SearchIcon,
  SourceIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ShellSquare } from '@dailydotdev/shared/src/components/shell/ShellSquare';
import type { RowItem } from '@dailydotdev/shared/src/components/shell/ShellRow';
import { SheetChoice } from '@dailydotdev/shared/src/components/shell/ShellRow';
import { MobileAppFooter } from '@dailydotdev/shared/src/features/getApp/components/MobileAppFooter';
import { useSources } from './kit';

// /sources on a phone, after the phone shell's step 3 (#6855). /sources is
// one of Explore's views, so the block is Explore's root row (title, the
// page's square, the avatar) over its segments with Sources lit, and the
// bar lights Explore. Signed in, search floats above the bar; signed out,
// the "Open daily.dev app" footer takes the bar's place (#6899) and search
// stays in the page (#6941). The hub's own tabs ride on the Sources
// segment, as Happening now's channels ride on its segment: one row, a
// chevron on the lit segment, and a sheet to pick from. Every piece here
// hides from tablet up.

const segments = [
  { label: 'Posts', path: '/posts' },
  { label: 'Tags', path: '/tags' },
  { label: 'Sources', path: '/sources' },
  { label: 'Leaderboard', path: '/users' },
];

/**
 * ShellRow's segment: the lit one a bordered float, the rest quiet. The lit
 * segment that carries a menu is its button, with a chevron (Segments'
 * `menu`), the way Happening now opens its channels.
 */
const Segment = ({
  label,
  active,
  onMenu,
  onClick,
}: {
  label: string;
  active: boolean;
  onMenu?: () => void;
  onClick?: () => void;
}): ReactElement => {
  const className = classNames(
    'flex h-7 shrink-0 items-center gap-1 rounded-8 border px-2 font-bold typo-footnote',
    active
      ? 'border-border-subtlest-secondary bg-surface-float text-text-primary'
      : 'border-transparent text-text-tertiary',
  );
  if (active && onMenu) {
    return (
      <button
        type="button"
        aria-current="page"
        aria-label={`${label}, choose a category`}
        onClick={onMenu}
        className={classNames('shell-press', className)}
      >
        {label}
        <ArrowIcon size={IconSize.XSmall} className="-mr-1 rotate-180" />
      </button>
    );
  }
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={classNames('shell-press', className)}
    >
      {label}
    </button>
  );
};

/**
 * The bottom sheet Happening now opens its channels in: the Drawer's sheet
 * (grabber, title and close square, rows, a rounded top) drawn in the
 * phone, since the real one locks the story's own page.
 */
export const PhoneSheet = ({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}): ReactElement => (
  <div
    role="presentation"
    onClick={(event) => event.target === event.currentTarget && onClose()}
    className="fixed inset-0 z-modal bg-overlay-quaternary-onion tablet:hidden"
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="sx-in absolute bottom-0 flex max-h-[calc(100%-5rem)] w-full flex-col overflow-hidden rounded-t-16 bg-background-default"
    >
      <div aria-hidden className="flex shrink-0 justify-center pb-1 pt-3">
        <span className="h-1 w-9 rounded-2 bg-border-subtlest-secondary" />
      </div>
      <h3 className="flex shrink-0 flex-row items-center gap-2 py-1 pl-4 pr-2 font-bold typo-title3">
        <span className="min-w-0 flex-1 truncate">{title}</span>
        <ShellSquare aria-label="Close" onClick={onClose}>
          <MiniCloseIcon size={IconSize.Small} />
        </ShellSquare>
      </h3>
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto overscroll-contain py-1">
        {children}
      </div>
      <div aria-hidden className="h-3 shrink-0" />
    </div>
  </div>
);

export type { RowItem };
export { SheetChoice };

/** Explore's root row and its segments: one solid block, 52px + 44px. */
const Block = ({
  loggedIn,
  onSourcesMenu,
}: {
  loggedIn: boolean;
  onSourcesMenu: () => void;
}): ReactElement => {
  const { suggest, goTo, openAuth, notify } = useSources();
  return (
    <header className="fixed inset-x-0 top-0 z-header bg-background-default tablet:hidden">
      <div className="flex h-[3.25rem] items-center gap-2 px-4">
        <h1 className="min-w-0 flex-1 truncate font-bold typo-title3">
          Explore
        </h1>
        {/* Signed out on a phone browser: MobileAppActions. */}
        {!loggedIn && (
          <span className="flex flex-row items-center gap-2">
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              onClick={() => openAuth({ view: 'login' })}
            >
              Log in
            </Button>
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              onClick={() => notify('Opens the daily.dev app download page')}
            >
              Open app
            </Button>
          </span>
        )}
        {loggedIn && (
          <>
            <ShellSquare aria-label="Suggest a source" onClick={suggest}>
              <PlusIcon size={IconSize.Small} />
            </ShellSquare>
            <ShellSquare
              aria-label="You"
              className="overflow-hidden"
              onClick={() => goTo('/profile')}
            >
              <img
                alt=""
                src="https://daily-now-res.cloudinary.com/image/upload/f_auto,q_auto/v1/placeholders/1"
                className="size-full object-cover"
              />
            </ShellSquare>
          </>
        )}
      </div>
      <div className="no-scrollbar flex h-11 items-center gap-1 overflow-x-auto px-4">
        {segments.map(({ label, path }) => (
          <Segment
            key={label}
            label={label}
            active={label === 'Sources'}
            onMenu={onSourcesMenu}
            onClick={() => goTo(path)}
          />
        ))}
      </div>
    </header>
  );
};

const BAR = { height: 56, floor: 8, gap: 8, field: 52 };

const clusterTabs = [
  { label: 'Home', Icon: HomeIcon, path: '/' },
  { label: 'Explore', Icon: SearchIcon, path: '/posts', lit: true },
  { label: 'Squads', Icon: SourceIcon, path: '/squads' },
  { label: 'Activity', Icon: BellIcon, path: '/notifications' },
];

/** ShellCluster with Explore lit, and the Create square. */
const Cluster = (): ReactElement => {
  const { goTo } = useSources();
  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-3 flex items-end gap-2 px-4 tablet:hidden"
      style={{ bottom: BAR.floor }}
    >
      <nav
        aria-label="Main"
        className="shell-material shell-material-action pointer-events-auto relative flex min-w-0 flex-1 items-stretch rounded-[1.375rem] p-1"
        style={{ height: BAR.height }}
      >
        {clusterTabs.map((tab) => (
          <button
            type="button"
            key={tab.label}
            aria-label={tab.label}
            aria-current={tab.lit ? 'page' : undefined}
            onClick={() => !tab.lit && goTo(tab.path)}
            className={classNames(
              'flex min-w-0 flex-1 items-center justify-center rounded-[1.125rem]',
              tab.lit
                ? 'bg-surface-hover text-text-primary'
                : 'text-text-secondary',
            )}
          >
            <tab.Icon size={IconSize.Large} secondary={tab.lit} />
          </button>
        ))}
      </nav>
      <button
        type="button"
        aria-label="Create post"
        onClick={() => goTo('/squads/create')}
        className="shell-material shell-material-action shell-press pointer-events-auto flex shrink-0 items-center justify-center rounded-[1.375rem] text-text-primary"
        style={{ width: BAR.height, height: BAR.height }}
      >
        <PlusIcon size={IconSize.Large} />
      </button>
    </div>
  );
};

/** ShellField: the search that floats one gap above the bar. */
const FloatingSearch = ({ onOpen }: { onOpen: () => void }): ReactElement => (
  <button
    type="button"
    onClick={onOpen}
    className="shell-material shell-material-action shell-press fixed inset-x-4 z-3 flex items-center gap-2 rounded-[1.375rem] px-4 text-text-tertiary tablet:hidden"
    style={{
      bottom: BAR.floor + BAR.height + BAR.gap,
      height: BAR.field,
    }}
  >
    <SearchIcon size={IconSize.Small} />
    <span className="typo-body">Search sources</span>
  </button>
);

/**
 * The phone's chrome around a /sources view: the block on top, and at the
 * bottom the field and the bar, or the app footer when signed out.
 */
export const PhoneChrome = ({
  loggedIn,
  onSearch,
  onSourcesMenu,
  top,
}: {
  loggedIn: boolean;
  onSearch: () => void;
  onSourcesMenu: () => void;
  /** A page under /sources brings its own row in place of Explore's block. */
  top?: ReactNode;
}): ReactElement => (
  <>
    {top ?? (
      <>
        <Block loggedIn={loggedIn} onSourcesMenu={onSourcesMenu} />
        <div aria-hidden className="h-[6rem] tablet:hidden" />
      </>
    )}
    {loggedIn ? (
      <>
        <div aria-hidden className="shell-scrim tablet:hidden" />
        <FloatingSearch onOpen={onSearch} />
        <Cluster />
      </>
    ) : (
      <div className="fixed inset-x-0 bottom-0 z-3 tablet:hidden">
        <MobileAppFooter title="See all sources" />
      </div>
    )}
  </>
);

/** Room under the content for what floats at the bottom of a phone. */
export const PhoneBottomSpace = ({
  loggedIn,
}: {
  loggedIn: boolean;
}): ReactElement => (
  <div
    aria-hidden
    className="tablet:hidden"
    style={{
      height: loggedIn
        ? BAR.floor + BAR.height + BAR.gap + BAR.field + 16
        : 200,
    }}
  />
);
