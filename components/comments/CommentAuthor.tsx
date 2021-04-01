import React, { ReactElement } from 'react';
import { Author } from '../../graphql/comments';
import { ProfileLink } from '../profile/ProfileLink';
import FeatherIcon from '../../icons/feather.svg';

export interface CommentAuthorProps {
  postAuthorId: string | null;
  author: Author;
}

export default function CommentAuthor({
  postAuthorId,
  author,
}: CommentAuthorProps): ReactElement {
  return (
    <ProfileLink
      user={author}
      className="commentAuthor text-theme-label-primary whitespace-nowrap overflow-hidden font-bold typo-callout"
    >
      {author.name}
      {author.id === postAuthorId && (
        <span className="flex items-center ml-2 text-theme-status-help typo-footnote">
          <FeatherIcon className="icon text-base ml-1" />
          Author
        </span>
      )}
    </ProfileLink>
  );
}
