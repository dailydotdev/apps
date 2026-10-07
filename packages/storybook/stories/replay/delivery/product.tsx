import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import LogoText from '@dailydotdev/shared/src/svg/LogoText';
import { BellIcon } from '@dailydotdev/shared/src/components/icons/Bell';
import { BookmarkIcon } from '@dailydotdev/shared/src/components/icons/Bookmark';
import { DiscussIcon } from '@dailydotdev/shared/src/components/icons/Discuss';
import { EarthIcon } from '@dailydotdev/shared/src/components/icons/Earth';
import { HomeIcon } from '@dailydotdev/shared/src/components/icons/Home';
import { HotIcon } from '@dailydotdev/shared/src/components/icons/Hot';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons/Search';
import { SquadIcon } from '@dailydotdev/shared/src/components/icons/Squad';
import { UpvoteIcon } from '@dailydotdev/shared/src/components/icons/Upvote';
import { UserIcon } from '@dailydotdev/shared/src/components/icons/User';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Avatar, CAST, ME } from '../people';
import { monogramOf, sourceBy, sourceLogo } from '../sources';

/**
 * A closer stand-in for the desktop app than the grey-block feed: the rail,
 * the header with search, streak and bell, the feed tabs, and post cards with
 * a source, an image and the action row. Close enough that a Replay element
 * dropped into it is judged against the real neighbours it will have.
 */

export const POSTS = [
  { title: 'Postgres 19 ships async I/O, and the numbers are absurd', source: 'postgres', person: CAST[5], min: 6, up: 412, comments: 38, art: 'linear-gradient(135deg, #1F2A5C 0%, #4A7EEE 60%, #9BB8FF 100%)' },
  { title: 'What actually happens when you run kubectl apply', source: 'cloudflare', person: CAST[0], min: 9, up: 288, comments: 21, art: 'linear-gradient(135deg, #3A1A0C 0%, #FF9157 65%, #FFD9A8 100%)' },
  { title: 'Rust in the kernel, one year on', source: 'rust', person: CAST[4], min: 11, up: 640, comments: 96, art: 'linear-gradient(135deg, #2A0B0B 0%, #DD5143 60%, #FF9C8F 100%)' },
  { title: 'Stop using UUIDs as primary keys (mostly)', source: 'jvns', person: CAST[2], min: 5, up: 1204, comments: 210, art: 'linear-gradient(135deg, #2A0B3D 0%, #CE3DF3 60%, #F2B8FF 100%)' },
  { title: 'The end of the free CI tier', source: 'pragmatic', person: CAST[6], min: 7, up: 519, comments: 143, art: 'linear-gradient(135deg, #3D3300 0%, #FFE24C 65%, #FFF5B8 100%)' },
  { title: 'Two Kubernetes CVEs to read before Wednesday', source: 'kubernetes', person: CAST[1], min: 4, up: 233, comments: 12, art: 'linear-gradient(135deg, #0C1F3A 0%, #4A7EEE 55%, #29D8E5 100%)' },
  { title: 'Suspense boundaries in practice', source: 'vercel', person: CAST[3], min: 8, up: 377, comments: 44, art: 'linear-gradient(135deg, #1A1633 0%, #887BF8 60%, #C9C2FF 100%)' },
  { title: 'Why your effects run twice', source: 'github', person: CAST[7], min: 6, up: 902, comments: 167, art: 'linear-gradient(135deg, #062A2E 0%, #29D8E5 60%, #B8F4F9 100%)' },
  { title: 'A practical guide to connection pooling', source: 'acm', person: CAST[5], min: 12, up: 340, comments: 19, art: 'linear-gradient(135deg, #0F2A1A 0%, #57E087 60%, #C6F7D8 100%)' },
];

const SourceMark = ({ id, size = 22 }: { id: string; size?: number }): ReactElement => {
  const source = sourceBy(id);
  const logo = sourceLogo(source, size * 2);
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-[999px] font-bold text-white"
      style={{ width: size, height: size, background: source.tint, fontSize: size * 0.42 }}
    >
      {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : monogramOf(source.name)}
    </span>
  );
};

export const Post = ({ index, read = false, className, style }: { index: number; read?: boolean; className?: string; style?: CSSProperties }): ReactElement => {
  const post = POSTS[index % POSTS.length];
  const source = sourceBy(post.source);
  return (
    <article
      className={classNames(
        'flex h-full min-h-[21rem] flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-3 hover:border-border-subtlest-secondary',
        className,
      )}
      style={style}
    >
      <div className="flex items-center gap-2">
        <SourceMark id={post.source} />
        <span className="truncate text-text-tertiary typo-footnote">{source.name}</span>
        <span className="ml-auto text-text-quaternary typo-caption2">{post.min}m read</span>
      </div>
      <h3 className={classNames('line-clamp-3 font-bold typo-title3', read ? 'text-text-quaternary' : 'text-text-primary')}>{post.title}</h3>
      <div className="mt-auto h-32 w-full rounded-12" style={{ background: post.art, opacity: read ? 0.5 : 1 }} />
      <div className="flex items-center justify-between text-text-tertiary">
        <span className="flex items-center gap-1 typo-caption1">
          <UpvoteIcon size={IconSize.Small} />
          {post.up}
        </span>
        <span className="flex items-center gap-1 typo-caption1">
          <DiscussIcon size={IconSize.Small} />
          {post.comments}
        </span>
        <span className="flex items-center gap-1 typo-caption1">
          <BookmarkIcon size={IconSize.Small} />
        </span>
        <Avatar person={post.person} size={20} />
      </div>
    </article>
  );
};

const NAV = [
  { icon: HomeIcon, label: 'My feed', active: true },
  { icon: UserIcon, label: 'Following' },
  { icon: EarthIcon, label: 'Explore' },
  { icon: DiscussIcon, label: 'Discussions' },
  { icon: BookmarkIcon, label: 'Bookmarks' },
];

const SQUADS = ['Kubernetes', 'Rustaceans', 'Frontend ops'];

export const Rail = ({ children }: { children?: ReactNode }): ReactElement => (
  <aside className="flex w-[13.5rem] shrink-0 flex-col gap-1 border-r border-border-subtlest-tertiary px-3 py-4">
    <div className="mb-3 flex items-center gap-1.5 px-2 text-text-primary">
      <span className="flex h-6 w-6 [&_svg]:h-full [&_svg]:w-full">
        <LogoIcon />
      </span>
      <span className="flex h-4 [&_svg]:h-full [&_svg]:w-auto">
        <LogoText />
      </span>
    </div>
    {NAV.map(({ icon: Icon, label, active }) => (
      <span
        key={label}
        className={classNames(
          'flex items-center gap-3 rounded-12 px-3 py-2 typo-callout',
          active ? 'bg-surface-float font-bold text-text-primary' : 'text-text-tertiary',
        )}
      >
        <Icon size={IconSize.Small} secondary={active} />
        {label}
      </span>
    ))}
    {children}
    <span className="mt-4 px-3 font-mono uppercase tracking-[0.12em] text-text-quaternary typo-caption2">Squads</span>
    {SQUADS.map((squad) => (
      <span key={squad} className="flex items-center gap-3 rounded-12 px-3 py-1.5 text-text-tertiary typo-callout">
        <SquadIcon size={IconSize.Small} />
        {squad}
      </span>
    ))}
  </aside>
);

export const TopBar = ({ right, style }: { right?: ReactNode; style?: CSSProperties }): ReactElement => (
  <header className="relative flex h-14 items-center gap-3 border-b border-border-subtlest-tertiary px-5" style={style}>
    <span className="flex h-9 w-[24rem] max-w-full items-center gap-2 rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 text-text-quaternary typo-callout">
      <SearchIcon size={IconSize.Small} />
      Search posts, tags, sources
    </span>
    <span className="ml-auto flex items-center gap-2">
      {right}
      <span className="flex items-center gap-1 rounded-10 px-2 py-1 font-bold text-accent-bacon-default typo-callout">
        <HotIcon size={IconSize.Small} secondary />
        37
      </span>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-10 text-text-tertiary">
        <BellIcon size={IconSize.Small} />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-[999px] bg-accent-cabbage-default" />
      </span>
      <Avatar person={ME} size={30} />
    </span>
  </header>
);

export const FeedTabs = ({ children }: { children?: ReactNode }): ReactElement => (
  <div className="flex items-center gap-1 px-1">
    {['For you', 'Popular', 'Most upvoted', 'Best discussions'].map((tab, index) => (
      <span
        key={tab}
        className={classNames(
          'rounded-10 px-3 py-1.5 typo-callout',
          index === 0 ? 'bg-surface-float font-bold text-text-primary' : 'text-text-tertiary',
        )}
      >
        {tab}
      </span>
    ))}
    <span className="ml-auto">{children}</span>
  </div>
);

/**
 * The desktop shell. `above` sits between the tabs and the grid, `slots`
 * are laid on the three-column grid in order, and any slot can span.
 */
export const ProductShell = ({
  above,
  slots,
  count = 6,
  width = 1180,
  railChildren,
  headerRight,
  tabsChildren,
  overlay,
  below,
  headerStyle,
  topEdge,
}: {
  above?: ReactNode;
  slots?: { node: ReactNode; span?: 1 | 2 | 3; at?: number }[];
  count?: number;
  width?: number;
  railChildren?: ReactNode;
  headerRight?: ReactNode;
  tabsChildren?: ReactNode;
  /** Absolutely positioned over the whole shell: prompts, dropdowns, floating buttons. */
  overlay?: ReactNode;
  below?: ReactNode;
  headerStyle?: CSSProperties;
  /** Sits above the header, full width: hairlines, skies. */
  topEdge?: ReactNode;
}): ReactElement => {
  const items: ReactNode[] = [];
  const sorted = [...(slots ?? [])].sort((a, b) => (a.at ?? 0) - (b.at ?? 0));
  let post = 0;
  let cursor = 0;
  while (post < count) {
    const injected = sorted.find((slot) => (slot.at ?? 0) === cursor);
    if (injected) {
      items.push(
        <div key={`slot-${cursor}`} style={{ gridColumn: `span ${injected.span ?? 1}` }}>
          {injected.node}
        </div>,
      );
    } else {
      items.push(<Post key={`post-${post}`} index={post} />);
      post += 1;
    }
    cursor += 1;
  }
  return (
    <div className="relative flex overflow-hidden rounded-20 border border-border-subtlest-tertiary bg-background-default" style={{ width, maxWidth: '100%' }}>
      <Rail>{railChildren}</Rail>
      <div className="flex min-w-0 flex-1 flex-col">
        {topEdge}
        <TopBar right={headerRight} style={headerStyle} />
        <div className="flex flex-col gap-4 p-5">
          <FeedTabs>{tabsChildren}</FeedTabs>
          {above}
          <div className="grid grid-cols-3 gap-4">{items}</div>
          {below}
        </div>
      </div>
      {overlay && <div className="pointer-events-none absolute inset-0 [&>*]:pointer-events-auto">{overlay}</div>}
    </div>
  );
};

/** The phone shell: a compact header, the feed as a single column. */
export const PhoneShell = ({ children, header = true }: { children: ReactNode; header?: boolean }): ReactElement => (
  <div className="flex h-full w-full flex-col bg-background-default">
    {header && (
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border-subtlest-tertiary px-3">
        <span className="flex h-6 w-6 text-text-primary [&_svg]:h-full [&_svg]:w-full">
          <LogoIcon />
        </span>
        <span className="flex h-8 flex-1 items-center gap-2 rounded-10 bg-surface-float px-3 text-text-quaternary typo-caption1">
          <SearchIcon size={IconSize.XSmall} />
          Search
        </span>
        <span className="flex items-center gap-1 font-bold text-accent-bacon-default typo-caption1">
          <HotIcon size={IconSize.XSmall} secondary />
          37
        </span>
        <Avatar person={ME} size={26} />
      </div>
    )}
    {children}
  </div>
);
