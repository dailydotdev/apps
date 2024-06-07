import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import { Comment, getCommentHash } from '../../graphql/comments';
import { Post } from '../../graphql/posts';
import { FeatherIcon, ScoutIcon } from '../icons';
import Markdown from '../Markdown';
import { ProfileImageLink } from '../profile/ProfileImageLink';
import { ProfileLink } from '../profile/ProfileLink';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import SquadMemberBadge from '../squads/SquadMemberBadge';
import UserBadge from '../UserBadge';
import { FlexRow, TruncateText } from '../utilities';
import CommentAuthor from './CommentAuthor';
import { CommentPublishDate } from './CommentPublishDate';
import { useMemberRoleForSource } from '../../hooks/useMemberRoleForSource';
import { CommentClassName } from '../fields/MarkdownInput/CommentMarkdownInput';
import { CardLink } from '../cards/Card';
import { ReputationUserBadge } from '../ReputationUserBadge';

interface ClassName extends CommentClassName {
  content?: string;
}

export interface CommentContainerProps {
  post: Post;
  comment: Comment;
  commentHash?: string;
  commentRef?: React.MutableRefObject<HTMLElement>;
  appendTooltipTo?: () => HTMLElement;
  postAuthorId: string | null;
  postScoutId: string | null;
  className?: ClassName;
  children?: ReactNode;
  linkToComment?: boolean;
  showContextHeader?: boolean;
  actions?: ReactNode;
  onClick?: () => void;
}

export default function CommentContainer({
  post,
  comment,
  commentHash,
  commentRef,
  appendTooltipTo,
  postAuthorId,
  postScoutId,
  className = {},
  children,
  linkToComment,
  showContextHeader,
  actions,
  onClick,
}: CommentContainerProps): ReactElement {
  const isCommentReferenced = commentHash === getCommentHash(comment.id);
  const { role } = useMemberRoleForSource({
    source: post.source,
    user: comment.author,
  });

  return (
    <article
      ref={isCommentReferenced ? commentRef : null}
      className={classNames(
        'flex flex-col rounded-24 p-4 hover:bg-surface-hover focus:outline',
        isCommentReferenced
          ? 'border border-accent-cabbage-default'
          : 'border-border-subtlest-tertiary',
        className.container,
      )}
      data-testid="comment"
    >
      {linkToComment && (
        <Link href={comment.permalink} prefetch={false} passHref>
          <CardLink onClick={onClick} />
        </Link>
      )}
      {children}
      {showContextHeader && (
        <header className="mb-4 line-clamp-1 text-text-tertiary typo-footnote">
          {comment.parent?.author ? (
            <p>
              Replied to <strong>@{comment.parent.author.username}</strong>
            </p>
          ) : (
            <p>
              Commented on <strong>{comment.post.title}</strong>
            </p>
          )}
        </header>
      )}
      <header className="z-1 flex w-full flex-row self-start">
        <ProfileTooltip
          user={comment.author}
          tooltip={{ appendTo: appendTooltipTo }}
        >
          <ProfileImageLink user={comment.author} />
        </ProfileTooltip>
        <div className="ml-3 flex min-w-0 flex-1 flex-col typo-callout">
          <FlexRow>
            <CommentAuthor
              author={comment.author}
              appendTooltipTo={appendTooltipTo}
            />
            <ReputationUserBadge
              key="reputation"
              className="ml-1"
              user={comment.author}
            />
            <SquadMemberBadge key="squadMemberRole" role={role} />
            {comment.author.id === postAuthorId && (
              <UserBadge
                key="author"
                className="text-status-help"
                content="Creator"
                Icon={FeatherIcon}
                iconProps={{
                  secondary: true,
                }}
              />
            )}
            {comment.author.id === postScoutId && (
              <UserBadge
                key="scout"
                className="text-accent-bun-default"
                content="Scout"
                Icon={ScoutIcon}
                iconProps={{
                  secondary: true,
                }}
              />
            )}
          </FlexRow>
          <FlexRow className="items-center text-text-quaternary">
            <ProfileLink href={comment.author.permalink}>
              <TruncateText title={`@${comment.author.username}`}>
                @{comment.author.username}
              </TruncateText>
            </ProfileLink>
            <div className="mx-2 h-0.5 w-0.5 bg-text-quaternary" />
            <CommentPublishDate comment={comment} />
          </FlexRow>
        </div>
      </header>
      <div
        className={classNames(
          'break-words-overflow z-1 mt-3 typo-body',
          className.content,
          linkToComment && 'pointer-events-none',
        )}
      >
        <Markdown
          content={comment.contentHtml}
          appendTooltipTo={appendTooltipTo}
        />
        {actions}
      </div>
    </article>
  );
}
