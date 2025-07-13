import classNames from 'classnames';
import type {
  KeyboardEventHandler,
  MouseEventHandler,
  ReactElement,
} from 'react';
import React from 'react';
import Link from '../utilities/Link';
import { SourceType } from '../../graphql/sources';
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
}

function PostSourceInfo({
  date,
  post,
  className,
  onClose,
  onReadArticle,
  showActions = true,
}: SourceInfoProps): ReactElement {
  const { source } = post;
  const { showActionBtn } = useShowFollowAction({
    entityId: source.id,
    entityType: ContentPreferenceType.Source,
  });
  const isUnknown = source.id === 'unknown';
  const { squad, isLoading: isLoadingSquad } = useSquad({
    handle: source.handle,
  });
  const { data } = useContentPreferenceStatusQuery({
    id: source.id,
    entity: ContentPreferenceType.Source,
  });

  const isFollowing = [
    ContentPreferenceStatus.Follow,
    ContentPreferenceStatus.Subscribed,
  ].includes(data?.status);

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
            <Link href={source.permalink}>
              <a className="text-text-secondary typo-callout">
                {source.handle}
              </a>
            </Link>
            {showActionBtn && (
              <>
                <Separator className="flex tablet:hidden" />
                {source?.type !== SourceType.Squad && (
                  <FollowButton
                    variant={ButtonVariant.Tertiary}
                    followedVariant={ButtonVariant.Tertiary}
                    buttonClassName={classNames(
                      'flex min-w-min !px-0 tablet:hidden',
                      !isFollowing && 'text-text-link',
                    )}
                    entityId={source.id}
                    status={data?.status}
                    type={ContentPreferenceType.Source}
                    entityName={source.name}
                    showSubscribe={false}
                  />
                )}
                {source?.type === SourceType.Squad && !isLoadingSquad && (
                  <SquadActionButton
                    buttonVariants={[ButtonVariant.Tertiary]}
                    size={ButtonSize.XSmall}
                    className={{
                      button: classNames(
                        'flex min-w-min !px-0 tablet:hidden',
                        !squad.currentMember && 'text-text-link',
                      ),
                    }}
                    squad={squad}
                    copy={{
                      join: 'Join',
                      leave: 'Leave',
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
              className="ml-auto hidden tablet:flex"
              contextMenuId="post-widgets-context"
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
