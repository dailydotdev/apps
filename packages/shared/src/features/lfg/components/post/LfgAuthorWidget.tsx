import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
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
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../../../components/ProfilePicture';
import { ReputationUserBadge } from '../../../../components/ReputationUserBadge';
import { IconSize } from '../../../../components/Icon';
import { SendAirplaneIcon } from '../../../../components/icons/SendAirplane';
import { VolunteeringIcon } from '../../../../components/icons/Volunteering';
import { SquadWidget } from '../../../squads/components/widgets/SquadWidget';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { getMessagesUrl } from '../../../messages/urls';
import type { LfgHelper, LfgPost } from '../../types';
import { LfgKind, LfgPostStatus, LfgReachOutStatus } from '../../types';
import { LFG_DAILY_REACH_OUTS } from '../../constants';
import {
  lfgHelperQueryOptions,
  lfgReachOutsLeftQueryOptions,
} from '../../queries';
import { getFirstName, lfgRelativeDays } from '../../lib/format';
import { LfgReceipts } from '../LfgReceipts';

const Note = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-1 rounded-12 bg-surface-float px-3 py-2">
    <Typography type={TypographyType.Callout} bold>
      {title}
    </Typography>
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {children}
    </Typography>
  </div>
);

// Open to helping hears about Help posts on its topics, from the time zones
// and reputation it narrowed to.
const matchesHelper = (helper: LfgHelper, post: LfgPost): boolean =>
  post.kind === LfgKind.Help &&
  post.tags.some((tag) => helper.tags.includes(tag)) &&
  (!helper.timezones.length ||
    (typeof post.utcOffset === 'number' &&
      helper.timezones.includes(post.utcOffset))) &&
  (post.author.reputation ?? 0) >= helper.minReputation;

// What stands in for the Reach out button when there's nothing to press.
export const LfgReachOutState = ({
  post,
}: {
  post: LfgPost;
}): ReactElement | null => {
  const first = getFirstName(post.author.name);
  const { myReachOut } = post;

  if (myReachOut?.status === LfgReachOutStatus.Accepted) {
    return (
      <Link href={getMessagesUrl(post.author.id)} passHref>
        <Button
          tag="a"
          className="w-full"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Medium}
        >
          Open chat
        </Button>
      </Link>
    );
  }

  if (myReachOut?.status === LfgReachOutStatus.Filled) {
    return (
      <Note title="This spot was filled">
        {first} found someone. Thanks for reaching out.
      </Note>
    );
  }

  // A decline reads as pending to its sender.
  if (myReachOut) {
    return (
      <Note title={`Request sent ${lfgRelativeDays(myReachOut.createdAt)}`}>
        You&apos;ll get a notification if {first} accepts. If not, you
        won&apos;t hear anything.
      </Note>
    );
  }

  if (post.status === LfgPostStatus.Found) {
    return (
      <Note title={`${first} found someone`}>
        This post isn&apos;t taking reach-outs anymore.
      </Note>
    );
  }

  if (post.status === LfgPostStatus.Expired) {
    return (
      <Note title="This post expired">
        It isn&apos;t taking reach-outs anymore.
      </Note>
    );
  }

  if (post.isPaused) {
    return (
      <Note title="Paused for now">
        {first} has a lot of responses to go through. The post reopens as they
        answer them.
      </Note>
    );
  }

  return null;
};

export const LfgReachOutButton = ({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}): ReactElement => {
  const { user } = useAuthContext();
  const { data: left } = useQuery(lfgReachOutsLeftQueryOptions(user));

  return (
    <Button
      type="button"
      className={className}
      variant={ButtonVariant.Primary}
      size={ButtonSize.Medium}
      icon={<SendAirplaneIcon />}
      disabled={left === 0}
      onClick={onClick}
    >
      Reach out
    </Button>
  );
};

export const LfgCreditsLine = (): ReactElement | null => {
  const { user } = useAuthContext();
  const { data: left } = useQuery(lfgReachOutsLeftQueryOptions(user));

  if (typeof left !== 'number') {
    return null;
  }

  return (
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
      className="text-center tabular-nums"
    >
      {left} of {LFG_DAILY_REACH_OUTS} reach-outs left today. Accepted ones come
      back.
    </Typography>
  );
};

export const LfgAuthorWidget = ({
  post,
  canReachOut,
  onReachOut,
}: {
  post: LfgPost;
  canReachOut: boolean;
  onReachOut: () => void;
}): ReactElement => {
  const { user } = useAuthContext();
  const { data: helper } = useQuery(
    lfgHelperQueryOptions(user, { enabled: post.kind === LfgKind.Help }),
  );
  const { author } = post;
  const isHelpMatch = !!helper && matchesHelper(helper, post);

  return (
    <SquadWidget title={`About ${getFirstName(author.name)}`}>
      <Link href={author.permalink} passHref>
        <a
          href={author.permalink}
          className="mt-3 flex min-w-0 items-center gap-2"
        >
          <ProfilePicture
            user={author}
            size={ProfileImageSize.Large}
            nativeLazyLoading
          />
          <span className="flex min-w-0 shrink flex-col">
            <span className="flex min-w-0 items-center gap-1">
              <Typography type={TypographyType.Callout} bold truncate>
                {author.name}
              </Typography>
              <ReputationUserBadge user={author} disableTooltip />
            </span>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              truncate
            >
              @{author.username}
            </Typography>
          </span>
        </a>
      </Link>
      {author.bio && (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Secondary}
          className="mt-3 break-words"
        >
          {author.bio}
        </Typography>
      )}
      <LfgReceipts person={author} className="mt-3" />
      {isHelpMatch && (
        <div className="mt-3 flex items-center gap-2 rounded-12 bg-action-upvote-float px-3 py-2 text-accent-avocado-default typo-footnote">
          <VolunteeringIcon size={IconSize.Size16} secondary />
          <span className="min-w-0 flex-1">
            Matches what you&apos;re open to helping with
          </span>
        </div>
      )}
      <div
        className={classNames(
          'mt-4 hidden laptop:flex',
          canReachOut && 'flex-col gap-2',
        )}
      >
        {canReachOut ? (
          <>
            <LfgReachOutButton className="w-full" onClick={onReachOut} />
            <LfgCreditsLine />
          </>
        ) : (
          <div className="w-full">
            <LfgReachOutState post={post} />
          </div>
        )}
      </div>
    </SquadWidget>
  );
};
