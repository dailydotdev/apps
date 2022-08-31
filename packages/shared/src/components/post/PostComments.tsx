import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useQuery } from 'react-query';
import { apiUrl } from '../../lib/config';
import AuthContext from '../../contexts/AuthContext';
import {
  Comment,
  POST_COMMENTS_QUERY,
  PostCommentsData,
} from '../../graphql/comments';
import { Post } from '../../graphql/posts';
import MainComment from '../comments/MainComment';
import PlaceholderCommentList from '../comments/PlaceholderCommentList';
import DeleteCommentModal from '../modals/DeleteCommentModal';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import { initialDataKey } from '../../lib/constants';
import { Origin } from '../../lib/analytics';

export interface ParentComment {
  authorName: string;
  authorImage: string;
  publishDate: Date | string;
  content: string;
  contentHtml: string;
  commentId: string | null;
  post: Post;
  editContent?: string;
  editId?: string;
}

interface PostCommentsProps {
  post: Post;
  origin: Origin;
  applyBottomMargin?: boolean;
  modalParentSelector?: () => HTMLElement;
  onClick?: (parent: ParentComment) => unknown;
  onShare?: (comment: Comment) => void;
  onClickUpvote?: (commentId: string, upvotes: number) => unknown;
}

interface PendingComment {
  comment: Comment;
  parentId: string | null;
}

interface SharedData {
  editContent?: string;
  editId?: string;
}

const getParentComment = (
  post: Post,
  comment?: Comment,
  shared: SharedData = {},
) => {
  if (comment) {
    return {
      authorName: comment.author.name,
      authorImage: comment.author.image,
      content: comment.content,
      contentHtml: comment.contentHtml,
      publishDate: comment.lastUpdatedAt || comment.createdAt,
      commentId: comment.id,
      post,
      ...shared,
    };
  }

  return {
    authorName: post.source.name,
    authorImage: post.source.image,
    content: post.title,
    contentHtml: post.title,
    publishDate: post.createdAt,
    commentId: null,
    post,
    ...shared,
  };
};

export function PostComments({
  post,
  origin,
  onClick,
  onShare,
  onClickUpvote,
  modalParentSelector,
  applyBottomMargin = true,
}: PostCommentsProps): ReactElement {
  const { id } = post;
  const { user, showLogin, tokenRefreshed } = useContext(AuthContext);
  const [pendingComment, setPendingComment] = useState<PendingComment>(null);
  const { requestMethod } = useRequestProtocol();
  const queryKey = ['post_comments', id];
  const { data: comments, isLoading: isLoadingComments } =
    useQuery<PostCommentsData>(
      queryKey,
      () =>
        requestMethod(
          `${apiUrl}/graphql`,
          POST_COMMENTS_QUERY,
          { postId: id, [initialDataKey]: comments, first: 500 },
          { requestKey: JSON.stringify(queryKey) },
        ),
      {
        enabled: !!id && tokenRefreshed,
        refetchInterval: 60 * 1000,
      },
    );
  const { hash: commentHash } = window.location;
  const commentsCount = comments?.postComments?.edges?.length || 0;
  const commentRef = useRef(null);

  const [scrollToComment, setScrollToComment] = useState(!!commentHash);
  useEffect(() => {
    if (commentsCount > 0 && scrollToComment && commentRef.current) {
      commentRef.current.scrollIntoView();
      setScrollToComment(false);
    }
  }, [commentsCount, scrollToComment]);

  if (isLoadingComments || comments === null) {
    return <PlaceholderCommentList placeholderAmount={post.numComments} />;
  }

  if (commentsCount === 0) {
    return (
      <div className="my-8 text-center text-theme-label-quaternary typo-subhead">
        Be the first to comment.
      </div>
    );
  }

  const onCommentClick = (comment: Comment, parentId: string | null) => {
    if (user) {
      const parent = getParentComment(post, comment);
      parent.commentId = parentId;

      onClick(parent);
    } else {
      showLogin('comment');
    }
  };

  const onEditClick = (comment: Comment, localParentComment?: Comment) => {
    const shared = { editContent: comment.content, editId: comment.id };
    onClick(getParentComment(post, localParentComment, shared));
  };

  return (
    <>
      {comments.postComments.edges.map((e, i) => (
        <MainComment
          post={post}
          origin={origin}
          commentHash={commentHash}
          commentRef={commentRef}
          className={i === commentsCount - 1 && applyBottomMargin && 'mb-12'}
          comment={e.node}
          key={e.node.id}
          onComment={onCommentClick}
          onShare={onShare}
          onDelete={(comment, parentId) =>
            setPendingComment({ comment, parentId })
          }
          onEdit={onEditClick}
          onShowUpvotes={onClickUpvote}
          postAuthorId={post.author?.id}
          postScoutId={post.scout?.id}
          appendTooltipTo={modalParentSelector}
        />
      ))}
      {pendingComment && (
        <DeleteCommentModal
          isOpen={!!pendingComment}
          onRequestClose={() => setPendingComment(null)}
          commentId={pendingComment.comment.id}
          parentId={pendingComment.parentId}
          parentSelector={modalParentSelector}
          post={post}
        />
      )}
    </>
  );
}
