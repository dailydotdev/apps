import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Comment, getCommentHash } from '../../graphql/comments';
import { CommentBox, CommentPublishDate } from './common';
import CommentActionButtons, {
  CommentActionProps,
} from './CommentActionButtons';
import SubComment from './SubComment';
import { ProfileImageLink } from '../profile/ProfileImageLink';
import CommentAuthor from './CommentAuthor';
import classed from '../../lib/classed';
import Markdown from '../Markdown';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import ScoutBadge from './ScoutBadge';
import { Origin } from '../../lib/analytics';
import { Post } from '../../graphql/posts';

export interface Props extends CommentActionProps {
  post: Post;
  comment: Comment;
  origin: Origin;
  postAuthorId: string | null;
  postScoutId: string | null;
  commentHash?: string;
  commentRef?: React.MutableRefObject<HTMLElement>;
  className?: string;
  appendTooltipTo?: () => HTMLElement;
}

const MainCommentBox = classed(CommentBox, 'my-2');

export default function MainComment({
  post,
  comment,
  origin,
  commentHash,
  commentRef,
  onComment,
  onShare,
  onDelete,
  onEdit,
  onShowUpvotes,
  appendTooltipTo,
  className,
  postAuthorId,
  postScoutId,
}: Props): ReactElement {
  return (
    <article
      className={classNames(
        'flex flex-col items-stretch mt-4 scroll-mt-16',
        className,
      )}
      ref={commentHash === getCommentHash(comment.id) ? commentRef : null}
      data-testid="comment"
    >
      <div className="flex items-center">
        <ProfileTooltip
          user={comment.author}
          tooltip={{ appendTo: appendTooltipTo }}
        >
          <ProfileImageLink user={comment.author} />
        </ProfileTooltip>
        <div className="flex flex-col ml-2">
          <div className="flex">
            <CommentAuthor
              postAuthorId={postAuthorId}
              author={comment.author}
              appendTooltipTo={appendTooltipTo}
            />
            {comment.author?.id === postScoutId && <ScoutBadge />}
          </div>
          <CommentPublishDate comment={comment} />
        </div>
      </div>
      <MainCommentBox>
        <Markdown content={comment.contentHtml} />
      </MainCommentBox>
      <CommentActionButtons
        post={post}
        comment={comment}
        origin={origin}
        parentId={comment.id}
        onShare={onShare}
        onComment={onComment}
        onDelete={onDelete}
        onEdit={onEdit}
        onShowUpvotes={onShowUpvotes}
      />
      {comment.children?.edges.map((e, i) => (
        <SubComment
          post={post}
          origin={origin}
          commentHash={commentHash}
          commentRef={commentRef}
          comment={e.node}
          key={e.node.id}
          firstComment={i === 0}
          lastComment={i === comment.children.edges.length - 1}
          parentId={comment.id}
          onComment={onComment}
          onShare={onShare}
          onDelete={onDelete}
          onEdit={(childComment) => onEdit(childComment, comment)}
          onShowUpvotes={onShowUpvotes}
          postAuthorId={postAuthorId}
          postScoutId={postScoutId}
          appendTooltipTo={appendTooltipTo}
        />
      ))}
    </article>
  );
}
