import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Author } from '../../graphql/comments';
import { ProfileLink } from '../profile/ProfileLink';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import { TruncateText } from '../utilities';

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
          'commentAuthor w-fit font-bold text-text-primary typo-callout',
          className,
        )}
        title={author.name}
      >
        <TruncateText>{author.name}</TruncateText>
      </ProfileLink>
    </ProfileTooltip>
  );
}
