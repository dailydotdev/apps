import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { useShareOrCopyLink } from '@dailydotdev/shared/src/hooks/useShareOrCopyLink';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  AddUserIcon,
  ArrowIcon,
  BellIcon,
  CardLayout,
  EarthIcon,
  EditIcon,
  ExitIcon,
  FeedbackIcon,
  FlagIcon,
  HashtagIcon,
  LockIcon,
  GitHubIcon,
  LinkIcon,
  LinkedInIcon,
  MedalBadgeIcon,
  MenuIcon,
  PinIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  SourceIcon,
  TimerIcon,
  TourIcon,
  TrashIcon,
  TwitterIcon,
  AnalyticsIcon,
  MegaphoneIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BoostIcon } from '@dailydotdev/shared/src/components/icons/Boost';
import type { Entry } from './data';
import {
  companyLinks,
  feedEntries,
  analyticsDays,
  analyticsDiscovery,
  analyticsEngagement,
  formatCount,
  formatSince,
  jobs,
  pinnedEntry,
  squad,
  stack,
  rules,
  team,
  moderationQueueCount,
} from './data';
import {
  Avatar,
  CardList,
  Facepile,
  isAdmin,
  isBlocked,
  isJoined,
  isLoggedIn,
  isStaff,
  linkIcon,
  VerifiedMark,
  VerifiedSeal,
  Viewer,
} from './kit';
import { ComposerEntry } from './composer';
import {
  ContentSource,
  MemberRole,
  PostingGate,
  postingState,
  useWorkspace,
} from './state';

// The squad's Home, built on the profile page's skeleton so a person and a
// squad read as the same kind of thing. Same card, same cover height, same
// avatar seat, same name/meta/actions/stats stack, same divide-y sections
// below (About, Stack, Activity, Experiences becomes Open roles), and the
// same right column of widgets. Where the profile shows Reading Overview,
// the squad shows its posting overview; where it lists Active in these
// Squads, the squad lists its team.

export const Separator = (): ReactElement => (
  <span className="mx-1 text-text-secondary typo-subhead">•</span>
);

/* -------------------------------------------------------------- header */

/** ProfileHeader, for a squad. */
const MetaItem = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'flex items-center gap-2 whitespace-nowrap',
      className,
    )}
  >
    <span aria-hidden className="text-text-quaternary">
      ·
    </span>
    {children}
  </span>
);

export const SquadHeader = ({
  viewer,
  standalone,
  onOpenMembers,
  extra,
  onManage,
}: {
  viewer: Viewer;
  standalone: boolean;
  onOpenMembers?: () => void;
  extra?: ReactNode;
  /** Opens a Manage page from the options menu (moderators and admins). */
  onManage?: (id: string) => void;
}): ReactElement => {
  const { config } = useWorkspace();
  // Native share sheet on phones, copy link elsewhere, as SquadOptionsButton.
  const [, onShare] = useShareOrCopyLink({
    link: squad.permalink,
    text: `Check out ${squad.name} on daily.dev`,
    logObject: () => ({ event_name: LogEvent.ShareSource }),
  });
  const following = isJoined(viewer) && !isAdmin(viewer);
  const canFollow = standalone && !isJoined(viewer);
  // X's rule: one text-only button at the end of the row, Follow until you
  // do, Following after. On phones it leaves the row for a full-width
  // button under the stats.
  // Boost is the admin's Follow: last in the row on larger screens, and
  // beside Share page under the stats on phones.
  const boost =
    isAdmin(viewer) && config.isPublic
      ? (size = ButtonSize.Small, className?: string): ReactElement => (
          <Button
            variant={ButtonVariant.Primary}
            size={size}
            icon={<BoostIcon secondary size={IconSize.Small} />}
            className={className}
          >
            {config.campaign ? 'View boost' : 'Boost'}
          </Button>
        )
      : null;
  const follow =
    following || canFollow
      ? (size: ButtonSize, className?: string): ReactElement =>
          following ? (
            <Button
              variant={ButtonVariant.Subtle}
              size={size}
              className={className}
            >
              Following
            </Button>
          ) : (
            <Button
              variant={ButtonVariant.Primary}
              size={size}
              className={className}
              disabled={isBlocked(viewer) || !config.isPublic}
              title={
                isBlocked(viewer)
                  ? 'You are not allowed to follow this Squad'
                  : undefined
              }
            >
              {!config.isPublic
                ? 'Invite only'
                : isLoggedIn(viewer)
                ? 'Follow'
                : 'Sign up to follow'}
            </Button>
          )
      : null;

  return (
    <div className="relative w-full">
      <div className="relative h-28 overflow-hidden tablet:h-36 laptop:rounded-t-[0.9375rem]">
        <img
          src={squad.headerImage}
          alt="Cover"
          className={classNames(
            'h-full w-full object-cover',
            squad.headerImagePosition === 'top' && 'object-top',
            squad.headerImagePosition === 'bottom' && 'object-bottom',
          )}
        />
      </div>
      <div className="flex flex-col px-4 pb-5 tablet:px-6">
        {/* Logo and actions share one baseline, so the identity column below
          is text only and every row starts at the same x. */}
        <div className="-mt-8 flex items-end justify-between gap-4 tablet:-mt-12">
          <img
            src={squad.image}
            alt="Logo"
            className="relative size-20 shrink-0 rounded-full bg-background-default object-cover ring-4 ring-background-default tablet:size-[6.5rem]"
          />
          <div className="flex items-center gap-2 pb-1">
            {isAdmin(viewer) && (
              <Button
                variant={ButtonVariant.Subtle}
                size={ButtonSize.Small}
                icon={<EditIcon />}
                aria-label="Edit page"
                title="Edit page"
                onClick={() => onManage?.('manage-details')}
              />
            )}
            {extra}
            {isJoined(viewer) && <NotificationsMenu viewer={viewer} />}
            <span
              className={classNames(
                'flex',
                isAdmin(viewer) && 'hidden tablet:flex',
              )}
            >
              <Button
                variant={ButtonVariant.Subtle}
                size={ButtonSize.Small}
                icon={<LinkIcon />}
                aria-label="Share"
                title="Share"
                onClick={onShare}
              />
            </span>
            <MoreMenu viewer={viewer} onManage={onManage} />
            {boost && <span className="hidden tablet:flex">{boost()}</span>}
            {follow && (
              <span className="hidden tablet:flex">
                {follow(ButtonSize.Small)}
              </span>
            )}
          </div>
        </div>
        {isBlocked(viewer) && (
          <div className="mt-4 flex items-center gap-2 rounded-12 bg-surface-float px-3 py-2 text-text-tertiary typo-footnote">
            <LockIcon size={IconSize.Small} />
            You no longer have access to this Squad. Contact a moderator if you
            think this is a mistake.
          </div>
        )}
        <div className="mt-4 flex flex-col gap-1">
          <h1 className="flex flex-wrap items-center gap-x-2 gap-y-1 font-bold text-text-primary typo-title2">
            {squad.name}
            <VerifiedMark label={false} />
          </h1>
          <p className="text-text-secondary typo-body">{squad.tagline}</p>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-text-tertiary typo-footnote">
          <span className="flex items-center gap-1.5 text-text-secondary">
            <img src={squad.image} alt="" className="size-4 rounded-full" />
            {squad.company.website}
          </span>
          {(config.featured || !config.isPublic) && (
            <MetaItem>
              <PrivacyChip />
            </MetaItem>
          )}
          {config.isPublic && config.category && (
            <MetaItem>
              <a
                href="/squads/discover"
                className="text-text-link hover:underline"
                title={`View all squads in ${config.category}`}
              >
                {config.category}
              </a>
            </MetaItem>
          )}
          <MetaItem className="hidden tablet:flex">
            {squad.company.location}
          </MetaItem>
          <MetaItem className="hidden tablet:flex">
            Since {formatSince(squad.createdAt)}
          </MetaItem>
        </div>
        <SquadStats onOpenMembers={onOpenMembers} />
        {follow && (
          <div className="mt-4 flex tablet:hidden">
            {follow(ButtonSize.Medium, 'w-full')}
          </div>
        )}
        {isAdmin(viewer) && (
          <div className="mt-4 flex gap-2 tablet:hidden">
            {boost?.(ButtonSize.Medium, 'flex-1')}
            <Button
              variant={ButtonVariant.Subtle}
              size={ButtonSize.Medium}
              className="flex-1"
              onClick={onShare}
            >
              Share page
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Production's SquadPrivacyState, as a word in the meta line instead of a
 * button, and only when it says something: Featured or Private. A plain
 * public page is the default and does not announce it.
 */
const PrivacyChip = (): ReactElement => {
  const { config } = useWorkspace();
  const [icon, label] = config.featured
    ? [<SourceIcon key="f" size={IconSize.XSmall} secondary />, 'Featured']
    : config.isPublic
    ? [<EarthIcon key="p" size={IconSize.XSmall} />, 'Public']
    : [<LockIcon key="l" size={IconSize.XSmall} />, 'Private'];

  return (
    <span
      className={classNames(
        'flex items-center gap-1',
        config.featured && 'font-bold text-accent-cabbage-default',
      )}
    >
      {icon}
      {label} squad
    </span>
  );
};

type MenuEntry =
  | {
      icon: ReactElement;
      label: string;
      danger?: boolean;
      badge?: number;
      onSelect?: () => void;
    }
  | { section: string }
  | { divider: true };

const MenuList = ({
  items,
  onClose,
}: {
  items: MenuEntry[];
  onClose: () => void;
}): ReactElement => (
  <ul className="sq-elevated absolute right-0 top-full z-popup mt-1 flex w-64 flex-col rounded-12 bg-background-default p-1">
    {items.map((item, index) => {
      if ('divider' in item) {
        return (
          <li
            // eslint-disable-next-line react/no-array-index-key
            key={`divider-${index}`}
            aria-hidden
            className="my-1 h-px bg-border-subtlest-tertiary"
          />
        );
      }
      if ('section' in item) {
        return (
          <li
            key={item.section}
            className="px-2 pb-1 pt-2 font-bold uppercase tracking-[0.12em] text-text-quaternary typo-caption2"
          >
            {item.section}
          </li>
        );
      }
      return (
        <li key={item.label}>
          <button
            type="button"
            onClick={() => {
              item.onSelect?.();
              onClose();
            }}
            className={classNames(
              'flex w-full items-center gap-2 rounded-8 px-2 py-1.5 text-left typo-callout hover:bg-surface-float',
              item.danger
                ? 'text-status-error'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {item.icon}
            <span className="min-w-0 flex-1">{item.label}</span>
            {!!item.badge && (
              <span className="sq-nums rounded-8 bg-surface-float px-1.5 font-bold text-text-tertiary typo-caption2">
                {item.badge}
              </span>
            )}
          </button>
        </li>
      );
    })}
  </ul>
);

/**
 * Production's SquadHeaderMenu, item for item, gated the same way: Add to
 * custom feed, Squad settings (Edit), Invitation link (public, logged in,
 * not a member), Learn how Squads work, Feedback (members), Report Squad,
 * Delete Squad (Delete), Leave Squad (members who are not the admin). Award
 * moved here from the bar.
 */
const MoreMenu = ({
  viewer,
  onManage,
}: {
  viewer: Viewer;
  onManage?: (id: string) => void;
}): ReactElement => {
  const [open, setOpen] = useState(false);
  const { config, source } = useWorkspace();
  const small = (icon: ReactElement) => icon;
  // The team's pages and production's Squad settings in one place: the
  // options menu opens with Manage for moderators and admins.
  const manageItems: MenuEntry[] = isStaff(viewer)
    ? [
        { section: 'Manage' },
        {
          icon: <TimerIcon size={IconSize.Small} />,
          label: 'Moderation',
          badge: moderationQueueCount,
          onSelect: () => onManage?.('moderation'),
        },
        ...(isAdmin(viewer) && source === ContentSource.Feed
          ? [
              {
                icon: <MegaphoneIcon size={IconSize.Small} />,
                label: 'Content feed',
                onSelect: () => onManage?.('feed'),
              },
            ]
          : []),
        ...(isAdmin(viewer)
          ? [
              {
                icon: <AnalyticsIcon size={IconSize.Small} />,
                label: 'Analytics',
                onSelect: () => onManage?.('analytics'),
              },
              {
                icon: <SettingsIcon size={IconSize.Small} />,
                label: 'Settings',
                onSelect: () => onManage?.('settings'),
              },
            ]
          : []),
        { divider: true },
      ]
    : [];
  const items: MenuEntry[] = [
    ...manageItems,
    {
      icon: small(<HashtagIcon size={IconSize.Small} />),
      label: 'Add to custom feed',
    },
    ...(!isJoined(viewer) &&
    isLoggedIn(viewer) &&
    !isBlocked(viewer) &&
    config.isPublic
      ? [
          {
            icon: small(<AddUserIcon size={IconSize.Small} />),
            label: 'Invitation link',
          },
        ]
      : []),
    ...(isLoggedIn(viewer) && !isAdmin(viewer)
      ? [
          {
            icon: small(<MedalBadgeIcon size={IconSize.Small} />),
            label: 'Award the squad',
          },
        ]
      : []),
    {
      icon: small(<TourIcon size={IconSize.Small} />),
      label: 'Learn how Squads work',
    },
    ...(isJoined(viewer)
      ? [
          {
            icon: small(<FeedbackIcon size={IconSize.Small} />),
            label: 'Feedback',
          },
        ]
      : []),
    { icon: small(<FlagIcon size={IconSize.Small} />), label: 'Report Squad' },
    ...(isAdmin(viewer)
      ? [
          {
            icon: small(<TrashIcon size={IconSize.Small} />),
            label: 'Delete Squad',
            danger: true,
          },
        ]
      : []),
    ...(isJoined(viewer) && !isAdmin(viewer)
      ? [
          {
            icon: small(<ExitIcon size={IconSize.Small} />),
            label: 'Unfollow',
          },
        ]
      : []),
  ];

  return (
    <div className="relative">
      <Button
        variant={ButtonVariant.Subtle}
        size={ButtonSize.Small}
        icon={<MenuIcon />}
        aria-label="Squad options"
        title={isStaff(viewer) ? 'Manage and options' : 'Squad options'}
        onClick={() => setOpen((value) => !value)}
      />
      {open && <MenuList items={items} onClose={() => setOpen(false)} />}
    </div>
  );
};

/**
 * Production's SquadNotificationsModal behind the bell: three switches,
 * the third for the admin only.
 */
const NotificationsMenu = ({ viewer }: { viewer: Viewer }): ReactElement => {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({
    feed: true,
    posts: true,
    members: false,
  });
  const rows: [keyof typeof state, string][] = [
    ['feed', 'Show new posts on For You'],
    ['posts', 'Notify me about new posts'],
    ...(isAdmin(viewer)
      ? ([['members', 'Notify me about new followers']] as [
          keyof typeof state,
          string,
        ][])
      : []),
  ];

  return (
    <div className="relative">
      <Button
        variant={ButtonVariant.Subtle}
        size={ButtonSize.Small}
        icon={<BellIcon secondary={open} />}
        aria-label="Squad notifications settings"
        onClick={() => setOpen((value) => !value)}
      />
      {open && (
        <div className="sq-elevated absolute right-0 top-full z-popup mt-1 flex w-72 flex-col gap-1 rounded-12 bg-background-default p-2">
          <span className="px-2 py-1 font-bold text-text-primary typo-callout">
            Notifications
          </span>
          {rows.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                setState((value) => ({ ...value, [key]: !value[key] }))
              }
              className="flex items-center justify-between gap-3 rounded-8 px-2 py-1.5 text-left text-text-secondary typo-callout hover:bg-surface-float"
            >
              {label}
              <span
                className={classNames(
                  'relative h-4 w-7 shrink-0 rounded-[999px] transition-colors',
                  state[key] ? 'bg-accent-cabbage-default' : 'bg-surface-hover',
                )}
              >
                <span
                  className={classNames(
                    'absolute top-0.5 size-3 rounded-[999px] bg-text-primary transition-transform',
                    state[key] ? 'translate-x-3.5' : 'translate-x-0.5',
                  )}
                />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * UserStats, straightened: one strip under a hairline, tabular figures, and
 * the member faces on the Members figure so the social proof does not need
 * a row of its own.
 */
const SquadStats = ({
  onOpenMembers,
}: {
  onOpenMembers?: () => void;
}): ReactElement => {
  const Item = ({ amount, title }: { amount: number; title: string }) => (
    <span className="flex items-baseline gap-1">
      <b className="sq-nums text-text-primary typo-callout">
        {formatCount(amount)}
      </b>
      <span className="text-text-tertiary typo-footnote">{title}</span>
    </span>
  );

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border-subtlest-tertiary pt-4">
      <button
        type="button"
        onClick={onOpenMembers}
        className="flex items-center gap-2 rounded-8 text-left transition-opacity hover:opacity-80"
      >
        <Facepile members={team.slice(3)} max={3} size={1.25} />
        <Item amount={squad.membersCount} title="Followers" />
      </button>
      <Item amount={squad.totalPosts} title="Posts" />
      <Item amount={squad.totalViews} title="Views" />
      <Item amount={squad.totalUpvotes} title="Upvotes" />
      {squad.totalAwards > 0 && (
        <button
          type="button"
          className="rounded-8 text-left transition-opacity hover:opacity-80"
          title="See awards"
        >
          <Item amount={squad.totalAwards} title="Awards" />
        </button>
      )}
    </div>
  );
};

/* ------------------------------------------------------------- sections */

export const SectionTitle = ({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}): ReactElement => (
  <div className="flex items-center justify-between">
    <span className="font-bold text-text-primary typo-body">{children}</span>
    {action}
  </div>
);

const social = [
  {
    id: 'website',
    icon: <LinkIcon size={IconSize.XSmall} />,
    label: squad.company.website,
  },
  {
    id: 'github',
    icon: <GitHubIcon size={IconSize.XSmall} />,
    label: 'GitHub',
  },
  { id: 'x', icon: <TwitterIcon size={IconSize.XSmall} />, label: 'X' },
  {
    id: 'linkedin',
    icon: <LinkedInIcon size={IconSize.XSmall} />,
    label: 'LinkedIn',
  },
];

/** AboutMe, for a squad: the links row, then the readme. */
const AboutSection = (): ReactElement => (
  <div className="flex flex-col gap-4 py-4">
    <SectionTitle>About</SectionTitle>
    <div className="flex flex-wrap items-center gap-2">
      {social.map((link) => (
        <Button
          key={link.id}
          variant={ButtonVariant.Subtle}
          size={ButtonSize.Small}
          icon={link.icon}
          aria-label={link.label}
        />
      ))}
    </div>
    <div className="flex flex-col gap-3 text-text-primary typo-body">
      <p className="font-bold">
        Every release, explained by the people who built it. 👋
      </p>
      <p>
        This is where the {squad.name} team announces what shipped, what is in
        beta, and why we changed something. Every post is written by the
        engineer behind it, and the comments are where we take the bug reports.
      </p>
      <p>What you will find here</p>
      <p>
        <b>🚀 Releases:</b> a post for every feature, the week it ships.
      </p>
      <p>
        <b>🧪 Betas:</b> early access, and how to turn it on.
      </p>
      <p>
        <b>🛠️ Fixes:</b> the monthly release notes, pinned at the top.
      </p>
      <p>
        Something broke? Post it here with the #bug tag and someone from the
        team picks it up.
      </p>
    </div>
  </div>
);

/** ProfileUserStack, for a squad. Same rows, same title row. */
const StackSection = ({ viewer }: { viewer: Viewer }): ReactElement => (
  <div className="flex flex-col gap-4 py-4">
    <SectionTitle
      action={
        isStaff(viewer) && (
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.XSmall}
            icon={<EditIcon />}
            aria-label="Edit stack"
          />
        )
      }
    >
      Stack and tools
    </SectionTitle>
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-text-tertiary typo-footnote">
        Built with
      </div>
      <div className="grid grid-cols-2 gap-2">
        {stack.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-3 rounded-12 border border-border-subtlest-tertiary px-3 pb-2.5 pt-2 hover:border-border-subtlest-secondary"
          >
            <div className="flex min-w-0 items-center gap-2">
              <img src={item.image} alt="" className="size-6 rounded-6" />
              <span className="truncate font-bold text-text-primary typo-callout">
                {item.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ---------------------------------------------------------------- posts */

/**
 * Reddit's feed controls, in our clothes: one sort menu instead of a row of
 * tabs, the grid / list toggle the product already has, and search. No tab
 * bar anywhere on the page; the sidebar is the navigation.
 */
export const PostsToolbar = ({
  sort,
  view = 'grid',
  children,
}: {
  sort: string;
  view?: 'grid' | 'list';
  children?: ReactNode;
}): ReactElement => (
  <div className="flex items-center gap-2">
    <Button
      variant={ButtonVariant.Subtle}
      size={ButtonSize.Small}
      icon={<ArrowIcon className="rotate-180" />}
      iconPosition={ButtonIconPosition.Right}
    >
      {sort}
    </Button>
    {children}
    <div className="ml-auto flex items-center gap-1">
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        icon={<SearchIcon />}
        aria-label="Search"
      />
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        icon={<CardLayout secondary={view === 'list'} />}
        aria-label="Toggle layout"
      />
    </div>
  </div>
);

/**
 * Reddit's community highlight: the pinned post as one compact card above
 * the feed, thumbnail and all, instead of a text row.
 */
export const Highlight = ({ entry }: { entry: Entry }): ReactElement => (
  <div className="flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-3">
    {entry.image ? (
      <img
        src={entry.image}
        alt=""
        className="h-14 w-24 shrink-0 rounded-10 object-cover"
      />
    ) : (
      <span className="flex h-14 w-24 shrink-0 items-center justify-center rounded-10 bg-background-default text-text-tertiary">
        <PinIcon size={IconSize.Medium} />
      </span>
    )}
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="flex items-center gap-1.5 text-text-tertiary typo-caption1">
        <PinIcon size={IconSize.XSmall} />
        Pinned by {entry.author.name}
      </span>
      <span className="line-clamp-1 font-bold text-text-primary typo-callout">
        {entry.title}
      </span>
      <span className="line-clamp-1 text-text-tertiary typo-footnote">
        {entry.summary}
      </span>
    </div>
  </div>
);

/**
 * Production's SharePostBar, both halves: the composer when the viewer may
 * post, the lock card with its exact copy when not. A review note when the
 * squad approves member posts first, and the member's own queue above it.
 */
export const SquadComposer = ({
  viewer,
  onOpenPending,
}: {
  viewer: Viewer;
  onOpenPending?: () => void;
}): ReactElement => {
  const { config } = useWorkspace();
  const state = postingState(viewer, config);

  return (
    <div className="flex flex-col gap-3">
      {isJoined(viewer) && config.ownPending > 0 && (
        <button
          type="button"
          onClick={onOpenPending}
          className="mx-4 flex items-center gap-2 rounded-12 bg-surface-float px-3 py-2 text-left text-text-secondary typo-footnote hover:text-text-primary tablet:mx-0"
        >
          <TimerIcon size={IconSize.Small} className="text-text-tertiary" />
          <span className="min-w-0 flex-1">
            <b className="sq-nums text-text-primary">{config.ownPending}</b> of
            your posts {config.ownPending === 1 ? 'is' : 'are'} waiting for a
            moderator
          </span>
          <ArrowIcon size={IconSize.XSmall} className="rotate-90" />
        </button>
      )}
      {state.canPost ? (
        <ComposerEntry canPoll={isStaff(viewer)} reviewed={state.reviewed} />
      ) : (
        <div className="flex items-center gap-2 border-b border-border-subtlest-tertiary px-4 py-4 text-text-quaternary typo-callout tablet:rounded-16 tablet:border">
          <LockIcon size={IconSize.Small} />
          {state.reason}
        </div>
      )}
    </div>
  );
};

/**
 * Production's SquadFeedHeading toggle, members only: pinned posts fold
 * away per member and the button says how many are hidden.
 */
export const PinnedToggle = ({
  viewer,
}: {
  viewer: Viewer;
}): ReactElement | null => {
  const { config } = useWorkspace();
  const [collapsed, setCollapsed] = useState(config.pinnedCollapsed);

  if (!isJoined(viewer)) {
    return null;
  }

  return (
    <Button
      variant={ButtonVariant.Subtle}
      size={ButtonSize.Small}
      icon={<PinIcon secondary={!collapsed} />}
      onClick={() => setCollapsed((value) => !value)}
    >
      {collapsed ? 'Show pinned posts (1)' : 'Hide pinned posts'}
    </Button>
  );
};

/** The posts, as the page. */
export const PostsArea = ({
  sort,
  entries: list,
  pinned,
  composer,
  toolbarChildren,
}: {
  sort: string;
  entries: Entry[];
  pinned?: Entry;
  composer?: ReactNode;
  toolbarChildren?: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-4 p-6">
    {composer}
    <PostsToolbar sort={sort}>{toolbarChildren}</PostsToolbar>
    {pinned && <Highlight entry={pinned} />}
    <CardList entries={list} />
    <Button
      variant={ButtonVariant.Subtle}
      size={ButtonSize.Medium}
      className="w-full"
    >
      Load more
    </Button>
  </div>
);

const facts = [
  ['Website', squad.company.website],
  ['Headquarters', squad.company.location],
  ['Company size', squad.company.size],
  ['Founded', '2020'],
  ['Category', squad.category],
  ['Verified since', formatSince(squad.createdAt)],
];

/** LinkedIn's overview block and GitHub's verified-domain claim, as one list. */
const CompanySection = (): ReactElement => (
  <div className="flex flex-col gap-4 py-4">
    <SectionTitle>Company</SectionTitle>
    <dl className="grid grid-cols-2 gap-x-8 gap-y-3">
      {facts.map(([label, value]) => (
        <div key={label} className="flex flex-col gap-0.5">
          <dt className="text-text-quaternary typo-caption1">{label}</dt>
          <dd className="text-text-primary typo-callout">{value}</dd>
        </div>
      ))}
    </dl>
  </div>
);

export const TeamSection = (): ReactElement => (
  <div className="flex flex-col gap-4 py-4">
    <SectionTitle>Team</SectionTitle>
    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
      {team.map((member) => (
        <div key={member.id} className="flex items-center gap-3">
          <Avatar member={member} size={2.25} />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-bold text-text-primary typo-callout">
              {member.name}
            </span>
            <span className="truncate text-text-tertiary typo-footnote">
              {member.title}
            </span>
          </div>
          <span className="shrink-0 rounded-6 bg-surface-float px-1.5 py-0.5 text-text-tertiary typo-caption2">
            {member.role}
          </span>
        </div>
      ))}
    </div>
  </div>
);

/* -------------------------------------------------------------- widgets */

export const Widget = ({
  title,
  children,
  action,
}: {
  title: ReactNode;
  children: ReactNode;
  action?: ReactNode;
}): ReactElement => (
  <section className="flex w-full flex-col rounded-16 border border-border-subtlest-tertiary p-4">
    <span className="flex items-center justify-between font-bold text-text-primary typo-callout">
      {title}
      {action}
    </span>
    {children}
  </section>
);

export const Tile = ({
  value,
  label,
}: {
  value: string;
  label: string;
}): ReactElement => (
  <div className="flex flex-col items-center rounded-12 border border-border-subtlest-tertiary px-2 py-2 text-center">
    <span className="font-bold text-text-primary typo-callout">{value}</span>
    <span className="text-text-tertiary typo-footnote">{label}</span>
  </div>
);

const topTags = [
  ['coderabbit', 62],
  ['code-review', 38],
  ['ai', 21],
  ['cli', 17],
  ['security', 14],
  ['devtools', 9],
] as const;

/* Posts per week, 26 weeks. Real cadence: a handful a month. */
const weeks = Array.from({ length: 26 }, (_, week) =>
  Array.from({ length: 7 }, (_, day) => {
    const seed = (week * 7 + day) % 11;
    return seed === 3 || seed === 7 ? 1 : seed === 9 && week % 3 === 0 ? 2 : 0;
  }),
);

/** ReadingOverview, for a squad: what it posts, how often, about what. */
/**
 * Production's squad analytics, in the column: the two discovery numbers,
 * the impressions trend, the engagement that matters most, and the way to
 * the full page. Only for whoever holds the view-analytics permission.
 */
export const AnalyticsWidget = ({
  viewer,
  onOpen,
}: {
  viewer: Viewer;
  onOpen?: () => void;
}): ReactElement | null => {
  if (!isAdmin(viewer)) {
    return null;
  }

  const max = Math.max(
    ...analyticsDays.map((day) => day.organic + day.boosted),
  );

  return (
    <Widget
      title="Analytics"
      action={
        <span className="font-normal text-text-quaternary typo-caption1">
          Last 45 days
        </span>
      }
    >
      <div className="mt-4 grid grid-cols-2 gap-2">
        {analyticsDiscovery.map(([label, value]) => (
          <Tile key={label} value={formatCount(value)} label={label} />
        ))}
      </div>
      <div
        aria-label="Impressions per day"
        className="mt-4 flex h-12 items-end gap-px"
      >
        {analyticsDays.map((day, index) => (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className={classNames(
              'min-w-0 flex-1 rounded-t-[0.125rem]',
              day.boosted ? 'bg-accent-cabbage-default' : 'bg-text-disabled',
            )}
            style={{
              height: `${((day.organic + day.boosted) / max) * 100}%`,
            }}
          />
        ))}
      </div>
      <dl className="mt-4 flex flex-col">
        {analyticsEngagement.slice(0, 4).map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between py-1.5 typo-footnote"
          >
            <dt className="text-text-tertiary">{label}</dt>
            <dd className="sq-nums font-bold text-text-primary">{value}</dd>
          </div>
        ))}
      </dl>
      <Button
        variant={ButtonVariant.Subtle}
        size={ButtonSize.Small}
        className="mt-3 w-full"
        onClick={onOpen}
      >
        View analytics
      </Button>
    </Widget>
  );
};

export const OverviewWidget = (): ReactElement => (
  <Widget title="Activity">
    <div className="mb-3 mt-4 grid grid-cols-2 gap-2">
      <Tile value="12" label="Posts this month" />
      <Tile value={formatCount(squad.totalViews)} label="Views, all time" />
    </div>
    <span className="text-text-tertiary typo-subhead">Top tags by posts</span>
    <div className="my-3 grid grid-cols-2 gap-2">
      {topTags.map(([tag, share]) => (
        <div
          key={tag}
          className="relative flex justify-between overflow-hidden rounded-6 border border-border-subtlest-tertiary px-2 typo-caption1"
        >
          <span
            className="absolute bottom-0 left-0 top-0 bg-action-share-default opacity-40"
            style={{ width: `${share}%` }}
          />
          <span className="relative z-1 my-auto text-text-primary">{tag}</span>
          <span className="relative z-1 my-auto text-text-secondary">
            {share}%
          </span>
        </div>
      ))}
    </div>
    <span className="mb-3 text-text-tertiary typo-subhead">
      Posts in the last months ({squad.totalPosts})
    </span>
    <div className="flex gap-0.5">
      {weeks.map((week, weekIndex) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={weekIndex} className="flex flex-col gap-0.5">
          {week.map((count, dayIndex) => (
            <span
              // eslint-disable-next-line react/no-array-index-key
              key={dayIndex}
              className={classNames(
                'size-2 rounded-6',
                count === 0 && 'border border-border-subtlest-quaternary',
                count === 1 && 'bg-text-disabled',
                count === 2 && 'bg-text-primary',
              )}
            />
          ))}
        </div>
      ))}
    </div>
    <div className="mt-4 flex items-center justify-end text-text-tertiary typo-footnote">
      <span className="mr-2">Less</span>
      <span className="mr-0.5 size-2 rounded-6 border border-border-subtlest-quaternary" />
      <span className="mr-0.5 size-2 rounded-6 bg-text-disabled" />
      <span className="mr-2 size-2 rounded-6 bg-text-primary" />
      More
    </div>
  </Widget>
);

/**
 * Reddit's rules widget, in the column: the titles only, numbered, each row
 * a doorway to the Rules page. A visitor reads the contract before joining
 * without leaving the feed.
 */
export const RulesWidget = ({
  onOpenRules,
  onOpenFaq,
}: {
  onOpenRules?: () => void;
  onOpenFaq?: () => void;
}): ReactElement => (
  <Widget title="Rules">
    <ol className="mt-3 flex flex-col divide-y divide-border-subtlest-tertiary">
      {rules.map(([title], index) => (
        <li key={title}>
          <button
            type="button"
            onClick={onOpenRules}
            className="flex w-full items-center gap-3 py-2 text-left"
          >
            <span className="sq-nums w-4 shrink-0 text-text-quaternary typo-caption1">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 truncate text-text-primary typo-footnote">
              {title}
            </span>
            <ArrowIcon
              size={IconSize.XSmall}
              className="shrink-0 rotate-90 text-text-quaternary"
            />
          </button>
        </li>
      ))}
    </ol>
    {/* The profile's "Show all Squads" seat, twice: the full rules and the
        FAQ are the two documents a newcomer reads before posting. */}
    <div className="mt-3 grid grid-cols-2 gap-2">
      <Button
        variant={ButtonVariant.Subtle}
        size={ButtonSize.Small}
        onClick={onOpenRules}
      >
        All rules
      </Button>
      <Button
        variant={ButtonVariant.Subtle}
        size={ButtonSize.Small}
        onClick={onOpenFaq}
      >
        FAQ
      </Button>
    </div>
  </Widget>
);

/** ActiveOrRecommendedSquads, for a squad: the people behind it. */
export const TeamWidget = (): ReactElement => (
  <Widget title="Team">
    <ul className="mt-4 flex flex-col gap-2.5">
      {team.slice(0, 5).map((member) => (
        <li key={member.id} className="flex items-center gap-2.5">
          <Avatar member={member} size={2} />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-bold text-text-primary typo-callout">
              {member.name}
            </span>
            <span className="truncate text-text-tertiary typo-footnote">
              {member.title}
            </span>
          </div>
          <span className="shrink-0 text-text-quaternary typo-caption1">
            {member.role}
          </span>
        </li>
      ))}
    </ul>
    <TopMembers />
    <div className="mt-auto pt-3">
      <Button
        variant={ButtonVariant.Subtle}
        size={ButtonSize.Small}
        className="w-full"
      >
        See all {team.length}
      </Button>
    </div>
  </Widget>
);

/** Production's "Top members" row (last 30 days), public squads only. */
const TopMembers = (): ReactElement | null => {
  const { config } = useWorkspace();

  if (!config.isPublic) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center justify-between border-t border-border-subtlest-tertiary pt-3">
      <span className="text-text-tertiary typo-footnote">Top followers</span>
      <Facepile members={[...team].reverse().slice(0, 5)} max={5} size={1.5} />
    </div>
  );
};

/**
 * Production's SquadStack: the tools the squad builds with. Hidden when
 * empty unless the admin can fill it, then a dashed invitation to.
 */
export const StackWidget = ({
  viewer,
}: {
  viewer: Viewer;
}): ReactElement | null => {
  const { empty } = useWorkspace();
  const canEdit = isAdmin(viewer);
  const items = empty ? [] : stack;

  if (items.length === 0 && !canEdit) {
    return null;
  }

  return (
    <Widget
      title="Stack & Tools"
      action={
        canEdit &&
        items.length > 0 && (
          <Button
            variant={ButtonVariant.Subtle}
            size={ButtonSize.XSmall}
            icon={<PlusIcon />}
          >
            Add
          </Button>
        )
      }
    >
      {items.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {items.slice(0, 4).map((item) => (
            <li
              key={item.name}
              className="flex items-center gap-1.5 rounded-10 border border-border-subtlest-tertiary py-1 pl-1 pr-2.5 text-text-secondary typo-footnote hover:border-border-subtlest-secondary hover:text-text-primary"
            >
              <img src={item.image} alt="" className="size-5 rounded-6" />
              {item.name}
            </li>
          ))}
          {items.length > 4 && (
            <li className="flex items-center rounded-10 border border-border-subtlest-tertiary px-2.5 py-1 text-text-tertiary typo-footnote">
              +{items.length - 4}
            </li>
          )}
        </ul>
      ) : (
        <div className="mt-3 flex flex-col items-center gap-2 rounded-12 border border-dashed border-border-subtlest-tertiary p-4 text-center">
          <span className="text-text-tertiary typo-footnote">
            Share your squad&apos;s stack &amp; tools
          </span>
          <Button
            variant={ButtonVariant.Secondary}
            size={ButtonSize.XSmall}
            icon={<PlusIcon />}
          >
            Add your first item
          </Button>
        </div>
      )}
    </Widget>
  );
};

const LinkRow = ({
  href,
  icon,
  text,
}: {
  href: string;
  icon: ReactNode;
  text: string;
}): ReactElement => (
  <li>
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-2 py-1 text-text-secondary typo-callout transition-colors hover:text-text-primary"
    >
      <span className="flex size-4 items-center justify-center text-text-tertiary transition-colors group-hover:text-text-primary">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{text}</span>
    </a>
  </li>
);

/**
 * GitHub's profile links: the website first as a bare domain, then each
 * place as its handle beside a small brand mark.
 */
export const LinksWidget = (): ReactElement => (
  <Widget title="Links">
    <ul className="mt-2 flex flex-col gap-1">
      <LinkRow
        href={`https://${squad.company.website}`}
        icon={<LinkIcon size={IconSize.Size16} />}
        text={squad.company.website}
      />
      {companyLinks.map((item) => (
        <LinkRow
          key={item.id}
          href={item.href}
          icon={
            <span
              className={classNames(
                'flex',
                item.id === 'discord' && '[&_path]:[fill:currentColor]',
              )}
            >
              {linkIcon(item.id, IconSize.Size16)}
            </span>
          }
          text={item.handle}
        />
      ))}
    </ul>
  </Widget>
);

/* ------------------------------------------------------------------ page */

/** One frame for a squad and a person: card + widget column. */
export const HomeFrame = ({
  header,
  children,
  widgets,
}: {
  header: ReactNode;
  children: ReactNode;
  widgets?: ReactNode;
}): ReactElement => (
  <div className="m-auto flex w-full max-w-[72rem] gap-4 p-4 pb-6">
    <main className="flex min-w-0 flex-1 flex-col">
      <div className="rounded-16 border border-border-subtlest-tertiary">
        {header}
        {children}
      </div>
    </main>
    {widgets && (
      <aside className="flex w-80 shrink-0 flex-col gap-4">{widgets}</aside>
    )}
  </div>
);

/** The About page in the sidebar: what used to stack under the header. */
export const SquadAbout = ({
  viewer = Viewer.Visitor,
}: {
  viewer?: Viewer;
}): ReactElement => (
  <div className="flex flex-col divide-y divide-border-subtlest-tertiary">
    <AboutSection />
    <CompanySection />
    <TeamSection />
    <StackSection viewer={viewer} />
  </div>
);

/**
 * The badge: Aurora. Two orbs of brand light, cabbage and onion, blurred
 * under frosted glass, one cabbage hairline, the seal in the brightest
 * spot. The landing page's light, in one row.
 */
export const VerifiedWidget = (): ReactElement => (
  <div
    className="relative flex items-center gap-3 overflow-hidden rounded-16 px-4 py-3"
    style={{
      background:
        'color-mix(in srgb, var(--theme-background-default) 58%, transparent)',
      boxShadow:
        'inset 0 0 0 1px color-mix(in srgb, var(--theme-accent-cabbage-default) 55%, transparent)',
    }}
  >
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(70% 120% at 12% 20%, color-mix(in srgb, var(--theme-accent-cabbage-default) 70%, transparent), transparent 60%), radial-gradient(70% 120% at 95% 110%, color-mix(in srgb, var(--theme-accent-onion-default) 55%, transparent), transparent 60%)',
        filter: 'blur(16px)',
      }}
    />
    <VerifiedSeal className="relative size-6 text-accent-cabbage-default" />
    <span className="relative font-bold text-text-primary typo-callout">
      Verified company page
    </span>
  </div>
);

export const SquadWidgets = ({
  viewer = Viewer.Visitor,
  onOpenRules,
  onOpenFaq,
  onOpenAnalytics,
  afterVerified,
}: {
  viewer?: Viewer;
  onOpenRules?: () => void;
  onOpenFaq?: () => void;
  onOpenAnalytics?: () => void;
  /** Sits right under the Verified company page card. */
  afterVerified?: ReactNode;
}): ReactElement => (
  <>
    <VerifiedWidget />
    {afterVerified}
    <RulesWidget onOpenRules={onOpenRules} onOpenFaq={onOpenFaq} />
    <TeamWidget />
    <StackWidget viewer={viewer} />
    <AnalyticsWidget viewer={viewer} onOpen={onOpenAnalytics} />
    <LinksWidget />
  </>
);

export const SquadHome = ({
  viewer = Viewer.Visitor,
  standalone = false,
  onOpenMembers,
  onOpenRules,
  onOpenFaq,
  onOpenPending,
  empty = false,
}: {
  viewer?: Viewer;
  /** Outside the workspace there is no sidebar to carry Join, so the header does. */
  standalone?: boolean;
  onOpenMembers?: () => void;
  onOpenRules?: () => void;
  onOpenFaq?: () => void;
  onOpenPending?: () => void;
  /** A squad that has not posted yet. */
  empty?: boolean;
}): ReactElement => (
  <HomeFrame
    header={
      <SquadHeader
        viewer={viewer}
        standalone={standalone}
        onOpenMembers={onOpenMembers}
      />
    }
    widgets={
      <SquadWidgets
        viewer={viewer}
        onOpenRules={onOpenRules}
        onOpenFaq={onOpenFaq}
      />
    }
  >
    <div className="border-t border-border-subtlest-tertiary">
      {empty ? (
        <div className="flex flex-col gap-4 p-6">
          <SquadComposer viewer={viewer} onOpenPending={onOpenPending} />
          <div className="flex flex-col items-center gap-2 rounded-16 border border-dashed border-border-subtlest-secondary px-6 py-12 text-center">
            <span className="font-bold text-text-primary typo-callout">
              Nothing posted yet
            </span>
            <span className="max-w-[40ch] text-text-tertiary typo-footnote">
              {isStaff(viewer)
                ? 'Connect the content feed or write the first post. Followers see the rules, the team and the links until then.'
                : 'The team has not posted yet. Follow to hear when they do.'}
            </span>
          </div>
        </div>
      ) : (
        <PostsArea
          sort="Latest"
          entries={feedEntries.slice(0, 6)}
          pinned={pinnedEntry}
          composer={
            <SquadComposer viewer={viewer} onOpenPending={onOpenPending} />
          }
          toolbarChildren={<PinnedToggle viewer={viewer} />}
        />
      )}
    </div>
  </HomeFrame>
);
