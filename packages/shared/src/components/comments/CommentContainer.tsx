import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import Link from '../utilities/Link';
import type { Comment } from '../../graphql/comments';
import { getCommentHash } from '../../graphql/comments';
import type { Post } from '../../graphql/posts';
import Markdown from '../Markdown';
import { ProfileImageLink } from '../profile/ProfileImageLink';
import { ProfileLink } from '../profile/ProfileLink';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import UserBadge from '../UserBadge';
import { FlexRow, getRoleName, TruncateText } from '../utilities';
import CommentAuthor from './CommentAuthor';
import { CommentPublishDate } from './CommentPublishDate';
import { useMemberRoleForSource } from '../../hooks/useMemberRoleForSource';
import type { CommentClassName } from '../fields/MarkdownInput/CommentMarkdownInput';
import { CardLink } from '../cards/common/Card';
import { ReputationUserBadge } from '../ReputationUserBadge';
import { VerifiedCompanyUserBadge } from '../VerifiedCompanyUserBadge';
import { Separator } from '../cards/common/common';
import { PlusUserBadge } from '../PlusUserBadge';
import { ProfileImageSize } from '../ProfilePicture';
import { Image } from '../image/Image';
import { useHasAccessToCores } from '../../hooks/useCoresFeature';

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
  const hasAccessToCores = useHasAccessToCores();

  return (
    <article
      ref={isCommentReferenced ? commentRef : null}
      className={classNames(
        'relative flex flex-col rounded-16 p-4 hover:bg-surface-hover focus:outline',
        hasAccessToCores &&
          comment.userState?.awarded &&
          'bg-overlay-float-onion',
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
          userId={comment.author.id}
          tooltip={{ appendTo: appendTooltipTo }}
        >
          <ProfileImageLink
            user={comment.author}
            picture={{
              width: 40,
              height: 40,
              size: ProfileImageSize.Large,
              fetchPriority: 'low',
            }}
          />
        </ProfileTooltip>
        <div className="ml-3 flex min-w-0 flex-1 flex-col typo-callout">
          <FlexRow className="items-center gap-1 text-text-quaternary">
            <CommentAuthor
              author={comment.author}
              appendTooltipTo={appendTooltipTo}
            />
            {!!comment.author?.isPlus && (
              <PlusUserBadge user={comment.author} />
            )}
            <div className="flex items-center">
              <ProfileLink href={comment.author.permalink}>
                <TruncateText
                  className="text-text-tertiary typo-footnote"
                  title={`@${comment.author.username}`}
                >
                  @{comment.author.username}
                </TruncateText>
              </ProfileLink>
              <Separator className="!mx-0.5" />
              <CommentPublishDate comment={comment} />
            </div>
          </FlexRow>
          <FlexRow className="gap-1">
            <ReputationUserBadge user={comment.author} />
            {comment.author?.companies?.length > 0 && (
              <VerifiedCompanyUserBadge user={comment.author} />
            )}
            <UserBadge role={role}>{getRoleName(role)}</UserBadge>
            {comment.author.id === postAuthorId && (
              <UserBadge>Creator</UserBadge>
            )}
            {comment.author.id === postScoutId && <UserBadge>Scout</UserBadge>}
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
      {hasAccessToCores && !!comment.award && (
        <div className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-10 bg-surface-float">
          <Image
            src={comment.award.image}
            alt={comment.award.name}
            className="size-8"
          />
        </div>
      )}
    </article>
  );
}
