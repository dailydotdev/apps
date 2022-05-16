import { useEffect, useState, useContext } from 'react';
import { useQueryClient } from 'react-query';
import cloneDeep from 'lodash.clonedeep';
import AuthContext from '../contexts/AuthContext';
import { ParentComment, Post } from '../graphql/posts';
import { Comment, PostCommentsData } from '../graphql/comments';
import { Edge } from '../graphql/common';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../lib/feed';

export interface UsePostCommentOptionalProps {
  enableShowShareNewComment?: boolean;
  initializeNewComment?: boolean;
}

interface UsePostComment {
  comments: PostCommentsData;
  onNewComment: (newComment: Comment, parentId: string | null) => void;
  closeNewComment: () => void;
  openNewComment: () => void;
  onCommentClick: (parent: ParentComment) => void;
  onShowShareNewComment: (value: boolean) => void;
  updatePostComments: (comment: Comment, isNew?: boolean) => void;
  deleteCommentCache: (commentId: string, parentId?: string) => void;
  parentComment: ParentComment;
  showShareNewComment: boolean;
}

const getParentAndCurrentIndex = (
  edges: Edge<Comment>[],
  parentId: string,
  commentId: string,
): [number, number] => {
  const parent = edges.findIndex((e) => e.node.id === parentId);
  const current = edges[parent].node.children.edges.findIndex(
    (edge) => edge.node.id === commentId,
  );

  return [parent, current];
};

export const usePostComment = (
  post: Post,
  {
    enableShowShareNewComment,
    initializeNewComment,
  }: UsePostCommentOptionalProps = {},
): UsePostComment => {
  const client = useQueryClient();
  const { trackEvent } = useContext(AnalyticsContext);
  const { user, showLogin } = useContext(AuthContext);
  const key = ['post_comments', post?.id];
  const comments = client.getQueryData<PostCommentsData>(key);
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

  const getCommentEdge = (comment: Comment, isNew = true): Edge<Comment> => {
    if (isNew) {
      return { node: { ...comment } };
    }

    if (!parentComment.commentId) {
      const current = comments.postComments.edges.find(
        (e) => e.node.id === comment.id,
      );

      return { ...current, node: { ...comment } };
    }

    const parent = comments.postComments.edges.find(
      (e) => e.node.id === parentComment.commentId,
    );
    const current = parent.node.children.edges.find(
      (child) => child.node.id === comment.id,
    );

    return { ...current, node: { ...comment } };
  };

  const deleteCommentCache = async (commentId: string, parentId?: string) => {
    const queryKey = ['post_comments', post.id];
    await client.cancelQueries(queryKey);
    const cached = cloneDeep(comments);
    if (!cached) {
      return null;
    }

    if (parentId === commentId) {
      const index = cached.postComments.edges.findIndex(
        (e) => e.node.id === commentId,
      );
      cached.postComments.edges.splice(index, 1);
      return client.setQueryData(key, cached);
    }

    const [parent, current] = getParentAndCurrentIndex(
      cached.postComments.edges,
      parentId,
      commentId,
    );
    cached.postComments.edges[parent].node.children.edges.splice(current, 1);
    return client.setQueryData(key, cached);
  };

  const updateCache = (result: Comment, isNew = true) => {
    const cached = cloneDeep(comments);

    if (!cached) {
      return null;
    }

    const comment = getCommentEdge(result, isNew);
    const { edges } = comments.postComments;

    if (isNew) {
      if (!parentComment.commentId) {
        cached.postComments.edges.push(comment);
        return client.setQueryData(key, cached);
      }

      const parentIndex = edges.findIndex((e) => e.node.id === comment.node.id);
      cached.postComments.edges[parentIndex].node.children.edges.push(comment);
      return client.setQueryData(key, cached);
    }

    if (!parentComment.commentId) {
      const index = edges.findIndex((e) => e.node.id === comment.node.id);
      cached.postComments.edges[index] = comment;
      return client.setQueryData(key, cached);
    }

    const [parent, current] = getParentAndCurrentIndex(
      edges,
      parentComment.commentId,
      comment.node.id,
    );
    cached.postComments.edges[parent].node.children.edges[current] = comment;

    return client.setQueryData(key, cached);
  };

  const updatePostComments = (comment: Comment, isNew = true) => {
    if (!comment) {
      return;
    }

    updateCache(comment, isNew);

    if (isNew) {
      trackEvent(
        postAnalyticsEvent('comment post', post, {
          extra: { commentId: comment.id, origin: 'comment modal' },
        }),
      );
      onNewComment(comment, parentComment.commentId);
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
    comments,
    onNewComment,
    closeNewComment,
    openNewComment,
    onCommentClick,
    onShowShareNewComment: setShowShareNewComment,
    updatePostComments,
    deleteCommentCache,
    parentComment,
    showShareNewComment,
  };
};
