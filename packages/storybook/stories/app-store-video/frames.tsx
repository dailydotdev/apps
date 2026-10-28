import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { ArticleList } from '@dailydotdev/shared/src/components/cards/article/ArticleList';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  BellIcon,
  HomeIcon,
  PlusIcon,
  ReadingStreakIcon,
  SearchIcon,
  SourceIcon,
} from '@dailydotdev/shared/src/components/icons';
import LogoText from '@dailydotdev/shared/src/svg/LogoText';
import { cardHandlers } from '../features/feed/feedHero.mocks';
import { realPosts } from '../hero-cover/realData';

// The app's own pieces for the videos: the production list card fed the
// public feed as it was on 2026-10-11 (hero-cover/realFeed.ts), so every
// title, source and TLDR on screen is real, and the phone screen around it.

/** The phone's card column, as the list card lays out at 375px. */
export const COLUMN = 343;

/**
 * Clicks the card's "Show more" once it appears, so a frame can show the
 * TLDR open: the card measures its clamp after its first paint.
 */
const ExpandTldr = ({ children }: { children: ReactNode }): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return undefined;
    }
    const expand = (): boolean => {
      const button = [...element.querySelectorAll('button')].find(
        (candidate) => candidate.textContent?.trim() === 'Show more',
      );
      button?.click();
      return !!button;
    };
    if (expand()) {
      return undefined;
    }
    const observer = new MutationObserver(
      () => expand() && observer.disconnect(),
    );
    observer.observe(element, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return <div ref={ref}>{children}</div>;
};

export const Card = ({
  post,
  expanded,
  className,
  style,
}: {
  post: Post;
  expanded?: boolean;
  className?: string;
  style?: CSSProperties;
}): ReactElement => {
  const card = (
    <ArticleList
      post={post}
      isNarrow
      {...cardHandlers}
      domProps={{
        className: classNames(
          'rounded-16 border border-border-subtlest-tertiary bg-background-default',
          className,
        ),
        style,
      }}
    />
  );
  return expanded ? <ExpandTldr>{card}</ExpandTldr> : card;
};

/** The feed, the top card's TLDR open when `expanded`. */
export const FeedColumn = ({
  posts = realPosts,
  expanded = false,
  count = 3,
  width = COLUMN,
}: {
  posts?: Post[];
  expanded?: boolean;
  count?: number;
  width?: number;
}): ReactElement => (
  <div className="flex shrink-0 flex-col gap-2" style={{ width }}>
    {posts.slice(0, count).map((post, index) => (
      <Card
        // The open card remounts, so it expands itself again.
        key={`${post.id}-${expanded && index === 0}`}
        post={post}
        expanded={expanded && index === 0}
      />
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

/** The listing's own opener, the one line every video leads with. */
export const Headline = ({
  size = 56,
  align = 'left',
  className,
  children,
}: {
  size?: number;
  align?: 'left' | 'center';
  className?: string;
  children: ReactNode;
}): ReactElement => (
  <h2
    className={classNames(
      'font-bold tracking-tight text-text-primary',
      align === 'center' && 'text-center',
      className,
    )}
    style={{ fontSize: size, lineHeight: 1.1 }}
  >
    {children}
  </h2>
);

export const Accent = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="text-accent-cabbage-default">{children}</span>
);

/** A caption of an app preview frame, over the card art above the bar. */
export const Caption = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <div
    className="pointer-events-none absolute inset-x-0 top-[31rem] flex justify-center px-6"
    style={{ zIndex: 10 }}
  >
    <span
      className="rounded-14 bg-background-default px-4 py-2 text-center font-bold text-text-primary"
      style={{ fontSize: 26, lineHeight: 1.15 }}
    >
      {children}
    </span>
  </div>
);

/* ------------------------------------------------------------------ */
/* The phone screen                                                    */
/* ------------------------------------------------------------------ */

const tabs = [
  { label: 'Home', Icon: HomeIcon },
  { label: 'Explore', Icon: SearchIcon },
  { label: 'Squads', Icon: SourceIcon },
  { label: 'Activity', Icon: BellIcon },
];

/**
 * The app's screen on a phone, no bezel: the logo row with the streak and
 * the bell, the feed, and the bottom bar, as the shell draws them. Previews
 * may only be screen captures, so this is the layout the recording will
 * show; the footage itself comes from a device.
 */
export const PhoneScreen = ({
  posts,
  expanded = false,
  width = 375,
  height = 812,
  scale = 1,
  streak = 53,
  litChip,
  scroll = 0,
  children,
}: {
  posts?: Post[];
  expanded?: boolean;
  width?: number;
  height?: number;
  scale?: number;
  streak?: number;
  /** A topic chip tapped on, over "For you". */
  litChip?: string;
  /** How far the feed has scrolled, in px. */
  scroll?: number;
  children?: ReactNode;
}): ReactElement => (
  <div
    className="relative shrink-0 overflow-hidden bg-background-default"
    style={{
      width: width * scale,
      height: height * scale,
    }}
  >
    <div
      className="absolute left-0 top-0 flex flex-col bg-background-default"
      style={{
        width,
        height,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}
    >
      <div
        aria-hidden
        className="flex h-11 shrink-0 items-end justify-between px-7 pb-1 font-bold text-text-primary typo-callout"
      >
        <span>9:41</span>
        <span className="flex gap-1">
          <span className="size-2 rounded-max bg-text-primary" />
          <span className="size-2 rounded-max bg-text-primary" />
          <span className="h-2 w-5 rounded-4 bg-text-primary" />
        </span>
      </div>
      <header className="flex h-[3.25rem] shrink-0 items-center justify-between px-4">
        <LogoText className={{ container: 'h-5 w-auto' }} />
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-bold text-text-primary typo-callout">
            <ReadingStreakIcon
              size={IconSize.Medium}
              secondary
              className="text-accent-bacon-default"
            />
            {streak}
          </span>
          <BellIcon size={IconSize.Medium} className="text-text-primary" />
        </span>
      </header>
      <div className="flex gap-2 overflow-hidden px-4 pb-3">
        {['For you', 'Popular', 'AI', 'Web dev', 'DevOps'].map((chip) => (
          <span
            key={chip}
            className={classNames(
              'shrink-0 rounded-10 border px-3 py-1 font-bold typo-footnote',
              chip === (litChip ?? 'For you')
                ? 'border-border-subtlest-secondary bg-surface-float text-text-primary'
                : 'border-transparent text-text-tertiary',
            )}
          >
            {chip}
          </span>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-hidden px-4">
        <div style={{ transform: `translateY(${-scroll}px)` }}>
          <FeedColumn posts={posts} expanded={expanded} count={5} />
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-2 flex items-end gap-2 px-4"
        aria-hidden
      >
        <nav className="shell-material flex h-14 min-w-0 flex-1 items-stretch rounded-[1.375rem] p-1">
          {tabs.map((tab, index) => (
            <span
              key={tab.label}
              className={classNames(
                'flex min-w-0 flex-1 items-center justify-center text-text-primary',
                index !== 0 && 'opacity-64',
              )}
            >
              <tab.Icon size={IconSize.Large} secondary={index === 0} />
            </span>
          ))}
        </nav>
        <span className="shell-material shell-material-action flex size-14 shrink-0 items-center justify-center rounded-[1.375rem] text-text-primary">
          <PlusIcon size={IconSize.Large} />
        </span>
      </div>
      {children}
    </div>
  </div>
);
