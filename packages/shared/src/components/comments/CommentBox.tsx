import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { Comment, getCommentHash } from '../../graphql/comments';
import { Post } from '../../graphql/posts';
import { Origin } from '../../lib/analytics';
import Markdown from '../Markdown';
import { ProfileImageLink } from '../profile/ProfileImageLink';
import { ProfileLink } from '../profile/ProfileLink';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import { FlexRow } from '../utilities';
import CommentActionButtons, {
  CommentActionProps,
} from './CommentActionButtons';
import CommentAuthor from './CommentAuthor';
import { CommentPublishDate } from './common';
import ScoutBadge from './ScoutBadge';

interface ClassName {
  container?: string;
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
  isChildComment?: boolean;
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
  isChildComment,
}: CommentBoxProps): ReactElement {
  const isCommentReferenced = commentHash === getCommentHash(comment.id);
  return (
    <article
      ref={isCommentReferenced ? commentRef : null}
      className={classNames(
        'flex relative flex-col p-3 rounded-24 hover:bg-theme-hover focus:outline',
        isCommentReferenced
          ? 'border border-theme-color-cabbage'
          : 'border-theme-divider-tertiary',
        !isChildComment && 'border-b',
        className.container,
      )}
      data-testid="comment"
    >
      {isChildComment && (
        <div className="absolute top-0 bottom-0 left-8 w-0.5 bg-theme-float" />
      )}
      <header className="flex flex-row">
        <ProfileTooltip
          user={comment.author}
          tooltip={{ appendTo: appendTooltipTo }}
        >
          <ProfileImageLink user={comment.author} />
        </ProfileTooltip>
        <div className="flex flex-col ml-3 typo-callout">
          <FlexRow>
            <CommentAuthor
              postAuthorId={postAuthorId}
              author={comment.author}
              appendTooltipTo={appendTooltipTo}
            />
            {comment.author?.id === postScoutId && <ScoutBadge />}
          </FlexRow>
          <FlexRow className="items-center text-theme-label-quaternary">
            <ProfileLink user={comment.author}>
              @{comment.author?.username}
            </ProfileLink>
            <div className="mx-2 w-0.5 h-0.5 bg-theme-label-quaternary" />
            <CommentPublishDate comment={comment} />
          </FlexRow>
        </div>
      </header>
      <div
        className={classNames(
          'mt-3 break-words-overflow typo-body',
          className.content,
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
          className="mt-3"
        />
      </div>
    </article>
  );
}

export default CommentBox;
