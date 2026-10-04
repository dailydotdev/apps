import type { ComponentType, CSSProperties, ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import LogoText from '@dailydotdev/shared/src/svg/LogoText';
import { HomeIcon } from '@dailydotdev/shared/src/components/icons/Home';
import { AiIcon } from '@dailydotdev/shared/src/components/icons/Ai';
import { MegaphoneIcon } from '@dailydotdev/shared/src/components/icons/Megaphone';
import { BellIcon } from '@dailydotdev/shared/src/components/icons/Bell';
import { SourceIcon } from '@dailydotdev/shared/src/components/icons/Source';
import { SquadIcon } from '@dailydotdev/shared/src/components/icons/Squad';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons/Search';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons/Menu';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons/Share';
import { BookmarkIcon } from '@dailydotdev/shared/src/components/icons/Bookmark';
import { UpvoteIcon } from '@dailydotdev/shared/src/components/icons/Upvote';
import { DownvoteIcon } from '@dailydotdev/shared/src/components/icons/Downvote';
import { DiscussIcon } from '@dailydotdev/shared/src/components/icons/Discuss';
import { LinkIcon } from '@dailydotdev/shared/src/components/icons/Link';
import { ReadingStreakIcon } from '@dailydotdev/shared/src/components/icons/ReadingStreak';
import { SettingsIcon } from '@dailydotdev/shared/src/components/icons/Settings';
import { OpenLinkIcon } from '@dailydotdev/shared/src/components/icons/OpenLink';
import { EditIcon } from '@dailydotdev/shared/src/components/icons/Edit';
import { PollIcon } from '@dailydotdev/shared/src/components/icons/Poll';
import { HashtagIcon } from '@dailydotdev/shared/src/components/icons/Hashtag';
import { TrendingIcon } from '@dailydotdev/shared/src/components/icons/Trending';
import { AgentIcon } from '@dailydotdev/shared/src/components/icons/Agent';
import { HotIcon } from '@dailydotdev/shared/src/components/icons/Hot';
import { MagicIcon } from '@dailydotdev/shared/src/components/icons/Magic';
import { DevCardIcon } from '@dailydotdev/shared/src/components/icons/DevCard';
import { CoreFlatIcon } from '@dailydotdev/shared/src/components/icons/CoreFlat';
import { TimerIcon } from '@dailydotdev/shared/src/components/icons/Timer';
import { MedalIcon } from '@dailydotdev/shared/src/components/icons/Medal';
import { UserIcon } from '@dailydotdev/shared/src/components/icons/User';
import { AddUserIcon } from '@dailydotdev/shared/src/components/icons/AddUser';
import { DevPlusIcon } from '@dailydotdev/shared/src/components/icons/DevPlus';
import { HelpIcon } from '@dailydotdev/shared/src/components/icons/Help';
import { FilterIcon } from '@dailydotdev/shared/src/components/icons/Filter';
import { SortIcon } from '@dailydotdev/shared/src/components/icons/Sort';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { MockComment, MockPost } from './data';
import { comments as defaultComments, posts, squads, tags } from './data';
import { RowMapping, quietChipClassName, useRowMapping } from './rowStyle';

// Everything here is a 375px-wide mock of a phone screen. "Today" mocks copy
// production; "Proposed" mocks are the recommendation. Component names in
// comments point at the real source.

// isPlus draws production's Plus mark on the wordmark (LogoText), the
// member indicator HeaderLogo already shows.
export const Logo = ({
  compact,
  className,
  isPlus,
}: {
  compact?: boolean;
  className?: string;
  isPlus?: boolean;
}): ReactElement => (
  <span className={classNames('flex items-center', className)}>
    <LogoIcon className={{ container: 'h-logo w-auto' }} />
    {!compact && <LogoText isPlus={isPlus} className={{ container: 'ml-1 h-logo w-auto' }} />}
  </span>
);

export const Screen = ({
  header,
  footer,
  overlay,
  children,
  bodyClassName,
}: {
  header?: ReactNode;
  footer?: ReactNode;
  overlay?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
}): ReactElement => (
  <>
    {header && <div className="relative z-2 shrink-0">{header}</div>}
    <div
      className={classNames(
        'map-scroll-none relative min-h-0 flex-1 overflow-hidden',
        bodyClassName,
      )}
    >
      {children}
    </div>
    {footer && <div className="relative z-2 shrink-0">{footer}</div>}
    {overlay && <div className="absolute inset-0 z-3">{overlay}</div>}
  </>
);

// Circles are for squads and sources. A person is always the platform's
// rounded square, with the radius production's ProfilePicture gives each
// size (20 → 6, 24 → 8, 32 → 10, 40 → 12, 48 → 14, 56 → 16, 64 → 18, 96 → 26).
// In a header the avatar is a floating button like the others: the hairline
// ring and soft shadow of the top buttons.
const floatingRing = 'inset 0 0 0 1px var(--theme-border-subtlest-tertiary), 0 4px 30px rgb(0 0 0 / 0.12)';

export const avatarRadius = (size: number): number => {
  if (size <= 16) return 4;
  if (size <= 20) return 6;
  if (size <= 24) return 8;
  if (size <= 32) return 10;
  if (size <= 40) return 12;
  if (size <= 48) return 14;
  if (size <= 56) return 16;
  if (size <= 64) return 18;
  if (size <= 80) return 22;
  return 26;
};

export const Avatar = ({
  size = 32,
  className,
  ring,
  floating,
}: {
  size?: number;
  className?: string;
  ring?: boolean;
  floating?: boolean;
}): ReactElement => (
  <span
    style={{ width: size, height: size, borderRadius: avatarRadius(size), boxShadow: floating ? floatingRing : undefined }}
    className={classNames(
      'flex shrink-0 items-center justify-center bg-gradient-to-br from-accent-cabbage-default to-accent-onion-default font-bold text-white',
      size >= 40 ? 'typo-callout' : 'typo-caption2',
      ring && 'ring-2 ring-text-primary ring-offset-2 ring-offset-background-default',
      className,
    )}
  >
    MC
  </span>
);

export const HeaderAvatar = (): ReactElement => <Avatar size={38} floating />;

const IconButton = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'flex size-10 shrink-0 items-center justify-center text-text-secondary',
      className,
    )}
  >
    {children}
  </span>
);

// No horizontal padding: the pill has no background, so padding only
// widened the gap to its neighbours; the row's 12px gap is the spacing.
export const StreakPill = (): ReactElement => (
  <span className="flex h-8 items-center gap-1 font-bold tabular-nums text-text-primary typo-footnote">
    12
    <ReadingStreakIcon size={IconSize.Small} secondary />
  </span>
);

// Production's count bubble as the layout v2 rail draws it (Bubble +
// railCountBubbleClass): the brand colour, a rounded rectangle, 18px
// minimum, bold caption, tabular digits, sitting -4px above and 16px into
// the icon. Never a red circle.
export const Badge = ({ count = 3 }: { count?: number }): ReactElement => (
  <span className="absolute -top-1 left-4 flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-8 bg-accent-cabbage-default px-1 font-bold tabular-nums text-white typo-caption1">
    {count}
  </span>
);

// ---------------------------------------------------------------------------
// Bottom bars

export enum TabSet {
  Today = 'today',
  Proposed = 'proposed',
  YouArm = 'you',
}

interface TabDefinition {
  label: string;
  icon?: ComponentType<{ secondary?: boolean; size?: IconSize; className?: string }>;
  badge?: boolean;
  create?: boolean;
  avatar?: boolean;
}

const tabSets: Record<TabSet, TabDefinition[]> = {
  [TabSet.Today]: [
    { label: 'Home', icon: HomeIcon },
    { label: 'Explore', icon: AiIcon },
    { label: 'Headlines', icon: MegaphoneIcon },
    { label: 'Activity', icon: BellIcon, badge: true },
    { label: 'Squads', icon: SourceIcon },
  ],
  [TabSet.Proposed]: [
    { label: 'Home', icon: HomeIcon },
    { label: 'Explore', icon: SearchIcon },
    { label: 'Create', create: true },
    { label: 'Squads', icon: SquadIcon },
    { label: 'Activity', icon: BellIcon, badge: true },
  ],
  [TabSet.YouArm]: [
    { label: 'Home', icon: HomeIcon },
    { label: 'Explore', icon: SearchIcon },
    { label: 'Create', create: true },
    { label: 'Activity', icon: BellIcon, badge: true },
    { label: 'You', avatar: true },
  ],
};

const TabIcon = ({
  tab,
  active,
}: {
  tab: TabDefinition;
  active: boolean;
}): ReactElement | null => {
  if (tab.create) {
    return (
      <span className="flex h-7 w-9 items-center justify-center rounded-10 bg-text-primary text-surface-invert">
        <PlusIcon size={IconSize.Small} />
      </span>
    );
  }

  if (tab.avatar) {
    return <Avatar size={24} ring={active} />;
  }

  const Icon = tab.icon;

  if (!Icon) {
    return null;
  }

  return (
    <span className="relative">
      <Icon size={IconSize.Medium} secondary={active} />
      {tab.badge && <Badge />}
    </span>
  );
};

// MobileFooterNavbar: floating rounded glass bar, active indicator on top,
// plus the separate FooterPlusButton above it (see `Fab`).
export const TodayTabBar = ({
  active = 'Home',
}: {
  active?: string;
}): ReactElement => (
  <div className="relative bg-gradient-to-t from-background-subtle px-2 pb-6 pt-2">
    <nav className="grid auto-cols-fr grid-flow-col rounded-16 border-t border-border-subtlest-tertiary bg-background-subtle/[0.8] pb-1 pt-2 shadow-2 backdrop-blur-2xl">
      {tabSets[TabSet.Today].map((tab) => {
        const isActive = tab.label === active;

        return (
          <span
            key={tab.label}
            className={classNames(
              'relative flex flex-col items-center gap-1',
              isActive ? 'text-text-primary' : 'text-text-tertiary',
            )}
          >
            {isActive && (
              <span className="absolute -top-2 h-0.5 w-6 rounded-2 bg-text-primary" />
            )}
            <TabIcon tab={tab} active={isActive} />
            <span className="typo-caption2">{tab.label}</span>
          </span>
        );
      })}
    </nav>
  </div>
);

export const Fab = (): ReactElement => (
  <span className="absolute bottom-24 right-4 z-2 flex size-12 items-center justify-center rounded-14 bg-text-primary text-surface-invert shadow-2">
    <PlusIcon size={IconSize.Medium} />
  </span>
);

// Proposed: a docked, full-width bar. Places only; Create is the one action
// and sits in the centre like Reddit, Threads and YouTube.
export const ProposedTabBar = ({
  set = TabSet.Proposed,
  active = 'Home',
  minimized,
}: {
  set?: TabSet;
  active?: string;
  minimized?: boolean;
}): ReactElement => (
  <nav
    className={classNames(
      'grid auto-cols-fr grid-flow-col border-t border-border-subtlest-tertiary bg-background-default/[0.88] px-1 pb-5 backdrop-blur-xl transition-all',
      minimized ? 'pt-1.5' : 'pt-2',
    )}
  >
    {tabSets[set].map((tab) => {
      const isActive = tab.label === active;

      return (
        <span
          key={tab.label}
          className={classNames(
            'relative flex flex-col items-center gap-1',
            isActive ? 'text-text-primary' : 'text-text-tertiary',
          )}
        >
          <TabIcon tab={tab} active={isActive} />
          {!minimized && <span className="typo-caption2">{tab.label}</span>}
        </span>
      );
    })}
  </nav>
);

// MobilePostFloatingBar: rounded pill floating above the tab bar.
export const TodayEngagementPill = ({
  post,
}: {
  post: MockPost;
}): ReactElement => (
  <div className="map-elevated absolute inset-x-3 bottom-3 z-1 flex h-12 items-center justify-between rounded-16 border border-border-subtlest-tertiary bg-background-popover px-4 text-text-secondary typo-callout">
    <span className="flex items-center gap-1.5">
      <UpvoteIcon size={IconSize.Small} />
      {post.upvotes}
    </span>
    <DownvoteIcon size={IconSize.Small} />
    <span className="flex items-center gap-1.5">
      <DiscussIcon size={IconSize.Small} />
      {post.comments}
    </span>
    <BookmarkIcon size={IconSize.Small} />
    <LinkIcon size={IconSize.Small} />
  </div>
);

// Proposed: the engagement bar IS the bottom bar of the post screen (M3:
// toolbar on secondary screens, nav bar on primary ones, never both).
export const ProposedPostBar = ({ post }: { post: MockPost }): ReactElement => (
  <div className="flex items-center gap-2 border-t border-border-subtlest-tertiary bg-background-default/[0.88] px-3 pb-5 pt-2 backdrop-blur-xl">
    <span className="flex h-10 flex-1 items-center rounded-12 bg-surface-float px-3 text-text-quaternary typo-footnote">
      Add a comment
    </span>
    <span className="flex h-10 items-center gap-1 rounded-12 px-2 text-text-secondary typo-footnote">
      <UpvoteIcon size={IconSize.Medium} />
      {post.upvotes}
    </span>
    <span className="flex h-10 items-center gap-1 rounded-12 px-2 text-text-secondary typo-footnote">
      <DiscussIcon size={IconSize.Medium} />
      {post.comments}
    </span>
    <IconButton className="size-10">
      <BookmarkIcon size={IconSize.Medium} />
    </IconButton>
    <IconButton className="size-10">
      <ShareIcon size={IconSize.Medium} />
    </IconButton>
  </div>
);

// ---------------------------------------------------------------------------
// Top bars

// MobileFeedActions: logo, then streak / settings / avatar for a member.
export const TodayLogoRow = ({
  loggedIn = true,
}: {
  loggedIn?: boolean;
}): ReactElement => (
  <div
    className={classNames(
      'flex items-center justify-between bg-background-default px-4',
      loggedIn ? 'h-12' : 'h-8',
    )}
  >
    <Logo />
    {loggedIn && (
      <span className="flex items-center gap-1">
        <StreakPill />
        <IconButton>
          <SettingsIcon size={IconSize.Medium} />
        </IconButton>
        <Avatar size={32} />
      </span>
    )}
  </div>
);

export const todayChips = [
  'For you',
  '+',
  '|',
  'Bookmarks',
  'History',
  'Following',
  'Popular',
  'Discussions',
  'Tags',
  'Sources',
  'Leaderboard',
  'Squads',
  'Happening Now',
  'Hot Takes',
  'Game Center',
];

// UnifiedMobileFeedNav: one scrolling strip mixing feeds, lists and places.
export const TodayChips = ({
  active = 'For you',
}: {
  active?: string;
}): ReactElement => (
  <div className="map-scroll-none flex items-center gap-2 overflow-hidden border-b border-border-subtlest-tertiary bg-background-default px-3 py-3">
    {todayChips.map((chip) => {
      if (chip === '|') {
        return (
          <span
            key={chip}
            className="h-5 w-px shrink-0 bg-border-subtlest-tertiary"
          />
        );
      }

      return (
        <span
          key={chip}
          className={classNames(
            'shrink-0 whitespace-nowrap rounded-10 border px-2.5 py-1.5 font-bold typo-callout',
            chip === active
              ? 'border-border-subtlest-secondary bg-surface-float text-text-primary'
              : 'border-transparent text-text-tertiary',
          )}
        >
          {chip}
        </span>
      );
    })}
  </div>
);

// Home feeds: For you, Headlines, Following (which includes posts from the
// squads you joined), then the member's custom feeds after the plus.
export const feedSegments = ['For you', 'Happening now', 'Following'];

export const SegmentedRow = ({
  segments = feedSegments,
  active = 0,
  trailing,
  className,
  menuIndex,
}: {
  segments?: string[];
  active?: number;
  trailing?: ReactNode;
  className?: string;
  menuIndex?: number;
}): ReactElement => {
  const mapping = useRowMapping();
  return (
  <div
    className={classNames(
      'map-scroll-none flex h-11 items-center gap-1 overflow-hidden bg-background-default px-4',
      className,
    )}
  >
    {segments.map((segment, index) => (
      <span key={segment} className={quietChipClassName(index === active, mapping === RowMapping.OutlinedSegments)}>
        {segment}
        {index === menuIndex && (
          <ArrowIcon size={IconSize.XSmall} className="ml-0.5 rotate-180" />
        )}
      </span>
    ))}
    {trailing}
  </div>
  );
};

// Proposed home header: one flat brand row (logo left, streak and avatar
// right) and one pinned segmented feed row. The brand row does not switch
// states: it slides up with scroll progress `p` (0 = rest, 1 = gone), its
// height shrinking with it so the segments follow without a jump. 92px at
// rest, 44px scrolled, vs 108px fixed today.
export const ProposedHomeHeader = ({
  collapsed,
  progress,
  active = 0,
  withAvatar = true,
  segments = feedSegments,
  menuIndex,
}: {
  collapsed?: boolean;
  progress?: number;
  active?: number;
  withAvatar?: boolean;
  withSearch?: boolean;
  segments?: string[];
  menuIndex?: number;
}): ReactElement => {
  const p = progress ?? (collapsed ? 1 : 0);
  const brandHeight = 48;

  return (
    <div className="bg-background-default">
      <div
        style={{ height: brandHeight * (1 - p) }}
        className="relative overflow-hidden"
      >
        <div
          style={{
            height: brandHeight,
            transform: `translateY(${-brandHeight * p}px)`,
            opacity: 1 - Math.min(1, p * 1.5),
          }}
          className="flex items-center justify-between px-4"
        >
          <Logo />
          <span className="flex items-center gap-2">
            <StreakPill />
            {withAvatar && <HeaderAvatar />}
          </span>
        </div>
      </div>
      <SegmentedRow
        segments={segments}
        active={active}
        menuIndex={menuIndex}
        trailing={
          <span className="ml-auto flex size-8 shrink-0 items-center justify-center text-text-tertiary">
            <PlusIcon size={IconSize.Small} />
          </span>
        }
      />
    </div>
  );
};

// Proposed: the one secondary-screen top bar. Back, title, at most two actions.
export const PageBar = ({
  title,
  subtitle,
  actions,
  leading,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  leading?: ReactNode;
}): ReactElement => (
  <div className="flex h-12 items-center gap-1 border-b border-border-subtlest-tertiary bg-background-default/[0.88] px-1 backdrop-blur-xl">
    {leading ?? (
      <IconButton>
        <ArrowIcon size={IconSize.Medium} className="-rotate-90" />
      </IconButton>
    )}
    <div className="flex min-w-0 flex-1 flex-col">
      {title && (
        <span className="truncate font-bold text-text-primary typo-callout">
          {title}
        </span>
      )}
      {subtitle && (
        <span className="truncate text-text-tertiary typo-caption1">
          {subtitle}
        </span>
      )}
    </div>
    {actions}
  </div>
);

// GoBackHeaderMobile + PostHeaderActions on the post page today.
export const TodayPostBar = (): ReactElement => (
  <div className="flex h-12 items-center border-b border-border-subtlest-tertiary bg-background-default px-2">
    <IconButton>
      <ArrowIcon size={IconSize.Small} className="-rotate-90" />
    </IconButton>
    <span className="flex-1" />
    <span className="flex items-center gap-1.5 px-2 text-text-secondary typo-footnote">
      <OpenLinkIcon size={IconSize.Small} />
      Read post
    </span>
    <IconButton>
      <MenuIcon size={IconSize.Small} />
    </IconButton>
  </div>
);

// ---------------------------------------------------------------------------
// Bodies

export const SourceAvatar = ({
  post,
  size = 'size-8',
}: {
  post: MockPost;
  size?: string;
}): ReactElement => (
  <span
    className={classNames(
      'flex shrink-0 items-center justify-center rounded-max font-bold typo-caption2',
      size,
      post.sourceTone,
    )}
  >
    {post.sourceInitials}
  </span>
);

export const PostCover = ({
  post,
  className,
}: {
  post: MockPost;
  className?: string;
}): ReactElement => (
  <div className={classNames('w-full rounded-12', post.cover, className)} />
);

export const FeedCard = ({
  post,
  compact,
}: {
  post: MockPost;
  compact?: boolean;
}): ReactElement => (
  <article className="flex flex-col gap-3 border-b border-border-subtlest-tertiary px-4 py-4">
    <div className="flex items-center gap-2">
      <SourceAvatar post={post} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-bold typo-footnote">{post.source}</span>
        <span className="text-text-tertiary typo-caption1">
          {post.readTime}m read time · {post.date}
        </span>
      </div>
      <MenuIcon size={IconSize.Small} className="text-text-secondary" />
    </div>
    <h3 className="font-bold leading-snug typo-title3">{post.title}</h3>
    {!compact && <PostCover post={post} className="h-32" />}
    <div className="flex items-center justify-between text-text-tertiary typo-footnote">
      <span className="flex items-center gap-1">
        <UpvoteIcon size={IconSize.Small} />
        {post.upvotes}
      </span>
      <span className="flex items-center gap-1">
        <DiscussIcon size={IconSize.Small} />
        {post.comments}
      </span>
      <BookmarkIcon size={IconSize.Small} />
      <ShareIcon size={IconSize.Small} />
    </div>
  </article>
);

export const FeedList = ({
  items = posts,
  compact,
}: {
  items?: MockPost[];
  compact?: boolean;
}): ReactElement => (
  <div className="flex flex-col">
    {items.map((post, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <FeedCard key={`${post.id}-${index}`} post={post} compact={compact} />
    ))}
  </div>
);

export const PostArticle = ({
  post,
  showReadCta,
}: {
  post: MockPost;
  showReadCta?: boolean;
}): ReactElement => (
  <div className="flex flex-col gap-4 px-4 pb-6 pt-4">
    <div className="flex items-center gap-2">
      <SourceAvatar post={post} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-bold typo-footnote">{post.source}</span>
        <span className="text-text-tertiary typo-caption1">
          {post.date} · {post.readTime}m read time
        </span>
      </div>
    </div>
    <h1 className="font-bold leading-tight typo-title1">{post.title}</h1>
    <p className="text-text-secondary typo-body">{post.summary}</p>
    <div className="flex flex-wrap gap-1.5">
      {post.tags.map((tag) => (
        <span
          key={tag}
          className="rounded-8 bg-surface-float px-2 py-0.5 text-text-tertiary typo-caption1"
        >
          #{tag}
        </span>
      ))}
    </div>
    <PostCover post={post} className="h-40" />
    {showReadCta && (
      <span className="flex h-12 items-center justify-center gap-2 rounded-12 bg-text-primary font-bold text-surface-invert typo-callout">
        <OpenLinkIcon size={IconSize.Small} />
        Read the full post
      </span>
    )}
  </div>
);

export const CommentItem = ({
  comment,
}: {
  comment: MockComment;
}): ReactElement => (
  <div className="flex gap-3 px-4 py-3">
    <span
      className={classNames(
        'flex size-8 shrink-0 items-center justify-center rounded-10 font-bold typo-caption2',
        comment.tone,
      )}
    >
      {comment.initials}
    </span>
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="text-text-tertiary typo-caption1">
        <span className="font-bold text-text-primary">{comment.author}</span>{' '}
        · {comment.time}
      </span>
      <p className="text-text-secondary typo-footnote">{comment.body}</p>
      <span className="flex items-center gap-3 text-text-tertiary typo-caption1">
        <span className="flex items-center gap-1">
          <UpvoteIcon size={IconSize.XSmall} />
          {comment.upvotes}
        </span>
        Reply
      </span>
    </div>
  </div>
);

export const CommentList = ({
  items = defaultComments,
}: {
  items?: MockComment[];
}): ReactElement => (
  <div className="flex flex-col border-t border-border-subtlest-tertiary">
    <span className="px-4 pb-1 pt-4 font-bold typo-callout">Comments</span>
    {items.map((comment) => (
      <CommentItem key={comment.author} comment={comment} />
    ))}
  </div>
);

export const SearchField = ({
  placeholder = 'Search posts, tags, sources, people',
}: {
  placeholder?: string;
}): ReactElement => (
  <div className="flex h-11 items-center gap-2 rounded-12 bg-surface-float px-3 text-text-tertiary typo-callout">
    <SearchIcon size={IconSize.Small} />
    {placeholder}
  </div>
);

const HubRow = ({
  icon,
  label,
  meta,
}: {
  icon: ReactNode;
  label: string;
  meta?: string;
}): ReactElement => (
  <div className="flex h-12 items-center gap-3 px-4">
    <span className="text-text-secondary">{icon}</span>
    <span className="flex-1 typo-callout">{label}</span>
    {meta && <span className="text-text-tertiary typo-footnote">{meta}</span>}
    <ArrowIcon size={IconSize.Small} className="rotate-90 text-text-quaternary" />
  </div>
);

// Proposed Explore tab: the places that live in the chip strip today, as
// rows a thumb can hit, then the Explore feed. Trending tags were dropped in
// round 5 (Tsahi: no reason to show them here).
export const ExploreHub = ({
  withSearch = true,
  withSquads = true,
  withFeed = true,
  withAgents = false,
}: {
  withSearch?: boolean;
  withSquads?: boolean;
  withFeed?: boolean;
  withAgents?: boolean;
}): ReactElement => (
  <div className="flex flex-col gap-5 pb-6 pt-3">
    {withSearch && (
      <div className="px-4">
        <SearchField />
      </div>
    )}
    {withSquads && (
    <div className="flex flex-col gap-2">
      <span className="px-4 text-text-tertiary typo-caption1">Your squads</span>
      <div className="map-scroll-none flex gap-3 overflow-hidden px-4">
        {squads.slice(0, 6).map((squad) => (
          <span key={squad.name} className="flex w-14 flex-col items-center gap-1">
            <span
              className={classNames(
                'flex size-12 items-center justify-center rounded-max font-bold typo-callout',
                squad.tone,
              )}
            >
              {squad.name.slice(0, 1)}
            </span>
            <span className="w-full truncate text-center text-text-secondary typo-caption2">
              {squad.name}
            </span>
          </span>
        ))}
      </div>
    </div>
    )}
    <div className="flex flex-col">
      <HubRow icon={<TrendingIcon size={IconSize.Medium} />} label="Popular" />
      <HubRow icon={<DiscussIcon size={IconSize.Medium} />} label="Discussions" />
      <HubRow icon={<HashtagIcon size={IconSize.Medium} />} label="Tags" />
      <HubRow icon={<SourceIcon size={IconSize.Medium} />} label="Sources" />
      {withAgents && <HubRow icon={<AgentIcon size={IconSize.Medium} />} label="Agents" />}
      {withSquads && (
        <HubRow icon={<SquadIcon size={IconSize.Medium} />} label="Discover squads" />
      )}
      <HubRow icon={<MedalIcon size={IconSize.Medium} />} label="Leaderboard" />
    </div>
    {withFeed && (
      <div className="flex flex-col border-t border-border-subtlest-tertiary">
        <div className="flex items-center justify-between px-4 pb-1 pt-4">
          <span className="font-bold typo-title3">Explore feed</span>
          <span className="flex items-center gap-0.5 text-text-secondary typo-footnote">
            Popular
            <ArrowIcon size={IconSize.XSmall} className="rotate-180" />
          </span>
        </div>
        <FeedList items={[...posts, ...posts]} />
      </div>
    )}
  </div>
);

// The You page behind the avatar: everything the gear, the avatar menu and
// the chip lists do today, plus your progress (achievements, streak, DevCard,
// hot takes, game center), which Tsahi placed here and not on the profile.
export const YouHub = (): ReactElement => (
  <div className="flex flex-col pb-6">
    <div className="flex items-center gap-3 px-4 py-4">
      <Avatar size={48} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-bold typo-title3">Maya Chen</span>
        <span className="text-text-tertiary typo-footnote">
          @mayachen · 1,240 reputation
        </span>
      </div>
    </div>
    <div className="mx-4 mb-2 flex h-11 items-center justify-center gap-2 rounded-12 border border-border-subtlest-tertiary font-bold typo-callout">
      <UserIcon size={IconSize.Small} />
      View profile
    </div>
    <div className="flex flex-col">
      <HubRow icon={<DevPlusIcon size={IconSize.Medium} />} label="daily.dev Plus" />
      <HubRow icon={<FilterIcon size={IconSize.Medium} />} label="Custom feeds" meta="2" />
      <HubRow icon={<SquadIcon size={IconSize.Medium} />} label="My squads" meta="4" />
      <HubRow icon={<AddUserIcon size={IconSize.Medium} />} label="Following" />
      <HubRow icon={<BookmarkIcon size={IconSize.Medium} />} label="Bookmarks" />
      <HubRow icon={<TimerIcon size={IconSize.Medium} />} label="History" />
    </div>
    <div className="mt-2 flex flex-col border-t border-border-subtlest-tertiary pt-2">
      <span className="px-4 pb-1 pt-1 text-text-tertiary typo-caption1">Your progress</span>
      <HubRow icon={<MedalIcon size={IconSize.Medium} />} label="Achievements" meta="12" />
      <HubRow icon={<HotIcon size={IconSize.Medium} />} label="Streak" meta="34 days" />
      <HubRow icon={<DevCardIcon size={IconSize.Medium} />} label="DevCard" />
      <HubRow icon={<MegaphoneIcon size={IconSize.Medium} />} label="Hot takes" />
      <HubRow icon={<MagicIcon size={IconSize.Medium} />} label="Game center" />
    </div>
    <div className="mt-2 flex flex-col border-t border-border-subtlest-tertiary pt-2">
      <HubRow icon={<CoreFlatIcon size={IconSize.Medium} />} label="Core wallet" />
      <HubRow icon={<AddUserIcon size={IconSize.Medium} />} label="Invite friends" />
      <HubRow icon={<SettingsIcon size={IconSize.Medium} />} label="Settings" />
    </div>
  </div>
);

// FooterPlusButton drawer today, and the proposed Create sheet: same three
// options, reached from the centre tab instead of a floating button.
export const CreateSheet = ({
  title = 'Create',
}: {
  title?: string;
}): ReactElement => (
  <div className="absolute inset-0 flex flex-col justify-end bg-overlay-quaternary-onion">
    <div className="map-sheet-in flex flex-col gap-1 rounded-t-24 bg-background-default px-4 pb-8 pt-3">
      <span className="mx-auto mb-2 h-1 w-9 rounded-2 bg-border-subtlest-secondary" />
      <span className="px-2 pb-2 font-bold typo-title3">{title}</span>
      {[
        { icon: <EditIcon size={IconSize.Medium} />, label: 'New post' },
        { icon: <LinkIcon size={IconSize.Medium} />, label: 'Share a link' },
        { icon: <PollIcon size={IconSize.Medium} />, label: 'Poll' },
      ].map((item) => (
        <span
          key={item.label}
          className="flex h-12 items-center gap-3 rounded-12 px-2 typo-callout"
        >
          <span className="text-text-secondary">{item.icon}</span>
          {item.label}
        </span>
      ))}
    </div>
  </div>
);

export const TodaySearchHeader = (): ReactElement => (
  <div className="flex flex-col bg-background-default">
    <div className="px-2 pb-8 pt-2">
      <div className="flex h-12 items-center gap-3 rounded-14 bg-surface-float px-3 text-text-tertiary typo-body">
        <AiIcon size={IconSize.Medium} />
        Search
      </div>
    </div>
    <SegmentedRow
      segments={['Popular', 'By upvotes', 'By comments', 'By date']}
      trailing={
        <IconButton className="ml-auto size-8">
          <SortIcon size={IconSize.Small} />
        </IconButton>
      }
    />
  </div>
);

export const TodayHeadlinesHeader = (): ReactElement => (
  <div className="flex flex-col bg-background-default">
    <div className="flex items-center justify-between px-4 pb-2 pt-3">
      <span className="bg-gradient-to-r from-accent-cheese-default to-accent-avocado-default bg-clip-text font-bold text-transparent typo-title1">
        Happening Now
      </span>
      <LinkIcon size={IconSize.Small} className="text-text-secondary" />
    </div>
    <SegmentedRow segments={['Headlines', 'All', 'Agentic', 'Security', 'Career']} />
  </div>
);

export const TodayTagHeader = (): ReactElement => (
  <div className="flex flex-col bg-background-default">
    <SegmentedRow segments={['All Tags', 'JavaScript', 'Web Development', 'React']} active={1} />
    <div className="flex flex-col items-center gap-2 px-4 pb-4 pt-8 text-center">
      <span className="font-bold typo-mega3">JavaScript</span>
      <span className="text-text-tertiary typo-footnote">Tag · 54.1K stories</span>
      <p className="text-text-secondary typo-callout">
        JavaScript news and updates for the language that runs in browsers and
        increasingly on servers.
      </p>
      <span className="mt-2 flex h-10 items-center gap-2 rounded-12 bg-text-primary px-4 font-bold text-surface-invert typo-callout">
        <PlusIcon size={IconSize.Small} />
        Follow
      </span>
    </div>
  </div>
);

export const TagHero = (): ReactElement => (
  <div className="flex flex-col items-center gap-2 px-4 pb-4 pt-16 text-center">
    <span className="font-bold typo-mega3">JavaScript</span>
    <span className="text-text-tertiary typo-footnote">Tag · 54.1K stories</span>
    <p className="text-text-secondary typo-callout">
      JavaScript news and updates for the language that runs in browsers and
      increasingly on servers.
    </p>
    <span className="mt-2 flex h-10 items-center gap-2 rounded-12 bg-text-primary px-4 font-bold text-surface-invert typo-callout">
      <PlusIcon size={IconSize.Small} />
      Follow
    </span>
  </div>
);

export const ProposedTagHeader = (): ReactElement => (
  <div className="flex flex-col bg-background-default">
    <PageBar
      title="#javascript"
      subtitle="54.1K stories"
      actions={
        <>
          <span className="mr-1 flex h-8 items-center rounded-10 bg-text-primary px-3 font-bold text-surface-invert typo-footnote">
            Follow
          </span>
          <IconButton>
            <MenuIcon size={IconSize.Small} />
          </IconButton>
        </>
      }
    />
  </div>
);


// Production's tag page keeps a Roadmaps section (behind showRoadmap) with
// one roadmap.sh card; the new design keeps it under the hero.
export const RoadmapSection = ({ tag = 'React' }: { tag?: string }): ReactElement => (
  <div className="flex flex-col gap-2 px-4 pb-4 pt-2">
    <span className="font-bold typo-title3">Roadmaps</span>
    <div className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-max bg-text-primary font-bold text-surface-invert typo-caption1">
        rm
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-bold typo-callout">Comprehensive roadmap for {tag}</span>
        <span className="text-text-tertiary typo-footnote">By roadmap.sh</span>
      </div>
      <OpenLinkIcon size={IconSize.Small} className="text-text-tertiary" />
    </div>
  </div>
);

export const HeadlineRows = (): ReactElement => (
  <div className="flex flex-col px-4">
    {[
      'CPU shortages hit cloud customers as AI agents drain capacity',
      'OpenAI discloses rogue agents posted 53 user images online',
      'SpaceX Starship reaches Earth orbit for the first time',
      'Citrix patches two actively exploited NetScaler zero-days',
    ].map((title, index) => (
      <div
        key={title}
        className="flex items-center gap-3 border-b border-border-subtlest-tertiary py-3.5"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="font-bold leading-snug typo-callout">{title}</span>
          <span className="text-text-tertiary typo-caption1">{index + 2}h ago</span>
        </div>
        <ArrowIcon size={IconSize.Small} className="rotate-90 text-text-tertiary" />
      </div>
    ))}
  </div>
);

export const Dim = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="pointer-events-none opacity-40">{children}</div>
);
