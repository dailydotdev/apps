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
  role?: SourceMemberRole;
  size?: ProfileImageSize;
  date?: string;
}

const lineClamp = 'block text-ellipsis whitespace-nowrap';

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
        'mt-3 flex flex-row items-center',
        className?.container,
      )}
    >
      <ProfileTooltip user={author} link={{ href: author.permalink }}>
        <ProfilePicture user={author} size={size} nativeLazyLoading />
      </ProfileTooltip>
      <div className="ml-4 flex flex-1 flex-col overflow-hidden">
        <ProfileTooltip user={author} link={{ href: author.permalink }}>
          <a href={author.permalink} className={lineClamp}>
            <span className={classNames('font-bold', className?.name)}>
              {author.name}
            </span>
            {!!role && <SquadMemberBadge key="squadMemberRole" role={role} />}
          </a>
        </ProfileTooltip>
        <ProfileTooltip user={author} link={{ href: author.permalink }}>
          <a
            href={author.permalink}
            className={classNames(
              'text-theme-label-tertiary',
              className?.handle,
              lineClamp,
            )}
          >
            @{author.username}
            {!!date && <Separator />}
            {!!date && <time dateTime={date}>{date}</time>}
          </a>
        </ProfileTooltip>
      </div>
    </span>
  );
}

export default SquadPostAuthor;
