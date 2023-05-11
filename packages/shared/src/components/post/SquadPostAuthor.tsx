import React, { ReactElement } from 'react';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import { ProfilePicture } from '../ProfilePicture';
import SquadMemberBadge from '../squads/SquadMemberBadge';
import { Author } from '../../graphql/comments';
import { SourceMemberRole } from '../../graphql/sources';

interface SquadPostAuthorProps {
  author: Author;
  role: SourceMemberRole;
}

function SquadPostAuthor({ author, role }: SquadPostAuthorProps): ReactElement {
  return (
    <span className="flex flex-row items-center mt-3">
      <ProfileTooltip user={author}>
        <ProfilePicture user={author} size="xxxlarge" nativeLazyLoading />
      </ProfileTooltip>
      <ProfileTooltip user={author} link={{ href: author.permalink }}>
        <a className="flex flex-col ml-4">
          <div className="flex items-center">
            <span className="font-bold">{author.name}</span>
            <SquadMemberBadge key="squadMemberRole" role={role} />
          </div>
          <span className="text-theme-label-tertiary">@{author.username}</span>
        </a>
      </ProfileTooltip>
    </span>
  );
}

export default SquadPostAuthor;
