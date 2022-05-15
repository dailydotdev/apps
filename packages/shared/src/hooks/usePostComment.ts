import { useEffect, useState, useContext } from 'react';
import AuthContext from '../contexts/AuthContext';
import { ParentComment, Post } from '../graphql/posts';
import { Comment } from '../graphql/comments';

export interface UsePostCommentOptionalProps {
  enableShowShareNewComment?: boolean;
  initializeNewComment?: boolean;
}

interface UsePostComment {
  onNewComment: (newComment: Comment, parentId: string | null) => void;
  closeNewComment: () => void;
  openNewComment: () => void;
  onCommentClick: (parent: ParentComment) => void;
  onShowShareNewComment: (value: boolean) => void;
  parentComment: ParentComment;
  showShareNewComment: boolean;
}

export const usePostComment = (
  post: Post,
  {
    enableShowShareNewComment,
    initializeNewComment,
  }: UsePostCommentOptionalProps = {},
): UsePostComment => {
  const { user, showLogin } = useContext(AuthContext);
  const [lastScroll, setLastScroll] = useState(0);
  const [parentComment, setParentComment] = useState<ParentComment>(null);
  const [showShareNewComment, setShowShareNewComment] = useState(false);

  const closeNewComment = () => {
    setParentComment(null);
    document.documentElement.scrollTop = lastScroll;
  };

  const onNewComment = (_: Comment, parentId: string | null): void => {
    if (!parentId) {
      setTimeout(() => setShowShareNewComment(true), 700);
    }
  };

  const onCommentClick = (parent: ParentComment) => {
    setLastScroll(window.scrollY);
    setParentComment(parent);
  };

  const openNewComment = () => {
    if (user) {
      setLastScroll(window.scrollY);
      setParentComment({
        authorName: post.source.name,
        authorImage: post.source.image,
        content: post.title,
        contentHtml: post.title,
        publishDate: post.createdAt,
        commentId: null,
        post,
      });
    } else {
      showLogin('comment');
    }
  };

  useEffect(() => {
    if (enableShowShareNewComment) {
      setTimeout(() => setShowShareNewComment(true), 700);
    }
  }, [enableShowShareNewComment]);

  useEffect(() => {
    if (initializeNewComment) {
      openNewComment();
    }
  }, [initializeNewComment]);

  return {
    onNewComment,
    closeNewComment,
    openNewComment,
    onCommentClick,
    onShowShareNewComment: setShowShareNewComment,
    parentComment,
    showShareNewComment,
  };
};
