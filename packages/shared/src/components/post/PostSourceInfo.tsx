import classNames from 'classnames';
import type {
  KeyboardEventHandler,
  MouseEventHandler,
  ReactElement,
} from 'react';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
import { useSquad, useViewSize, ViewSize } from '../../hooks';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import type { Post } from '../../graphql/posts';
import { PostHeaderActions } from './PostHeaderActions';

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
  const isMobile = useViewSize(ViewSize.MobileXL);
  const [showActionBtn, setShowActionBtn] = useState(false);
  const isUnknown = source.id === 'unknown';
  const { squad, isLoading: isLoadingSquad } = useSquad({
    handle: source.handle,
  });
  const { data, status } = useContentPreferenceStatusQuery({
    id: source.id,
    entity: ContentPreferenceType.Source,
  });

  useEffect(() => {
    if (isMobile && status === 'success' && !showActionBtn) {
      setShowActionBtn(
        ![
          ContentPreferenceStatus.Follow,
          ContentPreferenceStatus.Subscribed,
        ].includes(data?.status),
      );
    }
  }, [status, data?.status, showActionBtn, isMobile]);

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
            <Link
              href={source.permalink}
              className="text-text-secondary typo-callout"
            >
              {source.handle}
            </Link>
            {showActionBtn && <Separator />}
            {showActionBtn && source?.type !== SourceType.Squad && (
              <FollowButton
                variant={ButtonVariant.Tertiary}
                followedVariant={ButtonVariant.Tertiary}
                buttonClassName={classNames(
                  'min-w-min !px-0 ',
                  !isFollowing && 'text-text-link',
                )}
                entityId={source.id}
                status={data?.status}
                type={ContentPreferenceType.Source}
                entityName={source.name}
                showSubscribe={false}
              />
            )}
            {showActionBtn &&
              source?.type === SourceType.Squad &&
              !isLoadingSquad && (
                <SquadActionButton
                  buttonVariants={[ButtonVariant.Tertiary]}
                  size={ButtonSize.XSmall}
                  className={{
                    button: classNames(
                      'min-w-min !px-0',
                      !squad.currentMember && 'text-text-link',
                    ),
                  }}
                  squad={squad}
                  copy={{
                    join: 'Join',
                    leave: 'Leave',
                  }}
                  origin={Origin.PostContent}
                  showViewSquadIfMember={false}
                />
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
