import React, { ReactElement, MouseEvent, useState } from 'react';
import {
  ConfirmationModal,
  ConfirmationHeading,
  ConfirmationDescription,
  ConfirmationButtons,
  Props as ModalProps,
} from './StyledModal';
import { ColorButton, HollowButton } from '../Buttons';
import { colorKetchup40 } from '../../styles/colors';
import { ButtonLoader } from '../utilities';
import { useMutation, useQueryClient } from 'react-query';
import {
  DELETE_COMMENT_MUTATION,
  PostCommentsData,
} from '../../graphql/comments';
import cloneDeep from 'lodash.clonedeep';
import request from 'graphql-request';
import { apiUrl } from '../../lib/config';

export interface Props extends ModalProps {
  commentId: string;
  parentId: string | null;
  postId: string;
}

export default function DeleteCommentModal({
  commentId,
  parentId,
  postId,
  ...props
}: Props): ReactElement {
  const [deleting, setDeleting] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const { mutateAsync: deleteComment } = useMutation(
    () =>
      request(`${apiUrl}/graphql`, DELETE_COMMENT_MUTATION, {
        id: commentId,
      }),
    {
      onSuccess: async () => {
        const queryKey = ['post_comments', postId];
        await queryClient.cancelQueries(queryKey);
        const cached = cloneDeep(
          queryClient.getQueryData<PostCommentsData>(queryKey),
        );
        if (cached) {
          // Delete the sub-comment
          if (parentId !== commentId) {
            const parentIndex = cached.postComments.edges.findIndex(
              (e) => e.node.id === parentId,
            );
            if (parentIndex > -1) {
              const childIndex = cached.postComments.edges[
                parentIndex
              ].node.children.edges.findIndex((e) => e.node.id === commentId);
              if (childIndex > -1) {
                cached.postComments.edges[
                  parentIndex
                ].node.children.edges.splice(childIndex, 1);
              }
            }
          } else {
            // Delete the main comment
            const index = cached.postComments.edges.findIndex(
              (e) => e.node.id === commentId,
            );
            cached.postComments.edges.splice(index, 1);
          }
          queryClient.setQueryData(queryKey, cached);
        }
      },
    },
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
        <HollowButton onClick={props.onRequestClose}>Cancel</HollowButton>
        <ColorButton
          background={colorKetchup40}
          waiting={deleting}
          onClick={onDeleteComment}
        >
          <span>Delete</span>
          <ButtonLoader />
        </ColorButton>
      </ConfirmationButtons>
    </ConfirmationModal>
  );
}
