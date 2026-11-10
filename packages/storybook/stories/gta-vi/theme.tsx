import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  ArrowIcon,
  BellIcon,
  BookmarkIcon,
  FilterIcon,
  HomeIcon,
  MoonIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  SquadIcon,
  SunIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { ReadingStreakIcon } from '@dailydotdev/shared/src/components/icons/ReadingStreak';
import { ThemeAutoIcon } from '@dailydotdev/shared/src/components/icons/ThemeAuto';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import { cardHandlers } from '../features/feed/feedHero.mocks';
import { realPosts } from '../hero-cover/realData';
import { rw, WidgetRail } from '../hero-cover/widgets/rail';
import { myShortcuts } from '../hero-cover/widgets/shortcuts';
import coverArt from './assets/theme-vice-city-cover.webp';

/*
 * The Vice City theme: the home page's top wears the release art behind the
 * shortcuts and the greeting. It's never applied for the reader: they turn
 * it on from a one-time nudge on the home page or from Appearance, and turn
 * it off from either. The page around it is the Hero Cover home
 * (stories/hero-cover), drawn here at two widths.
 */

export type HomeCover = 'none' | 'viceCity';

const sideIcons = [
  HomeIcon,
  SearchIcon,
  ReadingStreakIcon,
  BellIcon,
  SquadIcon,
  BookmarkIcon,
];

const SideRail = (): ReactElement => (
  <aside className="relative z-1 flex w-16 shrink-0 flex-col items-center gap-2 border-r border-border-subtlest-tertiary bg-background-default py-4">
    <span className="mb-2 flex size-9 items-center justify-center rounded-12 bg-text-primary font-bold text-surface-invert typo-callout">
      d
    </span>
    {sideIcons.map((Icon, index) => (
      <span
        key={Icon.name || index}
        className={classNames(
          'flex size-10 items-center justify-center rounded-12 text-text-tertiary',
          index === 0 && 'bg-surface-float text-text-primary',
        )}
      >
        <Icon size={IconSize.Small} />
      </span>
    ))}
  </aside>
);

/** The shortcuts row on top of the home page, over the art when themed. */
const Shortcuts = ({
  isThemed,
  count,
}: {
  isThemed: boolean;
  count: number;
}): ReactElement => (
  <div className="flex justify-center gap-5">
    {myShortcuts.slice(0, count).map((shortcut) => (
      <span
        key={shortcut.url}
        className="flex w-16 flex-col items-center gap-1"
      >
        <span
          className={classNames(
            'flex size-12 items-center justify-center rounded-full',
            isThemed
              ? 'bg-overlay-primary-pepper backdrop-blur-sm'
              : 'bg-surface-float',
          )}
        >
          <img src={shortcut.iconUrl} alt="" className="size-6 rounded-6" />
        </span>
        <span
          className={classNames(
            'w-full truncate text-center typo-caption1',
            isThemed ? 'text-white' : 'text-text-tertiary',
          )}
        >
          {shortcut.name}
        </span>
      </span>
    ))}
  </div>
);

/** The art, fading into the page so the greeting under it stays legible. */
const CoverArt = ({ isPhone }: { isPhone?: boolean }): ReactElement => (
  <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0">
    <img
      src={coverArt}
      alt=""
      className={classNames(
        'w-full object-cover',
        isPhone ? 'h-56 object-[70%_60%]' : 'h-64 object-[center_65%]',
      )}
    />
    <span className="absolute inset-0 bg-gradient-to-b from-transparent from-40% to-background-default" />
  </div>
);

/** The one-time nudge: the art as a thumbnail, Try it, and a dismiss. */
export const ThemeNudge = ({
  onApply,
  onDismiss,
  isCompact,
}: {
  onApply?: () => void;
  onDismiss?: () => void;
  isCompact?: boolean;
}): ReactElement => (
  <div className="flex items-center gap-2 rounded-14 border border-border-subtlest-tertiary bg-background-subtle p-1 pr-1.5">
    <img
      src={coverArt}
      alt=""
      className="h-8 w-14 shrink-0 rounded-10 object-cover object-[75%_60%]"
    />
    <span className="min-w-0 flex-1 truncate font-bold text-text-primary typo-footnote">
      {isCompact ? 'Vice City theme' : 'GTA VI is out: try the Vice City theme'}
    </span>
    <Button
      variant={ButtonVariant.Primary}
      size={ButtonSize.XSmall}
      onClick={onApply}
    >
      Try it
    </Button>
    <CloseButton size={ButtonSize.XSmall} onClick={onDismiss} />
  </div>
);

const Toast = ({
  children,
  onUndo,
}: {
  children: ReactNode;
  onUndo: () => void;
}): ReactElement => (
  <div className="absolute bottom-6 left-1/2 z-3 flex w-max -translate-x-1/2 items-center gap-3 rounded-12 bg-text-primary py-2 pl-4 pr-2 text-surface-invert shadow-2 typo-callout">
    {children}
    <button
      type="button"
      onClick={onUndo}
      className="rounded-8 px-2 py-1 font-bold hover:bg-surface-hover"
    >
      Undo
    </button>
  </div>
);

const greeting = 'Good afternoon, TheCoverLiker';

const tabs = ['For you', 'AI', 'Career', 'Architecture', 'My new feed'];

/**
 * The home page at one width. Interactive: Try it applies the cover, the
 * chip on the cover takes it off, and each shows a toast with Undo.
 */
export const ThemedHome = ({
  initialCover = 'none',
  hasNudge = true,
  isPhone = false,
  width = 1440,
  height = 900,
  columns = 4,
}: {
  initialCover?: HomeCover;
  /** Launch week, and the reader hasn't tried or dismissed it yet. */
  hasNudge?: boolean;
  isPhone?: boolean;
  width?: number;
  height?: number;
  columns?: number;
}): ReactElement => {
  const [cover, setCover] = useState<HomeCover>(initialCover);
  const [isNudgeOpen, setIsNudgeOpen] = useState(hasNudge);
  const [toast, setToast] = useState<HomeCover | null>(null);
  const isThemed = cover === 'viceCity';
  const scale = Math.min(1, 1380 / width);
  const pad = isPhone ? 'px-4' : 'px-6';

  const apply = (next: HomeCover) => {
    setCover(next);
    setIsNudgeOpen(false);
    setToast(next);
  };

  return (
    <div
      className="shrink-0 overflow-hidden rounded-24 border border-border-subtlest-quaternary"
      style={{ width: width * scale, height: height * scale }}
    >
      <div
        className="relative flex bg-background-default"
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
        }}
      >
        {!isPhone && <SideRail />}
        <div className="no-scrollbar relative min-w-0 flex-1 overflow-y-auto">
          {isThemed && <CoverArt isPhone={isPhone} />}
          <div className={classNames('relative flex flex-col gap-4', pad)}>
            <div className="relative flex min-h-12 items-start pt-4">
              {!isPhone && (
                <div className="flex-1">
                  <Shortcuts isThemed={isThemed} count={7} />
                </div>
              )}
              {isPhone && <span className="flex-1" />}
              {isThemed && (
                <Button
                  variant={ButtonVariant.Float}
                  size={ButtonSize.XSmall}
                  className={classNames(
                    'bg-overlay-primary-pepper !text-white backdrop-blur-sm',
                    !isPhone && 'absolute right-0 top-4',
                  )}
                  onClick={() => apply('none')}
                  title="Turn off the Vice City theme"
                >
                  Vice City
                </Button>
              )}
            </div>

            <header
              className={classNames(
                'flex items-center gap-2',
                isPhone ? 'mt-16' : 'mt-6',
              )}
            >
              <div className="flex min-w-0 flex-1 flex-col">
                <span
                  className={classNames(
                    'truncate font-bold text-text-primary',
                    isPhone ? 'typo-title3' : 'typo-title2',
                  )}
                >
                  {greeting}
                </span>
                <span className="truncate text-text-tertiary typo-footnote">
                  Thursday, November 19 · 12 new since yesterday
                </span>
              </div>
              {isNudgeOpen && !isThemed && !isPhone && (
                <div className="w-[25rem]">
                  <ThemeNudge
                    onApply={() => apply('viceCity')}
                    onDismiss={() => setIsNudgeOpen(false)}
                  />
                </div>
              )}
              {!isPhone && (
                <>
                  <Button
                    variant={ButtonVariant.Primary}
                    size={ButtonSize.Small}
                    icon={<PlusIcon />}
                  >
                    New post
                  </Button>
                  <Button
                    variant={ButtonVariant.Tertiary}
                    size={ButtonSize.Small}
                    icon={<SettingsIcon />}
                    aria-label="Customize widgets"
                  />
                  {([-1, 1] as const).map((direction) => (
                    <Button
                      key={direction}
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.Small}
                      icon={
                        <ArrowIcon
                          className={
                            direction === -1 ? '-rotate-90' : 'rotate-90'
                          }
                        />
                      }
                      aria-label={direction === -1 ? 'Previous' : 'Next'}
                    />
                  ))}
                </>
              )}
            </header>
            {isNudgeOpen && !isThemed && isPhone && (
              <ThemeNudge
                isCompact
                onApply={() => apply('viceCity')}
                onDismiss={() => setIsNudgeOpen(false)}
              />
            )}

            <WidgetRail
              initialWidgets={[
                rw('featured', isPhone ? 'm' : 'l'),
                rw('happening', 'm'),
                rw('streak', 's'),
                rw('notifications', 's'),
                rw('shortcuts', 's'),
              ]}
              columns={columns}
              isPhone={isPhone}
              showAdSlot={false}
              cellHeight={isPhone ? '11.25rem' : '12.5rem'}
              header="none"
            />
          </div>

          <div
            className={classNames(
              'mt-4 flex items-center gap-2 border-b border-border-subtlest-tertiary py-2',
              pad,
            )}
          >
            <nav className="no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto">
              {tabs.map((tab, index) => (
                <span
                  key={tab}
                  className={classNames(
                    'flex h-8 shrink-0 items-center rounded-10 px-3 font-bold typo-callout',
                    index === 0
                      ? 'bg-surface-float text-text-primary'
                      : 'text-text-tertiary',
                  )}
                >
                  {tab}
                </span>
              ))}
            </nav>
            {!isPhone && (
              <Button
                variant={ButtonVariant.Float}
                size={ButtonSize.Small}
                icon={<FilterIcon />}
              >
                Feed settings
              </Button>
            )}
          </div>
          <div
            className={classNames('grid gap-8 pb-6 pt-3', pad)}
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {realPosts.slice(10, 10 + columns * 2).map((post) => (
              <ArticleGrid key={post.id} post={post} {...cardHandlers} />
            ))}
          </div>
        </div>

        {toast && (
          <Toast
            onUndo={() => {
              setCover(toast === 'viceCity' ? 'none' : 'viceCity');
              setToast(null);
            }}
          >
            {toast === 'viceCity'
              ? 'Vice City theme on'
              : 'Vice City theme off'}
          </Toast>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------ Appearance */

const themeIcons = [MoonIcon, SunIcon, ThemeAutoIcon];

const CoverOption = ({
  label,
  isSelected,
  onClick,
  children,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  children: ReactNode;
}): ReactElement => (
  <button
    type="button"
    aria-pressed={isSelected}
    onClick={onClick}
    className="flex flex-1 flex-col gap-2 text-left"
  >
    <span
      className={classNames(
        'relative flex h-20 w-full overflow-hidden rounded-12 border',
        isSelected
          ? 'border-text-primary ring-1 ring-text-primary'
          : 'border-border-subtlest-tertiary',
      )}
    >
      {children}
      {isSelected && (
        <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-text-primary text-surface-invert">
          <VIcon size={IconSize.Size16} />
        </span>
      )}
    </span>
    <span className="font-bold text-text-primary typo-footnote">{label}</span>
  </button>
);

/**
 * Settings › Appearance: production's Theme row, then a Home cover row with
 * the art. It stays listed after launch week, so a reader who missed the
 * nudge can still find it; nothing turns it on for them.
 */
export const AppearanceCover = ({
  initialCover = 'none',
}: {
  initialCover?: HomeCover;
}): ReactElement => {
  const [cover, setCover] = useState<HomeCover>(initialCover);
  return (
    <div className="flex w-[30rem] flex-col gap-6 rounded-16 border border-border-subtlest-tertiary bg-background-default p-6">
      <span className="font-bold text-text-primary typo-title3">
        Appearance
      </span>
      <section className="flex items-center justify-between">
        <span className="text-text-tertiary typo-subhead">Theme</span>
        <span className="flex gap-1">
          {themeIcons.map((Icon, index) => (
            <Button
              key={Icon.name || index}
              icon={<Icon secondary={index === 0} />}
              variant={
                index === 0 ? ButtonVariant.Float : ButtonVariant.Tertiary
              }
              size={ButtonSize.XSmall}
            />
          ))}
        </span>
      </section>
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-text-primary typo-subhead">
            Home cover
          </span>
          <span className="text-text-tertiary typo-footnote">
            Art behind your shortcuts and greeting, on the home page only.
          </span>
        </div>
        <div className="flex gap-3">
          <CoverOption
            label="None"
            isSelected={cover === 'none'}
            onClick={() => setCover('none')}
          >
            <span className="size-full bg-background-subtle" />
          </CoverOption>
          <CoverOption
            label="Vice City"
            isSelected={cover === 'viceCity'}
            onClick={() => setCover('viceCity')}
          >
            <img
              src={coverArt}
              alt=""
              className="size-full object-cover object-[70%_60%]"
            />
          </CoverOption>
        </div>
      </section>
    </div>
  );
};
