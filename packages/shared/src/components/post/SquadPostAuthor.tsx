import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import SquadMemberBadge from '../squads/SquadMemberBadge';
import { Author } from '../../graphql/comments';
import { SourceMemberRole } from '../../graphql/sources';
import { Separator } from '../cards/common';
import { ReputationUserBadge } from '../ReputationUserBadge';
import { TruncateText } from '../utilities';

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

function SquadPostAuthor({
  className,
  author,
  role,
  size = 'xxxlarge',
  date,
}: SquadPostAuthorProps): ReactElement {
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
            <TruncateText className={classNames('font-bold', className?.name)}>
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
            className={classNames(
              'flex text-theme-label-tertiary',
              className?.handle,
            )}
          >
            <TruncateText>@{author.username}</TruncateText>
            {!!date && <Separator />}
            {!!date && <time dateTime={date}>{date}</time>}
          </div>
        </a>
      </ProfileTooltip>
    </span>
  );
}

export default SquadPostAuthor;
