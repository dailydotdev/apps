import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { SourcePostModeration } from '../../../graphql/squads';
import { WarningReason } from '../../../graphql/squads';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import SourceProfilePicture from '../../profile/SourceProfilePicture';
import { ReputationUserBadge } from '../../ReputationUserBadge';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { DateFormat } from '../../utilities/DateFormat';
import {
  publishTimeRelativeShort,
  TimeFormatType,
} from '../../../lib/dateFormat';
import { InfoIcon } from '../../icons';
import { IconSize } from '../../Icon';

interface SquadModerationAuthorProps {
  data: SourcePostModeration;
  className?: string;
}

// Who posted and how they have done in the squad, the first thing a
// moderator weighs.
export const SquadModerationAuthor = ({
  data,
  className,
}: SquadModerationAuthorProps): ReactElement | null => {
  const { createdBy, createdAt, authorContext } = data;

  if (!createdBy) {
    return null;
  }

  const meta = [
    `@${createdBy.username}`,
    authorContext?.joinedAt &&
      `joined ${publishTimeRelativeShort(authorContext.joinedAt)} ago`,
    !!authorContext?.postsCount &&
      `${authorContext.postsCount} ${
        authorContext.postsCount === 1 ? 'post' : 'posts'
      } here`,
  ].filter(Boolean);

  return (
    <div className={classNames('flex min-w-0 items-center gap-3', className)}>
      <ProfilePicture
        className="pointer-events-none"
        user={createdBy}
        size={ProfileImageSize.Large}
        nativeLazyLoading
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-w-0 items-center gap-1">
          <Typography
            type={TypographyType.Callout}
            bold
            truncate
            className="min-w-0 shrink"
          >
            {createdBy.name}
          </Typography>
          <ReputationUserBadge user={createdBy} disableTooltip />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="shrink-0"
          >
            · <DateFormat date={createdAt} type={TimeFormatType.Post} />
          </Typography>
        </div>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          truncate
        >
          {meta.join(' · ')}
        </Typography>
      </div>
    </div>
  );
};

const warningLabels: Record<WarningReason, string> = {
  [WarningReason.MultipleSquadPost]: 'Shared in several Squads',
  [WarningReason.DuplicatedInSameSquad]: 'Already shared here',
};

const Signal = ({
  children,
  isWarning = false,
}: {
  children: ReactNode;
  isWarning?: boolean;
}): ReactElement => (
  <span
    className={classNames(
      'flex h-6 min-w-0 items-center gap-1 rounded-8 px-2 font-bold typo-caption1',
      isWarning
        ? 'bg-overlay-float-bun text-accent-bun-default'
        : 'border border-border-subtlest-tertiary text-text-tertiary',
    )}
  >
    {children}
  </span>
);

interface SquadModerationSignalsProps {
  data: SourcePostModeration;
  /** The queue of every squad the viewer moderates names each post's squad. */
  showSource?: boolean;
}

export const SquadModerationSignals = ({
  data,
  showSource = false,
}: SquadModerationSignalsProps): ReactElement | null => {
  const { authorContext, flags, post, source } = data;
  const warning = flags?.warningReason;
  const isFirstPost = authorContext?.postsCount === 0;
  const rejectedCount = authorContext?.rejectedCount ?? 0;
  const hasSignals =
    (showSource && !!source) ||
    !!warning ||
    isFirstPost ||
    rejectedCount > 0 ||
    !!post;

  if (!hasSignals) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {showSource && source && (
        <Signal>
          <SourceProfilePicture
            className="pointer-events-none"
            source={source}
            size={ProfileImageSize.Size16}
          />
          <span className="truncate">{source.name}</span>
        </Signal>
      )}
      {warning && (
        <Signal isWarning>
          <InfoIcon secondary size={IconSize.Size16} />
          {warningLabels[warning]}
        </Signal>
      )}
      {rejectedCount > 0 && (
        <Signal isWarning>{rejectedCount} declined before</Signal>
      )}
      {isFirstPost && <Signal>First post here</Signal>}
      {!!post && <Signal>Edit of a live post</Signal>}
    </div>
  );
};
