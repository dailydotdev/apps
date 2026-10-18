import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from '../../../../components/utilities/Link';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { Separator } from '../../../../components/cards/common/common';
import { IconSize } from '../../../../components/Icon';
import { ArrowIcon } from '../../../../components/icons/Arrow';
import { PlusIcon } from '../../../../components/icons/Plus';
import { SignalIcon } from '../../../../components/icons/Signal';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { Origin } from '../../../../lib/log';
import type { LfgPost } from '../../types';
import { LfgPostStatus } from '../../types';
import { lfgHelperQueryOptions, userLfgPostQueryOptions } from '../../queries';
import {
  getFirstName,
  getLfgUrl,
  lfgDaysLeft,
  lfgNewPostUrl,
  lfgRelativeDays,
} from '../../lib/format';
import { canReachOutToLfgPost } from '../../lib/status';
import { useLfgEnabled } from '../../hooks/useLfgEnabled';
import { useLfgModals } from '../../hooks/useLfgModals';
import { LfgKindLine } from '../LfgKind';
import { LfgLookingTeaser } from '../LfgLookingStrip';
import { LfgBadgeMark, LfgBadgeSize } from '../LfgAvatarBadge';
import { useLfgHelperSummary } from '../board/LfgBoardWidgets';

// A section of the profile's divided list, in AboutMe's own format.
const Section = ({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-4 py-4">
    <Typography type={TypographyType.Body} color={TypographyColor.Primary} bold>
      {title}
    </Typography>
    {children}
  </div>
);

const PostCard = ({
  post,
  isMine,
  isLaunched,
}: {
  post: LfgPost;
  isMine: boolean;
  isLaunched: boolean;
}): ReactElement => {
  const href = getLfgUrl(post.id);
  const daysLeft = lfgDaysLeft(post.expiresAt);

  return (
    <Link href={href} passHref>
      <a
        href={href}
        className="flex items-start gap-3 rounded-16 border border-border-subtlest-tertiary p-4 text-left hover:bg-surface-hover"
      >
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <LfgKindLine kind={post.kind} />
          <Typography
            type={TypographyType.Callout}
            bold
            className="break-words"
          >
            {post.title}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="line-clamp-2 break-words"
          >
            {post.body}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="tabular-nums"
          >
            {post.myReachOut && !isMine && (
              <>
                <strong className="text-text-secondary">Requested</strong>
                <Separator />
              </>
            )}
            {isLaunched ? (
              <>
                Posted {lfgRelativeDays(post.createdAt)}
                <Separator />
                {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
              </>
            ) : (
              'Goes live when connections open'
            )}
          </Typography>
        </span>
        <ArrowIcon
          size={IconSize.Small}
          className="mt-1 shrink-0 rotate-90 text-text-tertiary"
        />
      </a>
    </Link>
  );
};

const lookingTitle = (
  <span className="flex items-center gap-1.5">
    <SignalIcon
      size={IconSize.Small}
      secondary
      className="text-accent-avocado-default"
    />
    Looking for group
  </span>
);

const HelperSection = (): ReactElement => {
  const { user } = useAuthContext();
  const { openHelper } = useLfgModals();
  const { data: helper } = useQuery(lfgHelperQueryOptions(user));
  const getSummary = useLfgHelperSummary();

  return (
    <Section title="Open to helping">
      <Typography
        type={helper ? TypographyType.Footnote : TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        {helper
          ? getSummary(helper)
          : 'Get a heads-up when someone needs help with what you know.'}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Quaternary}
      >
        Only you can see this.
      </Typography>
      <Button
        type="button"
        className="self-start"
        variant={helper ? ButtonVariant.Float : ButtonVariant.Secondary}
        size={ButtonSize.Small}
        onClick={() => openHelper(Origin.LfgProfile)}
      >
        {helper ? 'Edit' : 'Open to helping'}
      </Button>
    </Section>
  );
};

// The profile's Looking for group section: the person's open post, and on
// your own profile a way to post and your private Open to helping.
export const LfgProfileSection = ({
  userId,
  name,
}: {
  userId: string;
  name?: string;
}): ReactElement | null => {
  const { user } = useAuthContext();
  const { isEnabled, isLaunched } = useLfgEnabled();
  const { openReachOut } = useLfgModals();
  const isMe = user?.id === userId;
  const { data: post, isPending } = useQuery(
    userLfgPostQueryOptions(user, userId, { enabled: isEnabled }),
  );

  if (!isEnabled || isPending) {
    return null;
  }

  const openPost = post?.status === LfgPostStatus.Open ? post : null;

  if (!openPost && !isMe) {
    return null;
  }

  return (
    <>
      {openPost && (
        <Section title={lookingTitle}>
          {!isLaunched && !isMe ? (
            <LfgLookingTeaser kind={openPost.kind} origin={Origin.LfgProfile} />
          ) : (
            <>
              <PostCard post={openPost} isMine={isMe} isLaunched={isLaunched} />
              {isMe && (
                <Link href={getLfgUrl(openPost.id)} passHref>
                  <Button
                    tag="a"
                    className="self-start"
                    variant={ButtonVariant.Secondary}
                    size={ButtonSize.Small}
                  >
                    Manage post
                  </Button>
                </Link>
              )}
              {!isMe &&
                canReachOutToLfgPost(openPost, user?.id, isLaunched) && (
                  <Button
                    type="button"
                    className="self-start"
                    variant={ButtonVariant.Primary}
                    size={ButtonSize.Small}
                    onClick={() => openReachOut(openPost, Origin.LfgProfile)}
                  >
                    Reach out to {getFirstName(name ?? openPost.author.name)}
                  </Button>
                )}
            </>
          )}
        </Section>
      )}
      {!openPost && isMe && (
        <Section title="Looking for group">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Looking for someone to build with, learn with or ask for help? While
            your post is up, your avatar wears the LFG badge everywhere you
            comment.
          </Typography>
          <Link href={lfgNewPostUrl} passHref>
            <Button
              tag="a"
              className="self-start"
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
            >
              New post
            </Button>
          </Link>
        </Section>
      )}
      {isMe && <HelperSection />}
    </>
  );
};

// The ring and the "LFG" tag over the profile's own avatar box.
export const LfgProfileAvatarBadge = ({
  userId,
}: {
  userId: string;
}): ReactElement | null => {
  const { user } = useAuthContext();
  const { isEnabled } = useLfgEnabled();
  const { data: post } = useQuery(
    userLfgPostQueryOptions(user, userId, { enabled: isEnabled }),
  );

  if (!isEnabled || post?.status !== LfgPostStatus.Open) {
    return null;
  }

  return (
    <span
      aria-hidden
      className="absolute inset-0 rounded-16 ring-2 ring-accent-avocado-default ring-offset-2 ring-offset-background-default"
    >
      <LfgBadgeMark size={LfgBadgeSize.Ribbon} />
    </span>
  );
};
