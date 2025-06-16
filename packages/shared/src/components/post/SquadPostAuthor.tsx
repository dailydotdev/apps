import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  getProfilePictureClasses,
  ProfileImageSize,
  ProfilePicture,
} from '../ProfilePicture';
import type { Author } from '../../graphql/comments';
import type { SourceMemberRole } from '../../graphql/sources';
import { ReputationUserBadge } from '../ReputationUserBadge';
import { DateFormat, TruncateText, getRoleName } from '../utilities';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { VerifiedCompanyUserBadge } from '../VerifiedCompanyUserBadge';
import { PlusUserBadge } from '../PlusUserBadge';
import UserBadge from '../UserBadge';
import { IconSize } from '../Icon';
import { Separator } from '../cards/common/common';
import { TimeFormatType } from '../../lib/dateFormat';
import { FollowButton } from '../contentPreference/FollowButton';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../../graphql/contentPreference';
import { useContentPreferenceStatusQuery } from '../../hooks/contentPreference/useContentPreferenceStatusQuery';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { ButtonVariant } from '../buttons/Button';

interface SquadPostAuthorProps {
  className?: Partial<{
    container: string;
    name: string;
    handle: string;
    details: string;
  }>;
  author: Author;
  role?: SourceMemberRole;
  size?: ProfileImageSize;
  date?: string;
}

const SquadPostAuthorSkeleton = ({
  size,
  className,
}: Pick<SquadPostAuthorProps, 'className' | 'size'>) => {
  return (
    <span
      className={classNames('flex flex-row items-center', className?.container)}
    >
      <ElementPlaceholder className={getProfilePictureClasses(size)} />
      <div className="ml-4 flex flex-1 flex-col gap-1">
        <ElementPlaceholder className="h-6 w-20 rounded-10" />
        <ElementPlaceholder className="h-6 w-28 rounded-10" />
      </div>
    </span>
  );
};

function SquadPostAuthor({
  className,
  author,
  role,
  size = ProfileImageSize.XXXLarge,
  date,
}: SquadPostAuthorProps): ReactElement {
  const isMobile = useViewSize(ViewSize.MobileXL);
  const { data, status } = useContentPreferenceStatusQuery({
    id: author.id,
    entity: ContentPreferenceType.User,
    queryOptions: {
      enabled: !!author && isMobile,
    },
  });
  const [showFollowButton, setShowFollowButton] = useState(false);

  useEffect(() => {
    if (isMobile && status === 'success' && !showFollowButton) {
      setShowFollowButton(
        ![
          ContentPreferenceStatus.Follow,
          ContentPreferenceStatus.Subscribed,
        ].includes(data?.status),
      );
    }
  }, [status, data?.status, showFollowButton, isMobile]);

  if (!author) {
    return <SquadPostAuthorSkeleton className={className} size={size} />;
  }

  const showFollow = author && isMobile && showFollowButton;

  return (
    <span
      className={classNames('flex flex-row items-center', className?.container)}
    >
      <ProfilePicture
        user={author}
        size={size}
        nativeLazyLoading
        eager
        fetchPriority="high"
      />
      <a
        href={author.permalink}
        className={classNames(
          'ml-4 flex shrink flex-col overflow-hidden',
          className?.details,
        )}
      >
        <div
          className={classNames(
            'flex gap-1 text-text-tertiary',
            className?.handle,
          )}
        >
          <TruncateText
            className={classNames('font-bold', className?.name)}
            title={author.name}
          >
            {author.name}
          </TruncateText>
          {author?.isPlus && (
            <PlusUserBadge size={IconSize.Small} user={author} />
          )}
          <TruncateText title={`@${author.username}`}>
            @{author.username}
          </TruncateText>
          {!!date && <Separator className="!mx-0" />}
          {!!date && <DateFormat date={date} type={TimeFormatType.Post} />}
        </div>
        <div className="flex w-full">
          <div className="flex gap-1">
            <ReputationUserBadge user={author} />
            {author?.companies?.length > 0 && (
              <VerifiedCompanyUserBadge user={author} />
            )}
            <UserBadge role={role}>{getRoleName(role)}</UserBadge>
          </div>
        </div>
      </a>
      {showFollow && (
        <FollowButton
          className="my-auto mb-auto pl-2"
          entityId={author.id}
          showSubscribe={false}
          type={ContentPreferenceType.User}
          entityName={author.name}
          status={data?.status}
          variant={ButtonVariant.Primary}
        />
      )}
    </span>
  );
}

export default SquadPostAuthor;
