import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import SquadMemberBadge from '../squads/SquadMemberBadge';
import { Author } from '../../graphql/comments';
import { SourceMemberRole } from '../../graphql/sources';
import { Separator } from '../cards/common';

interface SquadPostAuthorProps {
  className?: Partial<{
    container: string;
    name: string;
    handle: string;
  }>;
  author: Author;
  role: SourceMemberRole;
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
      className={classNames(
        'flex flex-row items-center mt-3',
        className?.container,
      )}
    >
      <ProfileTooltip user={author} link={{ href: author.permalink }}>
        <ProfilePicture user={author} size={size} nativeLazyLoading />
      </ProfileTooltip>
      <ProfileTooltip user={author} link={{ href: author.permalink }}>
        <a href={author.permalink} className="flex flex-col ml-4">
          <div className="flex items-center">
            <span className={classNames('font-bold', className?.name)}>
              {author.name}
            </span>
            <SquadMemberBadge key="squadMemberRole" role={role} />
          </div>
          <span
            className={classNames(
              'text-theme-label-tertiary',
              className?.handle,
            )}
          >
            @{author.username}
            {!!date && (
              <>
                <Separator />
                <time dateTime={date}>{date}</time>
              </>
            )}
          </span>
        </a>
      </ProfileTooltip>
    </span>
  );
}

export default SquadPostAuthor;
