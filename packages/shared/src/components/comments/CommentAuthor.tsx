import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Author } from '../../graphql/comments';
import { ProfileLink } from '../profile/ProfileLink';
import FeatherIcon from '../icons/Feather';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import { Source } from '../../graphql/sources';
import SquadMemberRoleBadge from '../squads/SquadMemberRoleBadge';

export interface CommentAuthorProps {
  postAuthorId: string | null;
  author: Author;
  className?: string;
  appendTooltipTo?: () => HTMLElement;
  source?: Source;
}

export default function CommentAuthor({
  postAuthorId,
  author,
  className,
  appendTooltipTo,
  source,
}: CommentAuthorProps): ReactElement {
  return (
    <ProfileTooltip user={author} tooltip={{ appendTo: appendTooltipTo }}>
      <ProfileLink
        href={author.permalink}
        className={classNames(
          'overflow-hidden font-bold whitespace-nowrap w-fit commentAuthor text-theme-label-primary typo-callout',
          className,
        )}
      >
        {author.name}
        {!!source && <SquadMemberRoleBadge source={source} author={author} />}
        {author.id === postAuthorId && (
          <span className="flex items-center ml-2 text-theme-status-help typo-footnote">
            <FeatherIcon secondary className="mx-0.5" />
            Author
          </span>
        )}
      </ProfileLink>
    </ProfileTooltip>
  );
}
