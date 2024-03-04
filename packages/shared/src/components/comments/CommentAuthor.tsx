import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Author } from '../../graphql/comments';
import { ProfileLink } from '../profile/ProfileLink';
import { ProfileTooltip } from '../profile/ProfileTooltip';

export interface CommentAuthorProps {
  author: Author;
  className?: string;
  appendTooltipTo?: () => HTMLElement;
}

export default function CommentAuthor({
  author,
  className,
  appendTooltipTo,
}: CommentAuthorProps): ReactElement {
  return (
    <ProfileTooltip user={author} tooltip={{ appendTo: appendTooltipTo }}>
      <ProfileLink
        href={author.permalink}
        className={classNames(
          'commentAuthor w-fit font-bold text-theme-label-primary typo-callout',
          className,
        )}
      >
        <span className="max-w-full truncate">{author.name}</span>
      </ProfileLink>
    </ProfileTooltip>
  );
}
