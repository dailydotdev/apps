import React, { ReactElement, MouseEvent, useState } from 'react';
import {
  ConfirmationModal,
  ConfirmationHeading,
  ConfirmationDescription,
  ConfirmationButtons,
  Props as ModalProps,
} from './modals/StyledModal';
import { ColorButton, HollowButton } from './OldButtons';
import { colorKetchup40 } from '../styles/colors';
import { ButtonLoader } from './utilities';
import { useMutation } from 'react-query';
import { DELETE_POST_MUTATION, EmptyResponse } from '../graphql/posts';
import request from 'graphql-request';
import { apiUrl } from '../lib/config';

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
      <ConfirmationHeading>Delete post</ConfirmationHeading>
      <ConfirmationDescription>
        Are you sure you want to delete this post? This action cannot be undone.
      </ConfirmationDescription>
      <ConfirmationButtons>
        <HollowButton onClick={props.onRequestClose}>Cancel</HollowButton>
        <ColorButton
          background={colorKetchup40}
          waiting={deleting}
          onClick={onDeletePost}
        >
          <span>Delete</span>
          <ButtonLoader />
        </ColorButton>
      </ConfirmationButtons>
    </ConfirmationModal>
  );
}
