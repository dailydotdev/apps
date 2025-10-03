import type { ReactElement } from 'react';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import {
  SourcePostModerationStatus,
  WarningReason,
} from '../../../graphql/squads';
import { SquadModerationActions } from './SquadModerationActions';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import PostMetadata from '../../cards/common/PostMetadata';
import { AlertPointerMessage } from '../../alert/common';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { capitalize } from '../../../lib/strings';
import { TimerIcon, WarningIcon } from '../../icons';
import { AlertColor } from '../../AlertDot';
import { useTruncatedSummary } from '../../../hooks';
import type { SquadModerationItemProps } from './useSourceModerationItem';
import { useSourceModerationItem } from './useSourceModerationItem';
import { SquadModerationItemContextMenu } from './SquadModerationItemContextMenu';
import SourceProfilePicture from '../../profile/SourceProfilePicture';
import { PostType } from '../../../types';
import { SquadModerationPoll } from './SquadModerationPoll';
import { SquadModerationDefault } from './SquadModerationDefault';
import SpamWarning from '../../widgets/SpamWarning';

const SquadModerationPreview = (props: SquadModerationItemProps) => {
  const { data } = props;
  switch (data?.type) {
    case PostType.Poll:
      return <SquadModerationPoll {...props} />;
    default:
      return <SquadModerationDefault {...props} />;
  }
};

const SpamWarnings = {
  [WarningReason.MultipleSquadPost]: 'Shared in multiple Squads - Spam alert',
  [WarningReason.DuplicatedInSameSquad]:
    'Duplicate post - the same post has been previously shared in the Squad"',
};

export function SquadModerationItem(
  props: SquadModerationItemProps,
): ReactElement {
  const searchParams = useSearchParams();
  const handle = searchParams?.get('handle');
  const { context, modal, user } = useSourceModerationItem(props);
  const { data, squad, onApprove, onReject, isPending } = props;
  const { rejectionReason, createdBy, createdAt, status, source } = data;

  const IconComponent =
    status === SourcePostModerationStatus.Rejected ? WarningIcon : TimerIcon;

  const post = data.sharedPost || data.post;
  const { title } = useTruncatedSummary(
    data?.title || data.sharedPost?.title || data.post?.title,
  );

  return (
    <div className="relative flex flex-col gap-4 border-b border-border-subtlest-tertiary p-6 hover:bg-surface-hover">
      {data.flags?.warningReason && user.isModerator && (
        <SpamWarning content={SpamWarnings[data.flags?.warningReason]} />
      )}
      <button
        aria-label={`Review ${title}`}
        className="absolute inset-0"
        onClick={modal.open}
        type="button"
      />
      {!handle && (
        <div className="flex gap-2">
          <SourceProfilePicture
            className="pointer-events-none"
            source={source}
            size={ProfileImageSize.Small}
          />
          <Typography
            color={TypographyColor.Tertiary}
            type={TypographyType.Callout}
          >
            {source.name}
          </Typography>
        </div>
      )}
      <div className="flex flex-row gap-4">
        <ProfilePicture
          className="pointer-events-none"
          user={createdBy}
          size={ProfileImageSize.Large}
        />
        <div className="flex flex-col gap-1">
          <Typography bold type={TypographyType.Footnote}>
            {createdBy.name}
          </Typography>
          <div className="flex flex-row gap-1">
            <PostMetadata readTime={post?.readTime} createdAt={createdAt} />
            {!!data.post && (
              <Typography
                color={TypographyColor.Tertiary}
                type={TypographyType.Footnote}
              >
                - Resubmitted Post
              </Typography>
            )}
          </div>
        </div>
        {!user.isModerator && (
          <span className="ml-auto flex flex-row gap-2">
            <Button
              icon={
                <IconComponent
                  aria-hidden
                  role="presentation"
                  fill="currentcolor"
                />
              }
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              disabled
            >
              {capitalize(status)}
            </Button>
            <SquadModerationItemContextMenu
              id={data.id}
              onDelete={context.onDelete}
              canEdit={data?.type !== PostType.Poll}
            />
          </span>
        )}
      </div>
      <SquadModerationPreview {...props} />
      {status === SourcePostModerationStatus.Rejected && !user.isModerator && (
        <AlertPointerMessage color={AlertColor.Bun}>
          Your post in {squad.name} was not approved for the following reason:
          {rejectionReason}. Please review the feedback and consider making
          changes before resubmitting.
        </AlertPointerMessage>
      )}
      {user.isModerator && (
        <div className="relative z-1">
          <SquadModerationActions
            onApprove={onApprove}
            onReject={onReject}
            isLoading={isPending}
          />
        </div>
      )}
    </div>
  );
}
