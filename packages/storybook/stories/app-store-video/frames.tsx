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
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import LogoText from '@dailydotdev/shared/src/svg/LogoText';
import { cardHandlers } from '../features/feed/feedHero.mocks';
import { realPosts } from '../hero-cover/realData';
import { Dark } from './parts';

// The frames of the three videos, composed from the production list card
// fed the public feed as it was on 2026-10-11 (hero-cover/realFeed.ts), so
// every title, source and TLDR in the storyboard is real. A frame is a
// state of the loop; the motion between frames is described beside it.

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

/** The feed, `shift` cards in, the top card's TLDR open when `expanded`. */
export const FeedColumn = ({
  shift = 0,
  expanded = false,
  count = 3,
  width = COLUMN,
}: {
  shift?: number;
  expanded?: boolean;
  count?: number;
  width?: number;
}): ReactElement => (
  <div className="flex shrink-0 flex-col gap-2" style={{ width }}>
    {realPosts.slice(shift, shift + count).map((post, index) => (
      <Card key={post.id} post={post} expanded={expanded && index === 0} />
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
  shift = 0,
  expanded = false,
  width = 375,
  height = 812,
  scale = 1,
  streak = 53,
  children,
}: {
  shift?: number;
  expanded?: boolean;
  width?: number;
  height?: number;
  scale?: number;
  streak?: number;
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
        {['For you', 'Popular', 'AI', 'Web dev', 'DevOps'].map(
          (chip, index) => (
            <span
              key={chip}
              className={classNames(
                'shrink-0 rounded-10 border px-3 py-1 font-bold typo-footnote',
                index === 0
                  ? 'border-border-subtlest-secondary bg-surface-float text-text-primary'
                  : 'border-transparent text-text-tertiary',
              )}
            >
              {chip}
            </span>
          ),
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-hidden px-4">
        <FeedColumn shift={shift} expanded={expanded} count={4} />
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

/** The preview's end card: the logo and the login disclosure Apple asks for. */
export const EndCard = (): ReactElement => (
  <div
    className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-background-default px-8 text-center"
    style={{ zIndex: 20 }}
  >
    <LogoIcon className={{ container: 'h-16 w-auto' }} />
    <Headline size={34} align="center">
      What developers are
      <br />
      reading <Accent>today</Accent>
    </Headline>
    <p className="text-text-tertiary typo-callout">
      Free. Sign in with GitHub or Google.
    </p>
  </div>
);

/* ------------------------------------------------------------------ */
/* Header frames · 21:9                                                */
/* ------------------------------------------------------------------ */

/**
 * The header's loop: the headline sits in the template's safe rectangle,
 * centered, and never moves; the feed runs on both sides, enlarged so a
 * title still reads at a phone's width, cropped by the edges so it reads
 * as a stream and survives the per-device crops. `step` is the loop's
 * state: 0 cards rising in, 1 at rest, 2 TLDR open, 3 advanced one card.
 */
export const HeaderFrame = ({
  step,
}: {
  step: 0 | 1 | 2 | 3;
}): ReactElement => {
  const shift = step === 3 ? 1 : 0;
  const cardStyle = (side: 'left' | 'right'): CSSProperties => ({
    [side]: side === 'left' ? '2%' : '-12%',
    top: -12,
    transform: `scale(1.05) translateY(${step === 0 ? 40 : 0}px)`,
    transformOrigin: `${side} top`,
    opacity: step === 0 ? 0.35 : side === 'left' ? 1 : 0.85,
  });
  return (
    <div className="absolute inset-0">
      <div className="absolute w-[22rem]" style={cardStyle('left')}>
        <Card post={realPosts[shift]} expanded={step === 2} />
      </div>
      <div className="absolute w-[22rem]" style={cardStyle('right')}>
        <Card post={realPosts[shift + 1]} />
      </div>
      <div className="absolute left-1/2 top-1/2 flex w-[40%] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3">
        <Headline size={48} align="center" className="whitespace-nowrap">
          What developers
          <br />
          are reading <Accent>today</Accent>
        </Headline>
        <p className="text-text-tertiary" style={{ fontSize: 20 }}>
          Every post with a TLDR.
        </p>
      </div>
      {(['left', 'right'] as const).map((side) => (
        <div
          key={side}
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-[8%]"
          style={{
            [side]: 0,
            background: `linear-gradient(${
              side === 'left' ? 270 : 90
            }deg, transparent, var(--theme-background-default))`,
          }}
        />
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Search results frames · 3:2                                         */
/* ------------------------------------------------------------------ */

/**
 * The search asset's loop: one line that says what the app is, the screen
 * itself under it. `step`: 0 the feed, 1 scrolled one card, 2 the TLDR open,
 * 3 the chips row lit on the next topic.
 */
export const SearchFrame = ({
  step,
}: {
  step: 0 | 1 | 2 | 3;
}): ReactElement => (
  <div className="absolute inset-0 flex flex-col items-center">
    <div className="shrink-0 pt-[11.75rem]">
      <Headline size={32} align="center">
        Dev news, with a
        <br />
        <Accent>TLDR</Accent> on every post
      </Headline>
    </div>
    <div
      className="relative mt-4 overflow-hidden rounded-t-24 border border-b-0 border-border-subtlest-secondary"
      style={{ width: 375 * 0.95, height: 330 }}
    >
      <PhoneScreen
        shift={step === 1 ? 1 : 0}
        expanded={step === 2}
        scale={0.95}
        height={812}
      >
        {step === 3 && (
          <div
            aria-hidden
            className="absolute left-[7.25rem] top-[7.6rem] h-7 w-[2.6rem] rounded-10 border-2 border-accent-cabbage-default"
          />
        )}
      </PhoneScreen>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* App preview frames · 9:16                                           */
/* ------------------------------------------------------------------ */

export type PreviewScene =
  | 'open'
  | 'scroll'
  | 'tldr'
  | 'topic'
  | 'bookmark'
  | 'end';

/** One scene of the 22-second preview, captioned the way the cut will be. */
export const PreviewFrame = ({
  scene,
}: {
  scene: PreviewScene;
}): ReactElement => {
  if (scene === 'end') {
    return (
      <Dark>
        <PhoneScreen width={360} height={780}>
          <EndCard />
        </PhoneScreen>
      </Dark>
    );
  }
  const caption: Record<Exclude<PreviewScene, 'end'>, ReactNode> = {
    open: 'What developers are reading today',
    scroll: 'One feed. 2,000+ sources.',
    tldr: 'A TLDR on every post',
    topic: 'Tuned to your stack',
    bookmark: 'Save it. Keep your streak.',
  };
  return (
    <Dark>
      <PhoneScreen
        width={360}
        height={780}
        shift={scene === 'scroll' ? 1 : scene === 'topic' ? 2 : 0}
        expanded={scene === 'tldr'}
        streak={scene === 'bookmark' ? 54 : 53}
      >
        {scene !== 'open' && <Caption>{caption[scene]}</Caption>}
        {scene === 'topic' && (
          <div
            aria-hidden
            className="absolute left-[6.9rem] top-[7.4rem] h-7 w-[2.6rem] rounded-10 border-2 border-accent-cabbage-default"
          />
        )}
      </PhoneScreen>
    </Dark>
  );
};
