import React, { ReactElement, MouseEvent, useState } from 'react';
import { useMutation } from 'react-query';
import request from 'graphql-request';
import { DELETE_COMMENT_MUTATION } from '../../graphql/comments';
import { apiUrl } from '../../lib/config';
import { Button } from '../buttons/Button';
import { ModalProps } from './StyledModal';
import {
  ConfirmationModal,
  ConfirmationHeading,
  ConfirmationDescription,
  ConfirmationButtons,
} from './ConfirmationModal';
import { useCompanionProtocol } from '../../hooks/useCompanionProtocol';
import { usePostComment } from '../../hooks/usePostComment';
import { Post } from '../../graphql/posts';

export interface Props extends ModalProps {
  commentId: string;
  parentId: string | null;
  post: Post;
}

export default function DeleteCommentModal({
  commentId,
  parentId,
  post,
  ...props
}: Props): ReactElement {
  const [deleting, setDeleting] = useState<boolean>(false);
  const { deleteCommentCache } = usePostComment(post);
  const { companionRequest } = useCompanionProtocol();
  const requestMethod = companionRequest || request;
  const { mutateAsync: deleteComment } = useMutation(
    () =>
      requestMethod(`${apiUrl}/graphql`, DELETE_COMMENT_MUTATION, {
        id: commentId,
      }),
    { onSuccess: () => deleteCommentCache(commentId, parentId) },
  );

  const onDeleteComment = async (event: MouseEvent): Promise<void> => {
    if (deleting) {
      return;
    }
    setDeleting(true);
    try {
      await deleteComment();
      props.onRequestClose(event);
    } catch (err) {
      setDeleting(false);
    }
  };

  return (
    <ConfirmationModal {...props}>
      <ConfirmationHeading>Delete comment</ConfirmationHeading>
      <ConfirmationDescription>
        Are you sure you want to delete your comment? This action cannot be
        undone.
      </ConfirmationDescription>
      <ConfirmationButtons>
        <Button className="btn-secondary" onClick={props.onRequestClose}>
          Cancel
        </Button>
        <Button
          className="btn-primary-ketchup"
          loading={deleting}
          onClick={onDeleteComment}
        >
          Delete
        </Button>
      </ConfirmationButtons>
    </ConfirmationModal>
  );
}
