import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Author } from '../../graphql/comments';
import { ProfileLink } from '../profile/ProfileLink';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import { TruncateText } from '../utilities';

export interface CommentAuthorProps {
  author?: Author | null;
  className?: string;
  appendTooltipTo?: () => HTMLElement;
}

export const deletedCommentAuthorName = 'Deleted user';

export default function CommentAuthor({
  author,
  className,
  appendTooltipTo,
}: CommentAuthorProps): ReactElement {
  if (!author) {
    return (
      <span
        className={classNames(
          'commentAuthor w-fit font-bold text-text-primary typo-callout',
          className,
        )}
        title={deletedCommentAuthorName}
      >
        <TruncateText>{deletedCommentAuthorName}</TruncateText>
      </span>
    );
  }

  return (
    <ProfileTooltip userId={author.id} tooltip={{ appendTo: appendTooltipTo }}>
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
