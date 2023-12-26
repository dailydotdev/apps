import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import { Comment, getCommentHash } from '../../graphql/comments';
import { Post } from '../../graphql/posts';
import { Origin } from '../../lib/analytics';
import FeatherIcon from '../icons/Feather';
import ScoutIcon from '../icons/Scout';
import Markdown from '../Markdown';
import { ProfileImageLink } from '../profile/ProfileImageLink';
import { ProfileLink } from '../profile/ProfileLink';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import SquadMemberBadge from '../squads/SquadMemberBadge';
import UserBadge from '../UserBadge';
import { FlexRow } from '../utilities';
import CommentActionButtons, {
  CommentActionProps,
} from './CommentActionButtons';
import CommentAuthor from './CommentAuthor';
import { CommentPublishDate } from './CommentPublishDate';
import { useMemberRoleForSource } from '../../hooks/useMemberRoleForSource';
import { CommentClassName } from '../fields/MarkdownInput/CommentMarkdownInput';
import { CardLink } from '../cards/Card';

interface ClassName extends CommentClassName {
  content?: string;
}

export interface CommentBoxProps extends CommentActionProps {
  post: Post;
  comment: Comment;
  origin: Origin;
  postAuthorId: string | null;
  postScoutId: string | null;
  commentHash?: string;
  commentRef?: React.MutableRefObject<HTMLElement>;
  className?: ClassName;
  parentId?: string;
  appendTooltipTo?: () => HTMLElement;
  children?: ReactNode;
  linkToComment?: boolean;
}

function CommentBox({
  post,
  comment,
  origin,
  commentHash,
  commentRef,
  parentId,
  onComment,
  onShare,
  onDelete,
  onEdit,
  onShowUpvotes,
  appendTooltipTo,
  postAuthorId,
  postScoutId,
  className = {},
  children,
  linkToComment,
}: CommentBoxProps): ReactElement {
  const isCommentReferenced = commentHash === getCommentHash(comment.id);
  const { role } = useMemberRoleForSource({
    source: post.source,
    user: comment.author,
  });

  return (
    <article
      ref={isCommentReferenced ? commentRef : null}
      className={classNames(
        'flex flex-col p-4 rounded-24 hover:bg-theme-hover focus:outline',
        isCommentReferenced
          ? 'border border-theme-color-cabbage'
          : 'border-theme-divider-tertiary',
        className.container,
      )}
      data-testid="comment"
    >
      {linkToComment && (
        <Link href={comment.permalink} prefetch={false} passHref>
          <CardLink />
        </Link>
      )}
      {children}
      <header className="flex z-1 flex-row self-start">
        <ProfileTooltip
          user={comment.author}
          tooltip={{ appendTo: appendTooltipTo }}
        >
          <ProfileImageLink user={comment.author} />
        </ProfileTooltip>
        <div className="flex flex-col ml-3 typo-callout">
          <FlexRow>
            <CommentAuthor
              author={comment.author}
              appendTooltipTo={appendTooltipTo}
              badges={[
                <SquadMemberBadge key="squadMemberRole" role={role} />,
                comment.author.id === postAuthorId && (
                  <UserBadge
                    key="author"
                    className="text-theme-status-help"
                    content="Author"
                    Icon={FeatherIcon}
                    iconProps={{
                      secondary: true,
                    }}
                  />
                ),
                comment.author.id === postScoutId && (
                  <UserBadge
                    key="scout"
                    className="text-theme-color-bun"
                    content="Scout"
                    Icon={ScoutIcon}
                    iconProps={{
                      secondary: true,
                    }}
                  />
                ),
              ]}
            />
          </FlexRow>
          <FlexRow className="items-center text-theme-label-quaternary">
            <ProfileLink href={comment.author.permalink}>
              @{comment.author.username}
            </ProfileLink>
            <div className="mx-2 w-0.5 h-0.5 bg-theme-label-quaternary" />
            <CommentPublishDate comment={comment} />
          </FlexRow>
        </div>
      </header>
      <div
        className={classNames(
          'mt-3 break-words-overflow typo-body z-1',
          className.content,
          linkToComment && 'pointer-events-none',
        )}
      >
        <Markdown
          content={comment.contentHtml}
          appendTooltipTo={appendTooltipTo}
        />
        <CommentActionButtons
          post={post}
          comment={comment}
          origin={origin}
          parentId={parentId}
          onShare={onShare}
          onComment={onComment}
          onDelete={onDelete}
          onEdit={onEdit}
          onShowUpvotes={onShowUpvotes}
          className="mt-3 pointer-events-auto"
        />
      </div>
    </article>
  );
}

export default CommentBox;
