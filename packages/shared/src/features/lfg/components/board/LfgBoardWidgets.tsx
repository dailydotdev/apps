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
import { lfgHelperQueryOptions } from '../../queries';
import {
  formatLfgReputation,
  formatUtcOffset,
  getLfgReachOutUrl,
  getLfgUrl,
  lfgDaysLeft,
  lfgNewPostUrl,
} from '../../lib/format';
import { useLfgTagLabel } from '../LfgTags';

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

export const LfgYourPostWidget = ({
  post,
}: {
  post: LfgPost | null | undefined;
}): ReactElement => {
  if (!post) {
    return (
      <SquadWidget title="Looking for someone?">
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
  const getLabel = useLfgTagLabel();

  return (helper: LfgHelper) =>
    [
      `Help requests on ${helper.tags.map(getLabel).join(', ')}.`,
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
