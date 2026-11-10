import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonGroup,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { HorizontalSeparator } from '@dailydotdev/shared/src/components/utilities/common';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  ArrowIcon,
  BellIcon,
  BookmarkIcon,
  CreditCardIcon,
  ExitIcon,
  EyeIcon,
  FilterIcon,
  HomeIcon,
  MegaphoneIcon,
  MoonIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  SquadIcon,
  SunIcon,
  TrendingIcon,
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
 * The Vice City theme: dark mode with the release art behind the home page's
 * shortcuts and greeting. It's never applied for the reader: the Theme row in
 * the settings popover (ThemeSection, also on Settings › Appearance) gets a
 * fourth option, VI, beside dark, light and auto, and picking another theme
 * turns it off. The page around it is the Hero Cover home
 * (stories/hero-cover), drawn here at two widths.
 */

export type ThemeChoice = 'dark' | 'light' | 'auto' | 'viceCity';

/** The VI option's glyph: the title's letters in the sunset gradient. */
const ViGlyph = (): ReactElement => (
  <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
    <defs>
      <linearGradient id="gta-vi-glyph" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--theme-accent-cabbage-default)" />
        <stop offset="55%" stopColor="var(--theme-accent-bacon-default)" />
        <stop offset="100%" stopColor="var(--theme-accent-bun-default)" />
      </linearGradient>
    </defs>
    <text
      x="12"
      y="13"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize="17"
      fontWeight="900"
      textLength="20"
      lengthAdjust="spacingAndGlyphs"
      fill="url(#gta-vi-glyph)"
    >
      VI
    </text>
  </svg>
);

const themeOptions: {
  value: ThemeChoice;
  label: string;
  icon: (isActive: boolean) => ReactElement;
}[] = [
  { value: 'dark', label: 'Dark', icon: (on) => <MoonIcon secondary={on} /> },
  { value: 'light', label: 'Light', icon: (on) => <SunIcon secondary={on} /> },
  {
    value: 'auto',
    label: 'Auto',
    icon: (on) => <ThemeAutoIcon secondary={on} />,
  },
  { value: 'viceCity', label: 'Vice City', icon: () => <ViGlyph /> },
];

/** Production's ThemeSection with the VI option added last. */
export const ThemeRow = ({
  theme,
  onTheme,
}: {
  theme: ThemeChoice;
  onTheme: (theme: ThemeChoice) => void;
}): ReactElement => (
  <section className="flex items-center justify-between px-1">
    <span className="text-text-tertiary typo-subhead">Theme</span>
    <ButtonGroup>
      {themeOptions.map((option) => {
        const isActive = option.value === theme;
        return (
          <Button
            key={option.value}
            icon={option.icon(isActive)}
            aria-label={option.label}
            title={option.label}
            aria-pressed={isActive}
            variant={isActive ? ButtonVariant.Float : ButtonVariant.Tertiary}
            size={ButtonSize.XSmall}
            onClick={() => onTheme(option.value)}
            className={isActive ? 'text-text-primary' : undefined}
          />
        );
      })}
    </ButtonGroup>
  </section>
);

const menuGroups = [
  [
    { title: 'Settings', icon: SettingsIcon },
    { title: 'Appearance', icon: EyeIcon },
  ],
  [
    { title: 'Payment & Subscription', icon: CreditCardIcon },
    { title: 'Ads dashboard', icon: TrendingIcon },
    { title: 'Advertise', icon: MegaphoneIcon },
  ],
  [{ title: 'Log out', icon: ExitIcon }],
];

/** SidebarDesktopV2's settings popover, from the rail's bottom gear. */
export const SettingsPopover = ({
  theme,
  onTheme,
  className,
}: {
  theme: ThemeChoice;
  onTheme: (theme: ThemeChoice) => void;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex w-64 flex-col gap-2 rounded-10 border border-border-subtlest-tertiary bg-accent-pepper-subtlest p-3 shadow-2',
      className,
    )}
  >
    <ThemeRow theme={theme} onTheme={onTheme} />
    {menuGroups.map((items) => (
      <React.Fragment key={items[0].title}>
        <HorizontalSeparator />
        <div className="flex flex-col">
          {items.map(({ title, icon: Icon }) => (
            <span
              key={title}
              className="flex h-9 items-center gap-2 rounded-8 px-1 text-text-tertiary typo-subhead hover:bg-surface-hover hover:text-text-primary"
            >
              <Icon size={IconSize.Small} />
              {title}
            </span>
          ))}
        </div>
      </React.Fragment>
    ))}
  </div>
);

const sideIcons = [
  HomeIcon,
  SearchIcon,
  ReadingStreakIcon,
  BellIcon,
  SquadIcon,
  BookmarkIcon,
];

const SideRail = ({
  isSettingsOpen,
  onSettings,
}: {
  isSettingsOpen: boolean;
  onSettings: () => void;
}): ReactElement => (
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
    <button
      type="button"
      aria-label="Settings"
      aria-expanded={isSettingsOpen}
      onClick={onSettings}
      className={classNames(
        'mt-auto flex size-10 items-center justify-center rounded-12 text-text-tertiary hover:bg-surface-hover hover:text-text-primary',
        isSettingsOpen && 'bg-surface-float !text-text-primary',
      )}
    >
      <SettingsIcon secondary={isSettingsOpen} size={IconSize.Small} />
    </button>
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
            'max-w-full truncate text-center typo-caption1',
            // The skyline is busy behind the labels, so they sit on a scrim.
            isThemed
              ? 'rounded-6 bg-overlay-primary-pepper px-1.5 text-white'
              : 'w-full text-text-tertiary',
          )}
        >
          {shortcut.name}
        </span>
      </span>
    ))}
  </div>
);

/** The art, fading into the page so the greeting under it stays legible. */
const CoverArt = ({
  isPhone,
  src = coverArt,
}: {
  isPhone?: boolean;
  src?: string;
}): ReactElement => {
  // A cover that fails to load leaves the default home, not a broken image.
  const [isBroken, setIsBroken] = useState(false);
  if (isBroken) {
    return null;
  }
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0">
      <img
        src={src}
        alt=""
        onError={() => setIsBroken(true)}
        className={classNames(
          'w-full object-cover',
          isPhone ? 'h-56 object-[70%_60%]' : 'h-64 object-[center_65%]',
        )}
      />
      <span className="absolute inset-0 bg-gradient-to-b from-transparent from-30% to-background-default to-90%" />
    </div>
  );
};

const tabs = ['For you', 'AI', 'Career', 'Architecture', 'My new feed'];

/**
 * The home page at one width. Interactive: the rail's gear opens the
 * settings popover, and the Theme row's VI turns the theme on or off.
 */
export const ThemedHome = ({
  initialTheme = 'dark',
  isSettingsOpenInitially = false,
  isPhone: isPhoneProp = false,
  width: widthProp = 1440,
  height: heightProp = 900,
  columns: columnsProp = 4,
  isFluid = false,
  coverSrc,
  userName = 'TheCoverLiker',
  shortcutCount = 7,
}: {
  initialTheme?: ThemeChoice;
  isSettingsOpenInitially?: boolean;
  isPhone?: boolean;
  width?: number;
  height?: number;
  columns?: number;
  /** Fills the window at its own size, for device frames. */
  isFluid?: boolean;
  /** Another cover URL, to show a cover that fails to load. */
  coverSrc?: string;
  userName?: string;
  shortcutCount?: number;
}): ReactElement => {
  const [theme, setTheme] = useState<ThemeChoice>(initialTheme);
  const [isSettingsOpen, setIsSettingsOpen] = useState(isSettingsOpenInitially);
  const width = isFluid ? window.innerWidth : widthProp;
  const height = isFluid ? window.innerHeight : heightProp;
  // styles/media.ts: phone < 656, tablet, laptop 1020, laptopL 1360,
  // laptopXL 1668; the feed's columns follow.
  const isPhone = isFluid ? width < 656 : isPhoneProp;
  const columns = isFluid
    ? (width < 656 && 1) ||
      (width < 1020 && 2) ||
      (width < 1360 && 3) ||
      (width < 1668 && 4) ||
      5
    : columnsProp;
  const isThemed = theme === 'viceCity';
  const scale = isFluid ? 1 : Math.min(1, 1380 / width);
  const pad = isPhone ? 'px-4' : 'px-6';

  return (
    <div
      className={classNames(
        'shrink-0 overflow-hidden',
        !isFluid && 'rounded-24 border border-border-subtlest-quaternary',
      )}
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
        {!isPhone && (
          <SideRail
            isSettingsOpen={isSettingsOpen}
            onSettings={() => setIsSettingsOpen((value) => !value)}
          />
        )}
        {isSettingsOpen && !isPhone && (
          <SettingsPopover
            theme={theme}
            onTheme={setTheme}
            className="absolute bottom-4 left-[4.5rem] z-3"
          />
        )}
        <div className="no-scrollbar relative min-w-0 flex-1 overflow-y-auto">
          {isThemed && <CoverArt isPhone={isPhone} src={coverSrc} />}
          <div className={classNames('relative flex flex-col gap-4', pad)}>
            <div className="relative flex min-h-12 items-start pt-4">
              {!isPhone && (
                <div className="flex-1">
                  <Shortcuts isThemed={isThemed} count={shortcutCount} />
                </div>
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
                    isThemed && 'drop-shadow-md',
                    isPhone ? 'typo-title3' : 'typo-title2',
                  )}
                >
                  Good afternoon, {userName}
                </span>
                <span
                  className={classNames(
                    'truncate typo-footnote',
                    isThemed
                      ? 'text-text-secondary drop-shadow-md'
                      : 'text-text-tertiary',
                  )}
                >
                  Thursday, November 19 · 12 new since yesterday
                </span>
              </div>
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
      </div>
    </div>
  );
};
