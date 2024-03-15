import React, {
  ReactElement,
  useCallback,
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

  const found = data?.postComments?.edges?.find((e) => e.node.id === commentId);
  return found?.node;
};

const headerSize = 56;
const replySize = 40;

export interface CommentModalProps
  extends LazyModalCommonProps,
    CommentMarkdownInputProps {}

export default function CommentModal({
  isOpen,
  onRequestClose,
  onAfterClose,
  onCommented,
  parentCommentId,
  editCommentId,
  ...props
}: CommentModalProps): ReactElement {
  const [value, setValue] = useState('');
  const client = useQueryClient();
  const [modalNode, setModalNode] = useState<HTMLElement>(null);

  const refCallback = useCallback(
    (node) => {
      if (node) {
        setModalNode(node);
      }
    },
    [setModalNode],
  );

  const onSuccess: typeof onCommented = (comment, isNew, parentCommentID) => {
    if (onCommented) {
      onCommented(comment, isNew, parentCommentID);
    }
    onRequestClose();
  };

  const { mutateComment, isLoading } = useMutateComment({
    post: props.post,
    editCommentId,
    parentCommentId,
    onCommented: onSuccess,
  });

  const replyToComment = useMemo(
    () =>
      getCommentFromCache({
        client,
        postId: props.post.id,
        commentId: parentCommentId,
      }),
    [client, props.post?.id, parentCommentId],
  );

  const { height } = useVisualViewport();

  useLayoutEffect(() => {
    // scroll to bottom of modal
    modalNode?.scrollTo({ behavior: 'instant', top: height });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalNode]);

  const submitCopy = useMemo(() => {
    if (editCommentId) {
      return 'Save';
    }
    if (parentCommentId) {
      return 'Reply';
    }
    return 'Comment';
  }, [editCommentId, parentCommentId]);

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
            onClick: () => {
              mutateComment(value);
            },
            loading: isLoading,
          }}
          className={{
            container: 'flex-1 first:!border-none',
            header: 'sticky top-0 z-2 w-full bg-background-default',
          }}
        >
          {replyToComment && (
            <>
              <CommentContainer
                post={props.post}
                comment={replyToComment}
                className={{
                  container: 'mx-4 mt-4 border',
                }}
              />
              <div className="ml-12 flex gap-2 border-l border-theme-divider-tertiary py-3 pl-5 text-theme-label-tertiary typo-caption1">
                Reply to
                <span className="font-bold text-theme-label-primary">
                  {replyToComment.author?.username}
                </span>
              </div>
            </>
          )}
          <CommentMarkdownInput
            {...props}
            replyTo={null}
            parentCommentId={parentCommentId}
            editCommentId={editCommentId}
            className={{
              markdownContainer: 'flex-1',
              container: classNames(
                'flex flex-col',
                replyToComment ? 'h-[calc(100%-2.5rem)]' : 'h-full',
              ),
              tab: 'flex-1',
              input: '!max-h-none flex-1',
            }}
            showSubmit={false}
            showUserAvatar={false}
            onChange={setValue}
            style={{
              height: replyToComment
                ? height - headerSize - replySize
                : height - headerSize,
            }}
          />
        </FormWrapper>
      </Modal.Body>
    </Modal>
  );
}
