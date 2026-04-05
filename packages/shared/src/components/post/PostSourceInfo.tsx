import classNames from 'classnames';
import type {
  KeyboardEventHandler,
  MouseEventHandler,
  ReactElement,
} from 'react';
import React from 'react';
import Link from '../utilities/Link';
import { isSourceUserSource, SourceType } from '../../graphql/sources';
import { Separator } from '../cards/common/common';
import type { ProfileImageSize } from '../ProfilePicture';
import { FollowButton } from '../contentPreference/FollowButton';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../../graphql/contentPreference';
import { useContentPreferenceStatusQuery } from '../../hooks/contentPreference/useContentPreferenceStatusQuery';
import { SquadActionButton } from '../squads/SquadActionButton';
import { Origin } from '../../lib/log';
import { useSquad } from '../../hooks';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import type { Post } from '../../graphql/posts';
import { PostHeaderActions } from './PostHeaderActions';
import useShowFollowAction from '../../hooks/useShowFollowAction';

interface SourceInfoProps {
  post: Post;
  date?: string;
  size?: ProfileImageSize;
  className?: string;
  onClose?: MouseEventHandler | KeyboardEventHandler;
  onReadArticle?: () => void;
  showActions?: boolean;
  hideSubscribeAction?: boolean;
}

function PostSourceInfo({
  date,
  post,
  className,
  onClose,
  onReadArticle,
  showActions = true,
  hideSubscribeAction,
}: SourceInfoProps): ReactElement {
  const { source } = post;
  const sourceId = source?.id ?? '';
  const sourceHandle = source?.handle ?? '';
  const sourceName = source?.name ?? '';
  const sourcePermalink = source?.permalink ?? '';
  const { showActionBtn } = useShowFollowAction({
    entityId: sourceId,
    entityType: ContentPreferenceType.Source,
  });
  const isUnknown = sourceId === 'unknown';
  const { squad, isLoading: isLoadingSquad } = useSquad({
    handle: sourceHandle,
  });
  const { data } = useContentPreferenceStatusQuery({
    id: sourceId,
    entity: ContentPreferenceType.Source,
  });
  const isUserSource = isSourceUserSource(post?.source);
  const contentPreferenceStatus = data?.status;

  const isFollowing =
    contentPreferenceStatus === ContentPreferenceStatus.Follow ||
    contentPreferenceStatus === ContentPreferenceStatus.Subscribed;

  return (
    <span
      className={classNames(
        'flex flex-row items-center text-text-tertiary typo-footnote',
        className,
      )}
    >
      {!isUnknown && (
        <>
          <div className="flex flex-row items-center">
            {!isUserSource && (
              <Link href={sourcePermalink}>
                <a className="text-text-secondary typo-callout">
                  {sourceHandle}
                </a>
              </Link>
            )}
            {showActionBtn && (
              <>
                {!isUserSource && <Separator className="flex tablet:hidden" />}
                {source?.type !== SourceType.Squad && !isUserSource && (
                  <FollowButton
                    variant={ButtonVariant.Tertiary}
                    followedVariant={ButtonVariant.Tertiary}
                    buttonClassName={classNames(
                      'flex min-w-min !px-0 tablet:hidden',
                      !isFollowing && 'text-text-link',
                    )}
                    entityId={sourceId}
                    status={contentPreferenceStatus}
                    type={ContentPreferenceType.Source}
                    entityName={sourceName}
                    showSubscribe={false}
                  />
                )}
                {source?.type === SourceType.Squad &&
                  !isLoadingSquad &&
                  squad && (
                    <SquadActionButton
                      buttonVariants={[ButtonVariant.Tertiary]}
                      size={ButtonSize.XSmall}
                      className={{
                        button: classNames(
                          'flex min-w-min !px-0 tablet:hidden',
                          !squad?.currentMember && 'text-text-link',
                        ),
                      }}
                      squad={squad}
                      copy={{
                        join: 'Join',
                      }}
                      origin={Origin.PostContent}
                    />
                  )}
              </>
            )}
          </div>
          {showActions && (
            <PostHeaderActions
              post={post}
              onClose={onClose}
              onReadArticle={onReadArticle}
              hideSubscribeAction={hideSubscribeAction}
              className="ml-auto hidden laptop:flex"
              contextMenuId="post-widgets-context"
              buttonSize={ButtonSize.Small}
            />
          )}
        </>
      )}
      {!!date && (
        <>
          {!isUnknown && <Separator />}
          <time dateTime={date}>{date}</time>
        </>
      )}
    </span>
  );
}

export default PostSourceInfo;
