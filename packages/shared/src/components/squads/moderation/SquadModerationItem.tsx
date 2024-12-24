import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { CardImage } from '../../cards/common/Card';
import PostTags from '../../cards/common/PostTags';
import { SourcePostModerationStatus } from '../../../graphql/squads';
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

export function SquadModerationItem(
  props: SquadModerationItemProps,
): ReactElement {
  const { context, modal, user } = useSourceModerationItem(props);
  const { data, squad, onApprove, onReject, isPending } = props;
  const { rejectionReason, createdBy, createdAt, image, status } = data;

  const IconComponent =
    status === SourcePostModerationStatus.Rejected ? WarningIcon : TimerIcon;

  const post = data.sharedPost || data.post;
  const { title } = useTruncatedSummary(
    data?.title || data.sharedPost?.title || data.post?.title,
  );

  return (
    <div className="relative flex flex-col gap-4 border-b border-border-subtlest-tertiary p-6 hover:bg-surface-hover">
      <button
        aria-label={`Review ${title}`}
        className="absolute inset-0"
        onClick={modal.open}
        type="button"
      />
      <div className="flex flex-row gap-4">
        <ProfilePicture user={createdBy} size={ProfileImageSize.Large} />
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
            />
          </span>
        )}
      </div>
      <div className="flex flex-col gap-4 tablet:flex-row">
        <div className="flex flex-1 flex-col gap-4">
          <Typography
            className="break-words"
            tag={TypographyTag.H2}
            type={TypographyType.Title3}
            bold
          >
            {title}
          </Typography>
          <PostTags className="!mx-0 min-w-full" tags={post?.tags} />
        </div>
        <div className="flex-1">
          <CardImage className="mx-auto" src={image || post?.image} />
        </div>
      </div>
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
