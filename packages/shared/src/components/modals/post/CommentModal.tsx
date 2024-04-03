import React, {
  ReactElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
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
import { NotificationPromptSource } from '../../../lib/analytics';
import { Switch } from '../../fields/Switch';
import { useAuthContext } from '../../../contexts/AuthContext';
import CommentContainer from '../../comments/CommentContainer';

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

  for (const item of data?.postComments?.edges) {
    if (item.node.id === commentId) {
      return item.node;
    }
    if (!!item.node.children) {
      for (const child of item.node.children.edges) {
        if (child.node.id === commentId) {
          return child.node;
        }
      }
    }
  }

  return undefined;
};

// statically defined heights of various containers that
// affect final height of the input container
// when styles change, these should be updated accordingly
const headerSize = 57;
const replySize = 40;
const footerSize = 48;

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
  ...props
}: CommentModalProps): ReactElement {
  const [value, setValue] = useState('');
  const [styleHeight, setStyleHeight] = useState<number | 'auto'>('auto');
  const { user } = useAuthContext();
  const client = useQueryClient();
  const [modalNode, setModalNode] = useState<HTMLElement>(null);

  const isEdit = !!editCommentId;
  const isReply = !isEdit && !!replyToCommentId;

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
    [client, post?.id, parentCommentId, replyToCommentId],
  );

  const { mutateComment, isLoading } = useMutateComment({
    post,
    editCommentId: isEdit && editCommentId,
    parentCommentId: isEdit ? comment?.parent?.id : parentCommentId,
    onCommented: onSuccess,
  });

  useLayoutEffect(() => {
    // scroll to bottom of modal
    modalNode?.scrollTo({ behavior: 'instant', top: 10000 });
  }, [modalNode]);

  const { height } = useVisualViewport();
  const replyHeight = height > 0 ? replySize : 0;
  const footerHeight = shouldShowCta ? footerSize : 0;
  const totalHeight = height - headerSize - replyHeight - footerHeight;
  const inputHeight = totalHeight > 0 ? Math.max(totalHeight, 300) : 'auto';

  useEffect(() => {
    setStyleHeight(inputHeight);
  }, [inputHeight, setStyleHeight]);

  const { submitCopy, initialContent } = useMemo(() => {
    if (isEdit) {
      return {
        submitCopy: 'Save',
        initialContent: comment?.content,
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
  }, [isEdit, isReply, comment, user?.id]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      onAfterClose={onAfterClose}
      className="!h-full !max-h-none !w-full !border-none"
      overlayClassName="!touch-none"
    >
      <Modal.Body className="!p-0" ref={refCallback}>
        <FormWrapper
          form="new comment"
          copy={{ right: submitCopy }}
          leftButtonProps={{
            onClick: onRequestClose,
          }}
          rightButtonProps={{
            onClick: async () => {
              await onSubmitted();
              mutateComment(value);
            },
            loading: isLoading,
          }}
          className={{
            container: 'flex-1 first:!border-none',
            header: 'sticky top-0 z-2 w-full bg-background-default',
          }}
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
              <div className="ml-12 flex gap-2 border-l border-theme-divider-tertiary py-3 pl-5 text-theme-label-tertiary typo-caption1">
                Reply to
                <span className="font-bold text-theme-label-primary">
                  {comment.author?.username}
                </span>
              </div>
            </>
          )}
          <CommentMarkdownInput
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
              input: '!max-h-none flex-1 comment-input-123',
            }}
            showSubmit={false}
            showUserAvatar={false}
            onChange={setValue}
            style={{
              height: `${styleHeight}px`,
            }}
          />
          {shouldShowCta && (
            <Switch
              inputId="push_notification-switch"
              name="push_notification"
              labelClassName="flex-1 font-normal"
              className="mx-3 my-3.5"
              compact={false}
              checked={isEnabled}
              onToggle={onToggle}
            >
              Receive updates when other members engage
            </Switch>
          )}
        </FormWrapper>
      </Modal.Body>
    </Modal>
  );
}
