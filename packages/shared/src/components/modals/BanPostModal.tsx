import React, { ReactElement, MouseEvent, useState } from 'react';
import { useMutation } from 'react-query';
import request from 'graphql-request';
import { BAN_POST_MUTATION } from '../../graphql/posts';
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

export default function BanPostModal({
  postId,
  ...props
}: Props): ReactElement {
  const [banning, setBanning] = useState<boolean>(false);

  const { mutateAsync: banPost } = useMutation<EmptyResponse>(() =>
    request(`${apiUrl}/graphql`, BAN_POST_MUTATION, {
      id: postId,
    }),
  );

  const onBanPost = async (event: MouseEvent): Promise<void> => {
    if (banning) {
      return;
    }
    setBanning(true);
    try {
      await banPost();
      props.onRequestClose(event);
    } catch (err) {
      setBanning(false);
    }
  };

  return (
    <ConfirmationModal {...props}>
      <ConfirmationHeading>Ban post 💩</ConfirmationHeading>
      <ConfirmationDescription>
        Are you sure you want to ban this post?
      </ConfirmationDescription>
      <ConfirmationButtons>
        <Button className="btn-secondary" onClick={props.onRequestClose}>
          Cancel
        </Button>
        <Button
          className="btn-primary-ketchup"
          loading={banning}
          onClick={onBanPost}
        >
          Ban
        </Button>
      </ConfirmationButtons>
    </ConfirmationModal>
  );
}
