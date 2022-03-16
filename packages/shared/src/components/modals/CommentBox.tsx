import React, {
  FormEvent,
  ReactElement,
  useContext,
  useState,
  MouseEvent,
  useEffect,
  KeyboardEvent,
  ClipboardEvent,
  useRef,
} from 'react';
import cloneDeep from 'lodash.clonedeep';
import { useMutation, useQueryClient } from 'react-query';
import request from 'graphql-request';
import classNames from 'classnames';
import AuthContext from '../../contexts/AuthContext';
import { commentBoxClassNames } from '../comments/common';
import {
  Comment,
  COMMENT_ON_COMMENT_MUTATION,
  COMMENT_ON_POST_MUTATION,
  CommentOnData,
  EDIT_COMMENT_MUTATION,
  PostCommentsData,
} from '../../graphql/comments';
import { Edge } from '../../graphql/common';
import { apiUrl } from '../../lib/config';
import { commentDateFormat } from '../../lib/dateFormat';
import { Button } from '../buttons/Button';
import { RoundedImage } from '../utilities';
import { ModalProps } from './StyledModal';
import styles from './CommentBox.module.css';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { Post } from '../../graphql/posts';
import { postAnalyticsEvent } from '../../lib/feed';
import { ProfilePicture } from '../ProfilePicture';
import { ClickableText } from '../buttons/ClickableText';
import Markdown from '../Markdown';

export interface CommentBoxProps extends Pick<ModalProps, 'onRequestClose'> {
  authorName: string;
  authorImage: string;
  publishDate: Date | string;
  content: string;
  contentHtml: string;
  commentId: string | null;
  post: Post;
  onComment?: (newComment: Comment, parentId: string | null) => void;
  editContent?: string;
  editId?: string;
  input?: string;
  onInput: (value: string) => unknown;
}

interface CommentVariables {
  id: string;
  content: string;
}

function CommentBox({
  authorImage,
  authorName,
  publishDate,
  content,
  contentHtml,
  onRequestClose,
  onComment,
  editContent,
  editId,
  input,
  onInput,
  ...props
}: CommentBoxProps): ReactElement {
  const { user } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const [errorMessage, setErrorMessage] = useState<string>(null);
  const [sendingComment, setSendingComment] = useState<boolean>(false);
  const commentRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { mutateAsync: comment } = useMutation<
    CommentOnData,
    unknown,
    CommentVariables
  >(
    (variables) =>
      request(
        `${apiUrl}/graphql`,
        props.commentId
          ? COMMENT_ON_COMMENT_MUTATION
          : COMMENT_ON_POST_MUTATION,
        variables,
      ),
    {
      onSuccess: async (data) => {
        const queryKey = ['post_comments', props.post.id];
        const cached = cloneDeep(
          queryClient.getQueryData<PostCommentsData>(queryKey),
        );
        if (cached) {
          const newEdge: Edge<Comment> = {
            __typename: 'CommentEdge',
            node: {
              ...data.comment,
            },
            cursor: '',
          };
          // Update the sub tree of the parent comment
          if (props.commentId) {
            const edgeIndex = cached.postComments.edges.findIndex(
              (e) => e.node.id === props.commentId,
            );
            if (edgeIndex > -1) {
              if (cached.postComments.edges[edgeIndex].node.children) {
                cached.postComments.edges[edgeIndex].node.children.edges.push(
                  newEdge,
                );
              } else {
                cached.postComments.edges[edgeIndex].node.children = {
                  edges: [newEdge],
                  pageInfo: {},
                };
              }
            }
          } else {
            cached.postComments.edges.push(newEdge);
          }
          queryClient.setQueryData(queryKey, cached);
        }
      },
    },
  );

  const { mutateAsync: editComment } = useMutation<
    CommentOnData,
    unknown,
    CommentVariables
  >(
    (variables) =>
      request(`${apiUrl}/graphql`, EDIT_COMMENT_MUTATION, variables),
    {
      onSuccess: async (data) => {
        const queryKey = ['post_comments', props.post.id];
        const cached = cloneDeep(
          queryClient.getQueryData<PostCommentsData>(queryKey),
        );
        if (cached) {
          // Update the sub tree of the parent comment
          if (props.commentId) {
            const parentEdgeIndex = cached.postComments.edges.findIndex(
              (e) => e.node.id === props.commentId,
            );
            if (parentEdgeIndex > -1) {
              const edgeIndex = cached.postComments.edges[
                parentEdgeIndex
              ].node.children.edges.findIndex((e) => e.node.id === editId);
              if (edgeIndex > -1) {
                cached.postComments.edges[parentEdgeIndex].node.children.edges[
                  edgeIndex
                ].node = {
                  ...cached.postComments.edges[parentEdgeIndex].node.children
                    .edges[edgeIndex].node,
                  ...data.comment,
                };
              }
            }
          } else {
            const edgeIndex = cached.postComments.edges.findIndex(
              (e) => e.node.id === editId,
            );
            if (edgeIndex > -1) {
              cached.postComments.edges[edgeIndex].node = {
                ...cached.postComments.edges[edgeIndex].node,
                ...data.comment,
              };
            }
          }
          queryClient.setQueryData(queryKey, cached);
        }
      },
    },
  );

  const onCommentInput = (event: FormEvent<HTMLDivElement>): void => {
    onInput(event.currentTarget.innerText);
  };

  const sendComment = async (
    event: MouseEvent | KeyboardEvent,
  ): Promise<void> => {
    if (sendingComment || !input?.trim().length) {
      return;
    }
    setErrorMessage(null);
    setSendingComment(true);
    try {
      if (editId) {
        await editComment({
          id: editId,
          content: input,
        });
        onRequestClose(event);
      } else {
        const data = await comment({
          id: props.commentId || props.post.id,
          content: input,
        });
        trackEvent(
          postAnalyticsEvent('comment post', props.post, {
            extra: { commentId: props.commentId, origin: 'comment modal' },
          }),
        );
        onComment?.(data.comment, props.commentId);
        onRequestClose(event);
      }
    } catch (err) {
      setErrorMessage('Something went wrong, try again');
      setSendingComment(false);
    }
  };

  const onKeyDown = async (event: KeyboardEvent): Promise<void> => {
    // Ctrl / Command + Enter
    if (
      (event.ctrlKey || event.metaKey) &&
      event.keyCode === 13 &&
      input?.length
    ) {
      await sendComment(event);
    }
  };

  const onPaste = (event: ClipboardEvent): void => {
    event.preventDefault();
    const text = event.clipboardData.getData('text/plain');
    if (document.queryCommandSupported('insertText')) {
      document.execCommand('insertText', false, text);
    } else {
      document.execCommand('paste', false, text);
    }
  };

  useEffect(() => {
    commentRef.current?.focus();
    if (commentRef.current && editContent) {
      commentRef.current.textContent = editContent;
    }
  }, []);
  return (
    <>
      <article
        className={classNames(
          'flex flex-col items-stretch',
          commentBoxClassNames,
        )}
      >
        <header className="flex items-center mb-2">
          <RoundedImage
            imgSrc={authorImage}
            imgAlt={`${authorName}'s profile`}
            background="var(--theme-background-secondary)"
          />
          <div className="flex flex-col ml-2">
            <div className="truncate typo-callout">{authorName}</div>
            <time
              dateTime={publishDate.toString()}
              className="text-theme-label-tertiary typo-callout"
            >
              {commentDateFormat(publishDate)}
            </time>
          </div>
        </header>
        <Markdown content={contentHtml} />
      </article>
      <div className="flex items-center px-2 h-11">
        <div className="ml-3 w-px h-full bg-theme-divider-tertiary" />
        <div className="ml-6 text-theme-label-secondary typo-caption1">
          Reply to{' '}
          <strong className="font-bold text-theme-label-primary">
            {authorName}
          </strong>
        </div>
      </div>
      <div className="flex px-2">
        <ProfilePicture user={user} size="small" />
        <div
          className={classNames(
            'ml-3 flex-1 text-theme-label-primary bg-none border-none caret-theme-label-link whitespace-pre-line break-words break-words-overflow typo-subhead',
            styles.textarea,
          )}
          ref={commentRef}
          contentEditable
          role="textbox"
          aria-placeholder="Write your comment..."
          aria-multiline
          onInput={onCommentInput}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          tabIndex={0}
          aria-label="New comment box"
        />
      </div>
      <div
        className="my-2 mx-3 text-theme-status-error typo-caption1"
        style={{ minHeight: '1rem' }}
      >
        {errorMessage && <span role="alert">{errorMessage}</span>}
      </div>
      <footer className="flex justify-between items-center py-2 border-t border-theme-divider-tertiary">
        <ClickableText
          tag="a"
          href="https://www.markdownguide.org/cheat-sheet/"
          className="ml-4 typo-caption1"
          defaultTypo={false}
          target="_blank"
        >
          Markdown supported
        </ClickableText>
        <Button
          disabled={!input?.trim().length}
          loading={sendingComment}
          onClick={sendComment}
          className="btn-primary-avocado"
        >
          {editId ? 'Update' : 'Comment'}
        </Button>
      </footer>
    </>
  );
}

export default CommentBox;
