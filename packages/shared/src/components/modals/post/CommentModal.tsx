import React, {
  ReactElement,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import { Modal, LazyModalCommonProps } from '../common/Modal';
import { FormWrapper } from '../../fields/form';
import {
  CommentMarkdownInput,
  CommentMarkdownInputProps,
} from '../../fields/MarkdownInput/CommentMarkdownInput';
import { useMutateComment } from '../../../hooks/post/useMutateComment';
import { useVisualViewport } from '../../../hooks/utils/useVisualViewport';
import { RequestKey, generateQueryKey } from '../../../lib/query';
import { Comment, PostCommentsData } from '../../../graphql/comments';
import { useNotificationToggle } from '../../../hooks/notifications';
import { NotificationPromptSource } from '../../../lib/log';
import { Switch } from '../../fields/Switch';
import { useAuthContext } from '../../../contexts/AuthContext';
import CommentContainer from '../../comments/CommentContainer';
import { WriteCommentContext } from '../../../contexts/WriteCommentContext';
import useCommentById from '../../../hooks/comments/useCommentById';

const getCommentFromCache = ({
  client,
  postId,
  commentId,
}: {
  client: QueryClient;
  postId: string;
  commentId?: string;
}): Comment | undefined => {
  if (!commentId) {
    return undefined;
  }

  const queryKey = generateQueryKey(RequestKey.PostComments, null, postId);

  const data = client.getQueryData<PostCommentsData>(queryKey);

  if (!data) {
    return undefined;
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const item of data?.postComments?.edges) {
    if (item.node.id === commentId) {
      return item.node;
    }
    if (item.node.children) {
      // eslint-disable-next-line no-restricted-syntax
      for (const child of item.node.children.edges) {
        if (child.node.id === commentId) {
          return child.node;
        }
      }
    }
  }

  return undefined;
};

export interface CommentModalProps
  extends LazyModalCommonProps,
    CommentMarkdownInputProps {
  replyToCommentId?: string;
}

export default function CommentModal({
  isOpen,
  onRequestClose,
  onAfterClose,
  onCommented,
  parentCommentId,
  replyToCommentId,
  editCommentId,
  post,
}: CommentModalProps): ReactElement {
  const inputRef = useRef<HTMLFormElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const replyRef = useRef<HTMLDivElement>(null);
  const switchRef = useRef<HTMLLabelElement>(null);

  const { user } = useAuthContext();
  const client = useQueryClient();
  const [modalNode, setModalNode] = useState<HTMLElement>(null);

  const isEdit = !!editCommentId;
  const isReply = !isEdit && !!replyToCommentId;

  const { comment: commentById } = useCommentById({
    id: editCommentId,
    options: { enabled: !!editCommentId },
  });

  const refCallback = useCallback(
    (node) => {
      if (node) {
        setModalNode(node);
      }
    },
    [setModalNode],
  );

  const { shouldShowCta, isEnabled, onToggle, onSubmitted } =
    useNotificationToggle({
      source: NotificationPromptSource.NewComment,
    });

  const onSuccess: typeof onCommented = (comment, isNew, parentCommentID) => {
    if (onCommented) {
      onCommented(comment, isNew, parentCommentID);
    }

    onRequestClose();
  };

  const comment = useMemo(
    () =>
      getCommentFromCache({
        client,
        postId: post?.id,
        commentId: isEdit ? editCommentId : replyToCommentId ?? parentCommentId,
      }),
    [
      client,
      post?.id,
      isEdit,
      editCommentId,
      parentCommentId,
      replyToCommentId,
    ],
  );

  const mutateCommentResult = useMutateComment({
    post,
    editCommentId: isEdit && editCommentId,
    parentCommentId,
    onCommented: onSuccess,
  });
  const { isLoading, isSuccess } = mutateCommentResult;

  useLayoutEffect(() => {
    // scroll to bottom of modal
    modalNode?.scrollTo?.({ behavior: 'auto', top: 10000 });
  }, [modalNode]);

  const { height } = useVisualViewport();
  const replyHeight = replyRef.current?.clientHeight ?? 0;
  const footerHeight = switchRef.current?.clientHeight ?? 0;
  const headerHeight = headerRef.current?.offsetHeight ?? 0;
  const totalHeight = height - headerHeight - replyHeight - footerHeight;
  const inputHeight = totalHeight > 0 ? Math.max(totalHeight, 300) : 'auto';

  if (
    inputRef.current &&
    inputRef.current.style?.height !== `${inputHeight}px`
  ) {
    inputRef.current.style.height = `${inputHeight}px`;
  }

  const { submitCopy, initialContent } = useMemo(() => {
    if (isEdit) {
      return {
        submitCopy: 'Save',
        initialContent: commentById?.content,
      };
    }
    if (isReply) {
      return {
        submitCopy: 'Reply',
        initialContent:
          comment?.author?.id && comment.author.id !== user?.id
            ? `@${comment?.author?.username} `
            : undefined,
      };
    }
    return { submitCopy: 'Comment' };
  }, [isEdit, isReply, comment, commentById, user?.id]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      onAfterClose={onAfterClose}
      className="!border-none"
      overlayClassName="!touch-none"
    >
      <Modal.Body className="!p-0" ref={refCallback}>
        <WriteCommentContext.Provider
          value={{ mutateComment: mutateCommentResult }}
        >
          <FormWrapper
            form="write-comment"
            copy={{ right: submitCopy }}
            leftButtonProps={{
              onClick: onRequestClose,
            }}
            rightButtonProps={{
              onClick: async () => {
                await onSubmitted();
              },
              loading: isLoading,
              disabled: isSuccess,
            }}
            className={{
              container: 'flex-1 first:!border-none',
              header: 'sticky top-0 z-2 w-full bg-background-default',
            }}
            headerRef={headerRef}
          >
            {isReply && comment && (
              <>
                <CommentContainer
                  post={post}
                  comment={comment}
                  className={{
                    container: 'mx-4 mt-4 border',
                  }}
                  postAuthorId={post?.author?.id}
                  postScoutId={post?.scout?.id}
                />
                <div
                  className="ml-12 flex gap-2 border-l border-border-subtlest-tertiary py-3 pl-5 text-text-tertiary typo-caption1"
                  ref={replyRef}
                >
                  Reply to
                  <span className="font-bold text-text-primary">
                    {comment.author?.username}
                  </span>
                </div>
              </>
            )}
            <CommentMarkdownInput
              ref={inputRef}
              replyTo={null}
              post={post}
              parentCommentId={parentCommentId}
              editCommentId={isEdit && editCommentId}
              initialContent={initialContent}
              className={{
                markdownContainer: 'flex-1',
                container: classNames(
                  'flex flex-col',
                  isReply ? 'h-[calc(100%-2.5rem)]' : 'h-full',
                ),
                tab: 'flex-1',
                input: 'comment-input-123 !max-h-none flex-1',
              }}
              showSubmit={false}
              showUserAvatar={false}
              formProps={{ id: 'write-comment' }}
            />
            {shouldShowCta && (
              <Switch
                inputId="push_notification-switch"
                name="push_notification"
                labelClassName="flex-1 font-normal"
                className="px-3 py-3.5"
                compact={false}
                checked={isEnabled}
                onToggle={onToggle}
                ref={switchRef}
              >
                Receive updates when other members engage
              </Switch>
            )}
          </FormWrapper>
        </WriteCommentContext.Provider>
      </Modal.Body>
    </Modal>
  );
}
