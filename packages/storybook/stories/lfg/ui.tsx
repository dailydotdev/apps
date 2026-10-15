import type { ComponentType, ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { IconProps } from '@dailydotdev/shared/src/components/Icon';
import { Separator } from '@dailydotdev/shared/src/components/cards/common/common';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ReputationUserBadge } from '@dailydotdev/shared/src/components/ReputationUserBadge';
import { HammerIcon } from '@dailydotdev/shared/src/components/icons/Hammer';
import { GraduationIcon } from '@dailydotdev/shared/src/components/icons/Graduation';
import { VolunteeringIcon } from '@dailydotdev/shared/src/components/icons/Volunteering';
import { EarthIcon } from '@dailydotdev/shared/src/components/icons/Earth';
import { TimerIcon } from '@dailydotdev/shared/src/components/icons/Timer';
import { ShieldCheckIcon } from '@dailydotdev/shared/src/components/icons/ShieldCheck';
import { GitHubIcon } from '@dailydotdev/shared/src/components/icons/GitHub';
import { ReadingStreakIcon } from '@dailydotdev/shared/src/components/icons/ReadingStreak';
import { OrganizationIcon } from '@dailydotdev/shared/src/components/icons/Organization';
import { JobIcon } from '@dailydotdev/shared/src/components/icons/Job';
import { CalendarIcon } from '@dailydotdev/shared/src/components/icons/Calendar';
import { UserIcon } from '@dailydotdev/shared/src/components/icons/User';
import { LfgIcon } from './icons';
import type { HelperProfile, LfgPost, LfgUser } from './data';
import {
  commitmentLabel,
  kindLabel,
  kindLooking,
  LfgKind,
  me,
  NOW,
  PENDING_CAP,
  PostStatus,
  users,
} from './data';
import type { ProtoState } from './store';
import { myRequestTo, pendingFor, userFor } from './store';

/* ------------------------------------------------------------- formats */

const DAY = 86_400_000;

export const relativeDays = (iso: string): string => {
  const days = Math.round((NOW.getTime() - new Date(iso).getTime()) / DAY);
  if (days <= 0) {
    return 'today';
  }
  return days === 1 ? 'yesterday' : `${days}d ago`;
};

export const daysLeft = (iso: string): number =>
  Math.max(0, Math.ceil((new Date(iso).getTime() - NOW.getTime()) / DAY));

export const memberSince = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

export const formatOffset = (offset: number): string => {
  const hours = Math.trunc(Math.abs(offset));
  const minutes = Math.round((Math.abs(offset) - hours) * 60);
  return `UTC${offset < 0 ? '-' : '+'}${hours}${minutes ? `:${minutes}` : ''}`;
};

export const formatReputation = (value: number): string =>
  `${value.toLocaleString('en-US')}+ reputation`;

/* ---------------------------------------------------------------- kind */

const kindIcon: Record<LfgKind, typeof HammerIcon> = {
  [LfgKind.Build]: HammerIcon,
  [LfgKind.Learn]: GraduationIcon,
  [LfgKind.Help]: VolunteeringIcon,
};

export const kindColor: Record<LfgKind, string> = {
  [LfgKind.Build]: 'text-accent-cabbage-default',
  [LfgKind.Learn]: 'text-accent-water-default',
  [LfgKind.Help]: 'text-accent-avocado-default',
};

export const KindIcon = ({
  kind,
  size = IconSize.Size16,
  className,
}: {
  kind: LfgKind;
  size?: IconSize;
  className?: string;
}): ReactElement => {
  const Icon = kindIcon[kind];
  return (
    <Icon
      size={size}
      secondary
      className={classNames(kindColor[kind], className)}
    />
  );
};

export const KindLine = ({
  post,
  className,
}: {
  post: Pick<LfgPost, 'kind'>;
  className?: string;
}): ReactElement => (
  <div className={classNames('flex items-center gap-1.5', className)}>
    <KindIcon kind={post.kind} />
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Secondary}
      bold
    >
      {kindLabel[post.kind]}
    </Typography>
  </div>
);

/* ------------------------------------------------------------ the badge */

// Anyone with an open post wears this wherever their avatar shows up:
// comments, posts, hover cards and their profile.
export const LfgAvatar = ({
  user,
  size = ProfileImageSize.Large,
  looking,
  ribbon = false,
  icon: BadgeIcon = LfgIcon,
  className,
}: {
  user: LfgUser;
  size?: ProfileImageSize;
  looking: boolean;
  icon?: ComponentType<IconProps>;
  // The larger "LFG" tag for big avatars; small ones get a corner badge.
  ribbon?: boolean;
  className?: string;
}): ReactElement => {
  const picture = (
    <ProfilePicture
      user={user}
      size={size}
      nativeLazyLoading
      className={classNames(
        looking &&
          'ring-2 ring-accent-avocado-default ring-offset-2 ring-offset-background-default',
        className,
      )}
    />
  );
  if (!looking) {
    return picture;
  }
  const isSmall = [
    ProfileImageSize.Size16,
    ProfileImageSize.XSmall,
    ProfileImageSize.Small,
  ].includes(size);
  return (
    <span
      className="relative inline-flex shrink-0"
      title={`${user.name} is looking for group`}
    >
      {picture}
      {ribbon ? (
        <span className="absolute -bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-8 bg-accent-avocado-default px-1.5 py-0.5 font-bold text-white ring-2 ring-background-default typo-caption2">
          <BadgeIcon size={IconSize.XXSmall} secondary />
          LFG
        </span>
      ) : (
        <span
          className={classNames(
            'absolute flex items-center justify-center bg-accent-avocado-default text-white ring-2 ring-background-default',
            isSmall
              ? '-bottom-1 -right-1 size-3.5 rounded-4'
              : '-bottom-1.5 -right-1.5 size-[1.125rem] rounded-6',
          )}
        >
          <BadgeIcon size={IconSize.XXSmall} secondary />
        </span>
      )}
    </span>
  );
};

// The strip the hover card and profile show for someone with an open post.
export const LookingStrip = ({
  post,
  onOpen,
  className,
}: {
  post: LfgPost;
  onOpen: () => void;
  className?: string;
}): ReactElement => (
  <div className={classNames('flex flex-col gap-2', className)}>
    <span className="flex items-center gap-1.5 font-bold text-accent-avocado-default typo-footnote">
      <LfgIcon size={IconSize.Size16} secondary />
      {kindLooking[post.kind]}
    </span>
    <Typography type={TypographyType.Callout} bold className="line-clamp-2">
      {post.title}
    </Typography>
    <Button
      type="button"
      className="self-start"
      variant={ButtonVariant.Secondary}
      size={ButtonSize.Small}
      onClick={onOpen}
    >
      View post
    </Button>
  </div>
);

// Before launch the badge is a teaser: it says what kind of post someone has
// without showing it, and invites the reader to post too.
export const LookingTeaser = ({
  post,
  onPostYours,
  className,
}: {
  post: LfgPost;
  onPostYours?: () => void;
  className?: string;
}): ReactElement => (
  <div className={classNames('flex flex-col gap-2', className)}>
    <span className="flex items-center gap-1.5 font-bold text-accent-avocado-default typo-footnote">
      <LfgIcon size={IconSize.Size16} secondary />
      {kindLooking[post.kind]}
    </span>
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      Connections open in a few days.
      {onPostYours && ' Post what you need and wear the badge too.'}
    </Typography>
    {onPostYours && (
      <Button
        type="button"
        className="self-start"
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Small}
        onClick={onPostYours}
      >
        Post yours
      </Button>
    )}
  </div>
);

// Open to helping hears about Help posts on its topics, from the time zones
// and reputation it narrowed to.
export const matchesHelper = (
  helper: HelperProfile,
  post: LfgPost,
  author: LfgUser,
): boolean =>
  post.kind === LfgKind.Help &&
  post.tags.some((tag) => helper.tags.includes(tag)) &&
  (!helper.timezones?.length || helper.timezones.includes(author.utcOffset)) &&
  author.reputation >= (helper.minReputation ?? 0);

export const helperAudience = (helper: HelperProfile): string | undefined => {
  const parts = [
    helper.timezones?.length &&
      `in ${helper.timezones.map(formatOffset).join(' or ')}`,
    helper.minReputation && `with ${formatReputation(helper.minReputation)}`,
  ].filter(Boolean);
  return parts.length ? `From people ${parts.join(' ')}.` : undefined;
};

export const HelperLine = ({
  helper,
  showTitle = true,
  className,
}: {
  helper: HelperProfile;
  showTitle?: boolean;
  className?: string;
}): ReactElement => (
  <div className={classNames('flex flex-col gap-1', className)}>
    {showTitle && (
      <span className="flex items-center gap-1.5 font-bold text-text-secondary typo-footnote">
        <VolunteeringIcon size={IconSize.Size16} secondary />
        Open to helping
      </span>
    )}
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      Help requests on {helper.tags.map((tag) => `#${tag}`).join(' ')}
    </Typography>
  </div>
);

export const TagList = ({
  tags,
  className,
}: {
  tags: string[];
  className?: string;
}): ReactElement => (
  <div className={classNames('flex flex-wrap gap-1', className)}>
    {tags.map((tag) => (
      <span
        key={tag}
        className="rounded-8 border border-border-subtlest-tertiary px-2 py-0.5 text-text-tertiary typo-caption1"
      >
        #{tag}
      </span>
    ))}
  </div>
);

const MetaItem = ({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <span className="flex min-w-0 items-center gap-1 text-text-tertiary typo-footnote">
    <span className="shrink-0">{icon}</span>
    <span className="truncate">{children}</span>
  </span>
);

export const PostMeta = ({
  post,
  className,
}: {
  post: LfgPost;
  className?: string;
}): ReactElement => {
  const author = users[post.authorId];
  return (
    <div className={classNames('flex flex-wrap gap-x-4 gap-y-1.5', className)}>
      <MetaItem icon={<EarthIcon size={IconSize.Size16} />}>
        {author.timezone}
        {post.showCountry && ` · ${author.country}`}
      </MetaItem>
      <MetaItem icon={<TimerIcon size={IconSize.Size16} />}>
        {commitmentLabel[post.commitment]}
      </MetaItem>
    </div>
  );
};

/* -------------------------------------------------------------- author */

export const AuthorRow = ({
  user,
  size = ProfileImageSize.Large,
  meta,
  className,
}: {
  user: LfgUser;
  size?: ProfileImageSize;
  meta?: ReactNode;
  className?: string;
}): ReactElement => (
  <div className={classNames('flex min-w-0 items-center gap-2', className)}>
    <ProfilePicture user={user} size={size} nativeLazyLoading />
    <div className="flex min-w-0 shrink flex-col">
      <div className="flex min-w-0 items-center gap-1">
        <Typography type={TypographyType.Callout} bold truncate>
          {user.name}
        </Typography>
        <ReputationUserBadge user={user} disableTooltip />
      </div>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        truncate
      >
        {meta ?? `@${user.username} · ${user.title}`}
      </Typography>
    </div>
  </div>
);

/* ------------------------------------------------------------ receipts */

export interface ReceiptItem {
  key: string;
  icon: ReactNode;
  label: string;
  // Only things we actually check (workplace, GitHub) say verified.
  verified?: boolean;
}

export const getReceipts = (user: LfgUser): ReceiptItem[] => {
  const items: ReceiptItem[] = [
    {
      key: 'reputation',
      icon: <ReputationUserBadge user={user} disableTooltip />,
      label: 'reputation',
    },
    {
      key: 'joined',
      icon: <CalendarIcon size={IconSize.Size16} />,
      label: `Member since ${memberSince(user.joined)}`,
    },
  ];
  if (user.company) {
    items.push({
      key: 'company',
      icon: <OrganizationIcon size={IconSize.Size16} />,
      label: `Works at ${user.company}`,
      verified: true,
    });
  }
  if (user.experienceYears) {
    items.push({
      key: 'experience',
      icon: <JobIcon size={IconSize.Size16} />,
      label: `${user.experienceYears} years of work experience`,
    });
  }
  if (user.github) {
    items.push({
      key: 'github',
      icon: <GitHubIcon size={IconSize.Size16} />,
      label: `GitHub connected (${user.github})`,
      verified: true,
    });
  }
  if (user.streak) {
    items.push({
      key: 'streak',
      icon: <ReadingStreakIcon size={IconSize.Size16} secondary />,
      label: `${user.streak}-day reading streak`,
    });
  }
  items.push({
    key: 'title',
    icon: <UserIcon size={IconSize.Size16} />,
    label: user.title,
  });
  return items;
};

export const VerifiedMark = ({
  verified,
}: {
  verified?: boolean;
}): ReactElement | null =>
  verified ? (
    <span className="flex shrink-0 items-center gap-0.5 text-accent-avocado-default typo-caption1">
      <ShieldCheckIcon size={IconSize.Size16} secondary />
      Verified
    </span>
  ) : null;

export const ReceiptList = ({
  items,
  className,
}: {
  items: ReceiptItem[];
  className?: string;
}): ReactElement => (
  <ul className={classNames('flex flex-col gap-2', className)}>
    {items.map((item) => (
      <li key={item.key} className="flex items-center gap-2">
        <span className="flex min-w-0 flex-1 items-center gap-2 text-text-secondary typo-footnote">
          <span className="flex shrink-0 text-text-tertiary">{item.icon}</span>
          <span className="truncate">{item.label}</span>
        </span>
        <VerifiedMark verified={item.verified} />
      </li>
    ))}
  </ul>
);

/* ------------------------------------------------------- post statuses */

export const isPaused = (state: ProtoState, post: LfgPost): boolean =>
  post.outsidePending + pendingFor(state, post.id).length >= PENDING_CAP;

export const PostStatusLine = ({
  state,
  post,
}: {
  state: ProtoState;
  post: LfgPost;
}): ReactElement | null => {
  const request = myRequestTo(state, post.id);
  if (post.authorId === me.id) {
    const waiting = pendingFor(state, post.id).length;
    return (
      <Typography type={TypographyType.Footnote} color={TypographyColor.Brand}>
        Your post
        {waiting > 0 &&
          ` · ${waiting} ${waiting === 1 ? 'response' : 'responses'} waiting`}
      </Typography>
    );
  }
  if (post.status === PostStatus.Found) {
    return (
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        Found someone
      </Typography>
    );
  }
  if (request?.status === 'accepted') {
    return (
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.StatusSuccess}
      >
        Accepted · you can chat now
      </Typography>
    );
  }
  if (request?.status === 'filled') {
    return (
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        This spot was filled
      </Typography>
    );
  }
  if (request) {
    return (
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        You reached out {relativeDays(request.createdAt)} · waiting
      </Typography>
    );
  }
  if (isPaused(state, post)) {
    return (
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        Paused while {users[post.authorId].name.split(' ')[0]} catches up on
        responses
      </Typography>
    );
  }
  return null;
};

/* ------------------------------------------------------------ the card */

export const PostCard = ({
  post,
  state,
  onOpen,
  className,
}: {
  post: LfgPost;
  state: ProtoState;
  onOpen: () => void;
  className?: string;
}): ReactElement => {
  const author = userFor(state, post.authorId);
  return (
    <button
      type="button"
      onClick={onOpen}
      className={classNames(
        'flex w-full flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4 text-left transition-colors hover:bg-surface-hover',
        className,
      )}
    >
      <div className="flex w-full items-start justify-between gap-3">
        <AuthorRow user={author} size={ProfileImageSize.Medium} />
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
          className="shrink-0 pt-1"
        >
          {relativeDays(post.createdAt)}
        </Typography>
      </div>
      <div className="flex flex-col gap-1.5">
        <KindLine post={post} />
        <Typography
          tag={TypographyTag.H3}
          type={TypographyType.Body}
          bold
          className="line-clamp-2"
        >
          {post.title}
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="line-clamp-2"
        >
          {post.body}
        </Typography>
      </div>
      <TagList tags={post.tags} />
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <PostMeta post={post} />
        <PostStatusLine state={state} post={post} />
      </div>
    </button>
  );
};

/* -------------------------------------------------------------- rows */

export const canReachOut = (state: ProtoState, post: LfgPost): boolean =>
  state.phase === 'live' &&
  post.authorId !== me.id &&
  post.status === PostStatus.Open &&
  !myRequestTo(state, post.id) &&
  !isPaused(state, post);

const rowStatus = (state: ProtoState, post: LfgPost): string | undefined => {
  if (state.phase === 'prelaunch') {
    return post.authorId === me.id
      ? 'Your post · goes live soon'
      : 'Opening soon';
  }
  if (post.authorId === me.id) {
    const waiting = pendingFor(state, post.id).length;
    return waiting ? `Your post · ${waiting} waiting` : 'Your post';
  }
  const request = myRequestTo(state, post.id);
  if (request?.status === 'accepted') {
    return 'Accepted';
  }
  if (request) {
    return 'Requested';
  }
  if (isPaused(state, post)) {
    return 'Paused';
  }
  return undefined;
};

// One post per row, everything a reader needs to decide without opening
// it. The whole row opens the post; Reach out sits above the link.
export const LfgRow = ({
  post,
  state,
  onOpen,
  onReachOut,
}: {
  post: LfgPost;
  state: ProtoState;
  onOpen: () => void;
  onReachOut?: () => void;
}): ReactElement => {
  const author = userFor(state, post.authorId);
  const status = rowStatus(state, post);

  return (
    <article className="relative flex items-start gap-3 py-4">
      <button
        type="button"
        aria-label={`Open ${post.title}`}
        className="absolute inset-0"
        onClick={onOpen}
      />
      <ProfilePicture
        user={author}
        size={ProfileImageSize.XLarge}
        nativeLazyLoading
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="tabular-nums"
          truncate
        >
          {status && (
            <>
              <strong className="text-text-secondary">{status}</strong>
              <Separator />
            </>
          )}
          <strong className="text-text-secondary">{author.name}</strong>
          <Separator />
          {kindLabel[post.kind]}
          <Separator />
          {relativeDays(post.createdAt)}
        </Typography>
        <Typography
          tag={TypographyTag.H3}
          type={TypographyType.Body}
          bold
          className="line-clamp-2"
        >
          {post.title}
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="line-clamp-2"
        >
          {post.body}
        </Typography>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
          <TagList tags={post.tags} />
          <PostMeta post={post} />
        </div>
      </div>
      {onReachOut && canReachOut(state, post) && (
        <Button
          type="button"
          className="relative z-1 shrink-0"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={onReachOut}
        >
          Reach out
        </Button>
      )}
    </article>
  );
};

/* ----------------------------------------------------- dm context card */

// The same frame as messages' DmContextCard, pointing at a post instead of
// a comment.
export const LfgContextCard = ({
  post,
  label,
  onOpen,
  className,
}: {
  post: LfgPost;
  label: string;
  onOpen?: () => void;
  className?: string;
}): ReactElement => (
  <button
    type="button"
    onClick={onOpen}
    className={classNames(
      'flex w-full items-start gap-2 rounded-12 border-l-2 border-border-subtlest-secondary bg-surface-float px-3 py-2 text-left',
      className,
    )}
  >
    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
        truncate
      >
        {label}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Secondary}
        className="line-clamp-2"
      >
        {post.title}
      </Typography>
    </span>
  </button>
);

export const SectionLabel = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <Typography
    type={TypographyType.Footnote}
    color={TypographyColor.Tertiary}
    bold
    className={className}
  >
    {children}
  </Typography>
);
