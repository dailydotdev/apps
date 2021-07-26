import React, { ReactElement, MouseEvent, useState } from 'react';
import { useMutation } from 'react-query';
import request from 'graphql-request';
import { DELETE_POST_MUTATION } from '../../graphql/posts';
import { apiUrl } from '../../lib/config';
import { Button } from '../buttons/Button';
import { ModalProps } from './StyledModal';
import {
  ConfirmationModal,
  ConfirmationHeading,
  ConfirmationDescription,
  ConfirmationButtons,
} from './ConfirmationModal';
import { EmptyResponse } from '../../graphql/emptyResponse';

export interface Props extends ModalProps {
  postId: string;
}

export default function DeletePostModal({
  postId,
  ...props
}: Props): ReactElement {
  const [deleting, setDeleting] = useState<boolean>(false);

  const { mutateAsync: deletePost } = useMutation<EmptyResponse>(() =>
    request(`${apiUrl}/graphql`, DELETE_POST_MUTATION, {
      id: postId,
    }),
  );

  const onDeletePost = async (event: MouseEvent): Promise<void> => {
    if (deleting) {
      return;
    }
    setDeleting(true);
    try {
      await deletePost();
      props.onRequestClose(event);
    } catch (err) {
      setDeleting(false);
    }
  };

  return (
    <ConfirmationModal {...props}>
      <ConfirmationHeading>Delete post 🚫</ConfirmationHeading>
      <ConfirmationDescription>
        Are you sure you want to delete this post? This action cannot be undone.
      </ConfirmationDescription>
      <ConfirmationButtons>
        <Button className="btn-secondary" onClick={props.onRequestClose}>
          Cancel
        </Button>
        <Button
          className="btn-primary-ketchup"
          loading={deleting}
          onClick={onDeletePost}
        >
          Delete
        </Button>
      </ConfirmationButtons>
    </ConfirmationModal>
  );
}
