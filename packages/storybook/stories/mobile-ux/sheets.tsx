import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons/Share';
import { BookmarkIcon } from '@dailydotdev/shared/src/components/icons/Bookmark';
import { AddUserIcon } from '@dailydotdev/shared/src/components/icons/AddUser';
import { BlockIcon } from '@dailydotdev/shared/src/components/icons/Block';
import { FlagIcon } from '@dailydotdev/shared/src/components/icons/Flag';
import { EditIcon } from '@dailydotdev/shared/src/components/icons/Edit';
import { TrashIcon } from '@dailydotdev/shared/src/components/icons/Trash';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { UserIcon } from '@dailydotdev/shared/src/components/icons/User';
import { LockIcon } from '@dailydotdev/shared/src/components/icons/Lock';
import { BellIcon } from '@dailydotdev/shared/src/components/icons/Bell';
import { LayoutIcon } from '@dailydotdev/shared/src/components/icons/Layout';
import { FeatherIcon } from '@dailydotdev/shared/src/components/icons/Feather';
import { InviteIcon } from '@dailydotdev/shared/src/components/icons/Invite';
import { HashtagIcon } from '@dailydotdev/shared/src/components/icons/Hashtag';
import { SourceIcon } from '@dailydotdev/shared/src/components/icons/Source';
import { ShieldIcon } from '@dailydotdev/shared/src/components/icons/Shield';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BrowserChrome, Phone } from './kit';
import { Dim, FeedList, PostArticle } from './mocks';
import { BarMaterial } from './floating';
import { Circle, LeafTop, RootCluster } from './chrome';
import { posts } from './data';

// The one bottom sheet: grabber, title row, grouped rows, destructive last.
// A sub-level is the same sheet with its content slid left; `back` puts the
// chevron in the title row that slides the first level back in. Swipe down
// or the scrim closes the whole sheet from any level.
export const Sheet = ({
  title,
  back = false,
  children,
  detent = 'auto',
}: {
  title?: ReactNode;
  back?: boolean;
  children: ReactNode;
  detent?: 'auto' | 'full';
}): ReactElement => (
  <div className="absolute inset-x-0 -top-11 bottom-0 flex flex-col justify-end bg-overlay-quaternary-onion">
    <div
      className={classNames(
        'map-sheet-in flex flex-col rounded-t-24 bg-background-default pb-6',
        detent === 'full' && 'h-[92%]',
      )}
    >
      <span className="mx-auto mb-1 mt-2 h-1 w-9 rounded-2 bg-border-subtlest-secondary" />
      {title && (
        <div className="flex h-11 items-center gap-1 pl-3 pr-5 font-bold typo-callout">
          {back && (
            <span
              aria-label="Back"
              className="flex size-8 items-center justify-center rounded-10 text-text-secondary"
            >
              <ArrowIcon size={IconSize.Small} className="-rotate-90" />
            </span>
          )}
          <span className={classNames(!back && 'pl-2')}>{title}</span>
        </div>
      )}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  </div>
);

export const SheetRow = ({
  icon,
  label,
  meta,
  destructive,
  chevron,
}: {
  icon: ReactNode;
  label: string;
  meta?: string;
  destructive?: boolean;
  chevron?: boolean;
}): ReactElement => (
  <div
    className={classNames(
      'flex h-12 items-center gap-3 px-5 typo-callout',
      destructive ? 'text-accent-ketchup-default' : 'text-text-primary',
    )}
  >
    <span className={destructive ? undefined : 'text-text-secondary'}>
      {icon}
    </span>
    <span className="flex-1">{label}</span>
    {meta && <span className="text-text-tertiary typo-footnote">{meta}</span>}
    {chevron && (
      <ArrowIcon
        size={IconSize.Small}
        className="rotate-90 text-text-quaternary"
      />
    )}
  </div>
);

export const SheetGroup = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col border-t border-border-subtlest-tertiary py-1 first:border-t-0">
    {children}
  </div>
);

const post = posts[0];

// Post options today: one popup, twenty rows, anchored to a 24px button.
export const TodayPostPopup = (): ReactElement => (
  <div className="absolute right-3 top-14 z-3 flex w-64 flex-col rounded-16 border border-border-subtlest-tertiary bg-background-popover py-1 shadow-3">
    {[
      'Share via',
      'Post analytics',
      'Hide',
      'Report',
      'Boost post',
      'Downvote',
      'Read it later',
      'Translate',
      'Move to...',
      'Follow DEV',
      'Notify on new post from DEV',
      'Follow Alex Kondov',
      'Block DEV',
      'Block Alex Kondov',
      "Don't show article content",
      'Block #webdev',
      'Block #nextjs',
      'Block #react',
      'Edit post',
      'Delete post',
    ].map((label) => (
      <span
        key={label}
        className="flex h-9 items-center px-3 text-text-primary typo-footnote"
      >
        {label}
      </span>
    ))}
  </div>
);

export const PostActionSheet = (): ReactElement => (
  <Sheet>
    <SheetGroup>
      <SheetRow icon={<ShareIcon size={IconSize.Medium} />} label="Share" />
      <SheetRow
        icon={<BookmarkIcon size={IconSize.Medium} />}
        label="Read it later"
      />
      <SheetRow
        icon={<AddUserIcon size={IconSize.Medium} />}
        label="Follow DEV"
      />
      <SheetRow
        icon={<BlockIcon size={IconSize.Medium} />}
        label="Not interested"
        chevron
      />
      <SheetRow icon={<FlagIcon size={IconSize.Medium} />} label="Report" />
    </SheetGroup>
    <SheetGroup>
      <SheetRow icon={<EditIcon size={IconSize.Medium} />} label="Edit post" />
      <SheetRow
        icon={<TrashIcon size={IconSize.Medium} />}
        label="Delete post"
        destructive
      />
    </SheetGroup>
    <SheetGroup>
      <SheetRow
        icon={<LayoutIcon size={IconSize.Medium} />}
        label="More"
        meta="Analytics, Boost, Translate"
        chevron
      />
    </SheetGroup>
  </Sheet>
);

export const NotInterestedSheet = (): ReactElement => (
  <Sheet title="Not interested in" back>
    <SheetGroup>
      <SheetRow
        icon={<SourceIcon size={IconSize.Medium} />}
        label="Posts from DEV"
      />
      <SheetRow
        icon={<UserIcon size={IconSize.Medium} />}
        label="Posts by Alex Kondov"
      />
      <SheetRow icon={<HashtagIcon size={IconSize.Medium} />} label="#webdev" />
      <SheetRow icon={<HashtagIcon size={IconSize.Medium} />} label="#nextjs" />
      <SheetRow icon={<HashtagIcon size={IconSize.Medium} />} label="#react" />
      <SheetRow
        icon={<LayoutIcon size={IconSize.Medium} />}
        label="Article content"
      />
    </SheetGroup>
    <SheetGroup>
      <SheetRow
        icon={<BlockIcon size={IconSize.Medium} />}
        label="Hide this post"
      />
    </SheetGroup>
  </Sheet>
);

export const SquadActionSheet = (): ReactElement => (
  <Sheet>
    <SheetGroup>
      <span className="px-5 pb-1 pt-2 uppercase tracking-[0.16em] text-text-quaternary typo-caption2">
        Manage
      </span>
      <SheetRow
        icon={<ShieldIcon size={IconSize.Medium} />}
        label="Moderation"
        meta="3"
        chevron
      />
      <SheetRow
        icon={<UserIcon size={IconSize.Medium} />}
        label="Members"
        chevron
      />
      <SheetRow
        icon={<LayoutIcon size={IconSize.Medium} />}
        label="Settings"
        chevron
      />
    </SheetGroup>
    <SheetGroup>
      <SheetRow icon={<ShareIcon size={IconSize.Medium} />} label="Share" />
      <SheetRow icon={<InviteIcon size={IconSize.Medium} />} label="Invite" />
      <SheetRow
        icon={<BellIcon size={IconSize.Medium} />}
        label="Notifications"
        meta="On"
      />
      <SheetRow
        icon={<FeatherIcon size={IconSize.Medium} />}
        label="Add to custom feed"
      />
    </SheetGroup>
    <SheetGroup>
      <SheetRow icon={<FlagIcon size={IconSize.Medium} />} label="Report" />
      <SheetRow
        icon={<LockIcon size={IconSize.Medium} />}
        label="Leave squad"
        destructive
      />
    </SheetGroup>
  </Sheet>
);

export const LoginSheet = (): ReactElement => (
  <Sheet title="Save this post">
    <div className="flex flex-col gap-3 px-5 pt-1">
      <p className="text-text-tertiary typo-footnote">
        Bookmarks, upvotes and your feed need an account. Takes ten seconds.
      </p>
      <span className="flex h-12 items-center justify-center rounded-12 bg-text-primary font-bold text-surface-invert typo-callout">
        Sign up
      </span>
      <span className="flex h-12 items-center justify-center rounded-12 border border-border-subtlest-secondary font-bold typo-callout">
        Log in
      </span>
    </div>
  </Sheet>
);

const PhoneWithChrome = ({
  overlay,
  header,
  children,
  active = 'Home',
}: {
  overlay?: ReactNode;
  header?: ReactNode;
  children: ReactNode;
  active?: string;
}): ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      {header && (
        <div className="pointer-events-none absolute inset-x-0 top-2 z-2">
          {header}
        </div>
      )}
      <div className="map-scroll-none min-h-0 flex-1 overflow-hidden">
        {children}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-2 z-2">
        <RootCluster material={BarMaterial.Glass} active={active} />
      </div>
      {overlay && <div className="absolute inset-0 z-3">{overlay}</div>}
    </div>
  </Phone>
);

export const TodayPostMenuPhone = (): ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex h-12 items-center border-b border-border-subtlest-tertiary px-2">
        <span className="flex size-10 items-center justify-center text-text-secondary">
          <ArrowIcon size={IconSize.Small} className="-rotate-90" />
        </span>
        <span className="flex-1" />
        <span className="px-2 text-text-secondary typo-footnote">
          Read post
        </span>
        <span className="flex size-10 items-center justify-center text-text-secondary">
          ⋮
        </span>
      </div>
      <div className="map-scroll-none relative min-h-0 flex-1 overflow-hidden">
        <Dim>
          <PostArticle post={post} />
        </Dim>
        <TodayPostPopup />
      </div>
    </div>
  </Phone>
);

export const PostSheetPhone = ({ sub }: { sub?: boolean }): ReactElement => (
  <PhoneWithChrome
    header={
      <LeafTop
        material={BarMaterial.Glass}
        p={0}
        actions={
          <Circle material={BarMaterial.Glass} fixed>
            ⋮
          </Circle>
        }
      />
    }
    overlay={sub ? <NotInterestedSheet /> : <PostActionSheet />}
  >
    <Dim>
      <div className="pt-16">
        <PostArticle post={post} />
      </div>
    </Dim>
  </PhoneWithChrome>
);

export const SquadSheetPhone = (): ReactElement => (
  <PhoneWithChrome active="Squads" overlay={<SquadActionSheet />}>
    <Dim>
      <FeedList />
    </Dim>
  </PhoneWithChrome>
);

export const LoginSheetPhone = (): ReactElement => (
  <PhoneWithChrome overlay={<LoginSheet />}>
    <Dim>
      <FeedList />
    </Dim>
  </PhoneWithChrome>
);

export const settingsGroups: { title?: string; rows: string[] }[] = [
  {
    rows: [
      'Profile',
      'Account & security',
      'Notifications',
      'Appearance',
      'Posting',
      'Invite friends',
    ],
  },
  {
    title: 'Feed',
    rows: [
      'General',
      'Tags',
      'Content sources',
      'Content preferences',
      'AI superpowers',
      'Blocked content',
    ],
  },
  {
    title: 'Career',
    rows: [
      'Work experience',
      'Education',
      'Certifications',
      'Open source',
      'Projects & publications',
      'Volunteering',
    ],
  },
  {
    title: 'Gamification',
    rows: [
      'Game Center',
      'Streaks & gamification',
      'Achievements',
      'Hot takes',
      'DevCard',
    ],
  },
  { title: 'Developers', rows: ['API access', 'Integrations'] },
  {
    title: 'Billing',
    rows: [
      'Payment & subscription',
      'Organizations',
      'Core wallet',
      'Ads dashboard',
    ],
  },
  { title: 'Help', rows: ['Your feedback', 'Privacy', 'Docs'] },
];

export const SettingsListPhone = (): ReactElement => (
  <PhoneWithChrome header={<LeafTop material={BarMaterial.Glass} p={1} />}>
    <div className="flex flex-col pb-24 pt-16">
      <h1 className="px-4 pb-2 font-bold typo-large-title">Settings</h1>
      {settingsGroups.map((group) => (
        <div key={group.title ?? 'account'} className="flex flex-col py-2">
          {group.title && (
            <span className="px-4 pb-1 pt-2 text-text-tertiary typo-caption1">
              {group.title}
            </span>
          )}
          {group.rows.map((row) => (
            <span
              key={row}
              className="flex h-11 items-center justify-between px-4 typo-callout"
            >
              {row}
              <ArrowIcon
                size={IconSize.Small}
                className="rotate-90 text-text-quaternary"
              />
            </span>
          ))}
        </div>
      ))}
      <span className="flex h-11 items-center px-4 text-accent-ketchup-default typo-callout">
        Log out
      </span>
    </div>
  </PhoneWithChrome>
);

export const SettingsPagePhone = (): ReactElement => (
  <PhoneWithChrome header={<LeafTop material={BarMaterial.Glass} p={1} />}>
    <div className="flex flex-col gap-1 pb-24 pt-16">
      <h1 className="px-4 pb-2 font-bold typo-large-title">Notifications</h1>
      {[
        ['Push notifications', 'On'],
        ['Email digest', 'Weekly'],
        ['Comments on my posts', 'On'],
        ['Mentions', 'On'],
        ['Squad activity', 'Off'],
        ['Streak reminders', 'On'],
      ].map(([label, value]) => (
        <span
          key={label}
          className="flex h-12 items-center justify-between px-4 typo-callout"
        >
          {label}
          <span className="text-text-tertiary typo-footnote">{value}</span>
        </span>
      ))}
    </div>
  </PhoneWithChrome>
);
