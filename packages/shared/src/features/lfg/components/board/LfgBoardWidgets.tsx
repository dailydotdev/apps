import type { ReactElement } from 'react';
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
import { PlusIcon } from '../../../../components/icons/Plus';
import { VolunteeringIcon } from '../../../../components/icons/Volunteering';
import { SquadWidget } from '../../../squads/components/widgets/SquadWidget';
import { useAuthContext } from '../../../../contexts/AuthContext';
import type { LfgHelper, LfgPost } from '../../types';
import { LfgPostStatus } from '../../types';
import { lfgHelperQueryOptions, myLfgPostsQueryOptions } from '../../queries';
import {
  formatLfgReputation,
  formatUtcOffset,
  getLfgReachOutUrl,
  getLfgUrl,
  lfgDaysLeft,
  lfgNewPostUrl,
} from '../../lib/format';
import { getLfgTagLabel } from '../LfgTags';

// The why of Looking for group, the first widget on the board.
export const LfgFindYourPeopleWidget = (): ReactElement => (
  <SquadWidget title="Find your people">
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Secondary}
      className="mt-1"
    >
      A lot of us work remotely and alone now, pairing with an AI more than with
      people. Looking for group helps you find people to build with, learn with
      or get unstuck with.
    </Typography>
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
      className="mt-2"
    >
      No gigs, hiring or selling services.
    </Typography>
  </SquadWidget>
);

// Phones list the side widgets under the endless board, so the open post
// sits above it instead.
export const LfgYourPostStrip = ({ post }: { post: LfgPost }): ReactElement => {
  const waiting = post.pendingCount ?? 0;

  return (
    <div className="flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary p-3 laptop:hidden">
      <Link href={getLfgUrl(post.id)} passHref>
        <a href={getLfgUrl(post.id)} className="flex min-w-0 flex-1 flex-col">
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            Your post
          </Typography>
          <Typography type={TypographyType.Footnote} bold truncate>
            {post.title}
          </Typography>
        </a>
      </Link>
      {waiting > 0 ? (
        <Link href={getLfgReachOutUrl()} passHref>
          <Button
            tag="a"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
          >
            Review {waiting}
          </Button>
        </Link>
      ) : (
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          No responses yet
        </Typography>
      )}
    </div>
  );
};

export const LfgYourPostWidget = ({
  post,
  className,
}: {
  post: LfgPost | null | undefined;
  className?: string;
}): ReactElement => {
  if (!post) {
    return (
      <SquadWidget title="Looking for someone?" className={className}>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="mt-1"
        >
          Post what you need, and your avatar wears the LFG badge while
          it&apos;s up.
        </Typography>
        <Link href={lfgNewPostUrl} passHref>
          <Button
            tag="a"
            className="mt-3 w-full"
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            icon={<PlusIcon />}
          >
            New post
          </Button>
        </Link>
      </SquadWidget>
    );
  }

  const daysLeft = lfgDaysLeft(post.expiresAt);

  return (
    <SquadWidget
      title="Your post"
      className={className}
      action={
        <Link href={getLfgUrl(post.id)} passHref>
          <Button
            tag="a"
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Small}
          >
            Open
          </Button>
        </Link>
      }
    >
      <Typography
        type={TypographyType.Callout}
        className="mt-2 line-clamp-2 break-words"
      >
        {post.title}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="mt-1 tabular-nums"
      >
        {post.pendingCount ?? 0} waiting · {daysLeft}{' '}
        {daysLeft === 1 ? 'day' : 'days'} left
      </Typography>
      <Link href={getLfgReachOutUrl()} passHref>
        <Button
          tag="a"
          className="mt-3 w-full"
          variant={ButtonVariant.Subtle}
          size={ButtonSize.Small}
        >
          Review responses
        </Button>
      </Link>
    </SquadWidget>
  );
};

const LFG_PAST_POSTS_SHOWN = 5;

// Found and expired posts, so their author can open one and reopen it.
export const LfgPastPostsWidget = (): ReactElement | null => {
  const { user } = useAuthContext();
  const { data: posts = [] } = useQuery(myLfgPostsQueryOptions(user));
  const past = posts
    .filter(({ status }) => status !== LfgPostStatus.Open)
    .slice(0, LFG_PAST_POSTS_SHOWN);

  if (!past.length) {
    return null;
  }

  return (
    <SquadWidget title="Your past posts">
      <ul className="-mx-2 mt-2 flex flex-col">
        {past.map((post) => (
          <li key={post.id}>
            <Link href={getLfgUrl(post.id)} passHref>
              <a
                href={getLfgUrl(post.id)}
                className="flex flex-col rounded-10 px-2 py-1.5 transition-colors hover:bg-surface-hover"
              >
                <Typography type={TypographyType.Callout} truncate>
                  {post.title}
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  {post.status === LfgPostStatus.Found
                    ? 'Found someone'
                    : 'Expired'}
                </Typography>
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </SquadWidget>
  );
};

// "From people in UTC+1 or UTC+2 with 500+ reputation."
const getHelperAudience = (helper: LfgHelper): string | undefined => {
  const parts = [
    helper.timezones.length > 0 &&
      `in ${helper.timezones.map(formatUtcOffset).join(' or ')}`,
    helper.minReputation > 0 &&
      `with ${formatLfgReputation(helper.minReputation)}`,
  ].filter(Boolean);

  return parts.length ? `From people ${parts.join(' ')}.` : undefined;
};

export const useLfgHelperSummary = (): ((helper: LfgHelper) => string) => {
  return (helper: LfgHelper) =>
    [
      `Help requests on ${helper.tags.map(getLfgTagLabel).join(', ')}.`,
      getHelperAudience(helper),
      `Up to ${helper.perMonth} a month.`,
    ]
      .filter(Boolean)
      .join(' ');
};

export const LfgHelperWidget = ({
  onOpen,
}: {
  onOpen: () => void;
}): ReactElement => {
  const { user } = useAuthContext();
  const { data: helper } = useQuery(lfgHelperQueryOptions(user));
  const getSummary = useLfgHelperSummary();

  return (
    <SquadWidget
      title="Open to helping"
      action={
        helper && (
          <Button
            type="button"
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Small}
            onClick={onOpen}
          >
            Edit
          </Button>
        )
      }
    >
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="mt-1"
      >
        {helper
          ? `${getSummary(helper)} Only you can see this.`
          : 'Get a heads-up when someone needs help with something you know. It stays private.'}
      </Typography>
      {!helper && (
        <Button
          type="button"
          className="mt-3 w-full"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          icon={<VolunteeringIcon />}
          onClick={onOpen}
        >
          Open to helping
        </Button>
      )}
    </SquadWidget>
  );
};
