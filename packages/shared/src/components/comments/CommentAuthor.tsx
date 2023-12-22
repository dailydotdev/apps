import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Author } from '../../graphql/comments';
import { ProfileLink } from '../profile/ProfileLink';
import { ProfileTooltip } from '../profile/ProfileTooltip';

export interface CommentAuthorProps {
  author: Author;
  className?: string;
  appendTooltipTo?: () => HTMLElement;
  badges?: ReactElement[];
}

export default function CommentAuthor({
  author,
  className,
  appendTooltipTo,
  badges,
}: CommentAuthorProps): ReactElement {
  return (
    <ProfileTooltip user={author} tooltip={{ appendTo: appendTooltipTo }}>
      <ProfileLink
        href={author.permalink}
        className={classNames(
          'commentAuthor w-fit overflow-hidden whitespace-nowrap font-bold text-theme-label-primary typo-callout',
          className,
        )}
      >
        {author.name}
        {badges}
      </ProfileLink>
    </ProfileTooltip>
  );
}
