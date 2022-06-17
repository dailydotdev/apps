import React, { ReactElement } from 'react';
import { Author } from '../../graphql/comments';
import { ProfileLink } from '../profile/ProfileLink';
import FeatherIcon from '../icons/Feather';
import { ProfileTooltip } from '../profile/ProfileTooltip';

export interface CommentAuthorProps {
  postAuthorId: string | null;
  author: Author;
  appendTooltipTo?: () => HTMLElement;
}

export default function CommentAuthor({
  postAuthorId,
  author,
  appendTooltipTo,
}: CommentAuthorProps): ReactElement {
  return (
    <ProfileTooltip user={author} tooltip={{ appendTo: appendTooltipTo }}>
      <ProfileLink
        user={author}
        className="overflow-hidden font-bold whitespace-nowrap w-fit commentAuthor text-theme-label-primary typo-callout"
      >
        {author.name}
        {author.id === postAuthorId && (
          <span className="flex items-center ml-2 text-theme-status-help typo-footnote">
            <FeatherIcon className="mx-0.5" size="small" />
            Author
          </span>
        )}
      </ProfileLink>
    </ProfileTooltip>
  );
}
