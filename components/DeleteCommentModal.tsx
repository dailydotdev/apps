import React, { ReactElement, MouseEvent, useState } from 'react';
import {
  ConfirmationModal,
  ConfirmationHeading,
  ConfirmationDescription,
  ConfirmationButtons,
  Props as ModalProps,
} from './StyledModal';
import { ColorButton, HollowButton } from './Buttons';
import { colorKetchup40 } from '../styles/colors';
import { ButtonLoader } from './utilities';
import { useMutation } from '@apollo/client';
import {
  DELETE_COMMENT_MUTATION,
  POST_COMMENTS_QUERY,
  PostCommentsData,
} from '../graphql/comments';
import cloneDeep from 'lodash.clonedeep';
import { EmptyResponse } from '../graphql/posts';

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

  const [deleteComment] = useMutation<EmptyResponse>(DELETE_COMMENT_MUTATION, {
    variables: { id: commentId },
    update(cache) {
      const query = {
        query: POST_COMMENTS_QUERY,
        variables: { postId: postId },
      };
      const cached = cloneDeep(cache.readQuery<PostCommentsData>(query));
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
            cached.postComments.edges[parentIndex].node.children.edges.splice(
              childIndex,
              1,
            );
          }
        }
      } else {
        // Delete the main comment
        const index = cached.postComments.edges.findIndex(
          (e) => e.node.id === commentId,
        );
        cached.postComments.edges.splice(index, 1);
      }
      cache.writeQuery({ ...query, data: cached });
    },
  });

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
