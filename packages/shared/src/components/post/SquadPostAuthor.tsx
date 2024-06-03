import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import {
  getProfilePictureClasses,
  ProfileImageSize,
  ProfilePicture,
} from '../ProfilePicture';
import SquadMemberBadge from '../squads/SquadMemberBadge';
import { Author } from '../../graphql/comments';
import { SourceMemberRole } from '../../graphql/sources';
import { Separator } from '../cards/common';
import { ReputationUserBadge } from '../ReputationUserBadge';
import { TruncateText, DateFormat } from '../utilities';
import { TimeFormatType } from '../../lib/dateFormat';
import { ElementPlaceholder } from '../ElementPlaceholder';

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
  if (!author) {
    return <SquadPostAuthorSkeleton className={className} size={size} />;
  }

  return (
    <span
      className={classNames('flex flex-row items-center', className?.container)}
    >
      <ProfileTooltip user={author} link={{ href: author.permalink }}>
        <ProfilePicture user={author} size={size} nativeLazyLoading />
      </ProfileTooltip>
      <ProfileTooltip user={author} link={{ href: author.permalink }}>
        <a
          href={author.permalink}
          className={classNames(
            'ml-4 flex flex-1 flex-col overflow-hidden',
            className?.details,
          )}
        >
          <div className="flex w-full">
            <TruncateText
              className={classNames('font-bold', className?.name)}
              title={author.name}
            >
              {author.name}
            </TruncateText>
            <div className="flex gap-1">
              <ReputationUserBadge user={author} />
              {!!role && (
                <SquadMemberBadge
                  key="squadMemberRole"
                  role={SourceMemberRole.Admin}
                  removeMargins
                />
              )}
            </div>
          </div>
          <div
            className={classNames('flex text-text-tertiary', className?.handle)}
          >
            <TruncateText title={`@${author.username}`}>
              @{author.username}
            </TruncateText>
            {!!date && <Separator />}
            {!!date && <DateFormat date={date} type={TimeFormatType.Post} />}
          </div>
        </a>
      </ProfileTooltip>
    </span>
  );
}

export default SquadPostAuthor;
