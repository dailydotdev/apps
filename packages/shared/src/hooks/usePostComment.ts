import { useEffect, useState, useContext, useMemo } from 'react';
import { useQueryClient } from 'react-query';
import cloneDeep from 'lodash.clonedeep';
import AuthContext from '../contexts/AuthContext';
import { ParentComment, Post } from '../graphql/posts';
import { Comment, PostCommentsData } from '../graphql/comments';
import { Edge } from '../graphql/common';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../lib/feed';
import useDebounce from './useDebounce';

export interface UsePostCommentOptionalProps {
  enableShowShareNewComment?: boolean;
}

export interface UsePostComment {
  commentsNum: number;
  closeNewComment: () => void;
  openNewComment: (origin: string) => void;
  onCommentClick: (parent: ParentComment) => void;
  onShowShareNewComment: (value: boolean) => void;
  updatePostComments: (comment: Comment, isNew?: boolean) => void;
  deleteCommentCache: (commentId: string, parentId?: string) => void;
  parentComment: ParentComment;
  showShareNewComment: string;
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
  { enableShowShareNewComment }: UsePostCommentOptionalProps = {},
): UsePostComment => {
  const client = useQueryClient();
  const { trackEvent } = useContext(AnalyticsContext);
  const { user, showLogin } = useContext(AuthContext);
  const key = ['post_comments', post?.id];
  const postCommentNumKey = ['post_comments_num', post?.id];
  const commentsNum =
    client.getQueryData<number>(postCommentNumKey) || post?.numComments;
  const comments = client.getQueryData<PostCommentsData>(key);
  const [lastScroll, setLastScroll] = useState(0);
  const [parentComment, setParentComment] = useState<ParentComment>(null);
  const [showShareNewComment, setShowShareNewComment] = useState(null);
  const [showNewComment] = useDebounce((id) => setShowShareNewComment(id), 700);

  const closeNewComment = () => {
    setParentComment(null);
    document.documentElement.scrollTop = lastScroll;
  };

  const onNewComment = (comment: Comment, parentId: string | null): void => {
    if (!parentId) {
      showNewComment(comment.id);
    }
  };

  const onCommentClick = (parent: ParentComment) => {
    setLastScroll(window.scrollY);
    setParentComment(parent);
  };

  const openNewComment = (origin: string) => {
    if (user) {
      trackEvent(
        postAnalyticsEvent('open comment modal', post, {
          extra: { origin },
        }),
      );
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
      return { node: { ...comment, children: { edges: [], pageInfo: null } } };
    }

    if (!parentComment.commentId) {
      const current = comments.postComments.edges.find(
        (e) => e.node.id === comment.id,
      );

      return { ...current, node: { ...current.node, ...comment } };
    }

    const parent = comments.postComments.edges.find(
      (e) => e.node.id === parentComment.commentId,
    );
    const current = parent.node.children.edges.find(
      (child) => child.node.id === comment.id,
    );

    return { ...current, node: { ...current.node, ...comment } };
  };

  const deleteCommentCache = async (commentId: string, parentId?: string) => {
    const queryKey = ['post_comments', post.id];
    await client.cancelQueries(queryKey);
    const cached = cloneDeep(comments);
    const { edges } = cached.postComments;
    if (!cached) {
      return null;
    }

    if (parentId === commentId) {
      const index = edges.findIndex((e) => e.node.id === commentId);
      const count = edges[index].node.children?.edges?.length || 0;
      client.setQueryData(postCommentNumKey, commentsNum - (count + 1));
      edges.splice(index, 1);
      return client.setQueryData(key, cached);
    }

    const [parent, current] = getParentAndCurrentIndex(
      cached.postComments.edges,
      parentId,
      commentId,
    );
    cached.postComments.edges[parent].node.children.edges.splice(current, 1);
    client.setQueryData(postCommentNumKey, commentsNum - 1);
    return client.setQueryData(key, cached);
  };

  const updateCache = (result: Comment, isNew = true) => {
    const cached = cloneDeep(comments);

    if (!cached) {
      return null;
    }

    const comment = getCommentEdge(result, isNew);
    const { edges } = comments.postComments;
    const parentId = parentComment.commentId;

    if (isNew) {
      if (!parentId) {
        cached.postComments.edges.push(comment);
        return client.setQueryData(key, cached);
      }

      const parentIndex = edges.findIndex((e) => e.node.id === parentId);
      cached.postComments.edges[parentIndex].node.children.edges.push(comment);
      return client.setQueryData(key, cached);
    }

    if (!parentId) {
      const index = edges.findIndex((e) => e.node.id === comment.node.id);
      cached.postComments.edges[index] = comment;
      return client.setQueryData(key, cached);
    }

    const [parent, current] = getParentAndCurrentIndex(
      edges,
      parentId,
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
      client.setQueryData(postCommentNumKey, commentsNum + 1);
      onNewComment(comment, parentComment.commentId);
    }

    closeNewComment();
  };

  useEffect(() => {
    if (enableShowShareNewComment) {
      showNewComment();
    }
  }, [enableShowShareNewComment]);

  return useMemo(
    () => ({
      commentsNum,
      closeNewComment,
      openNewComment,
      onCommentClick,
      onShowShareNewComment: setShowShareNewComment,
      updatePostComments,
      deleteCommentCache,
      parentComment,
      showShareNewComment,
    }),
    [
      commentsNum,
      closeNewComment,
      openNewComment,
      onCommentClick,
      setShowShareNewComment,
      updatePostComments,
      deleteCommentCache,
      parentComment,
      showShareNewComment,
    ],
  );
};
