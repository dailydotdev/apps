import React, { ReactElement } from 'react';
import { Modal, ModalProps } from './common/Modal';
import { Squad } from '../../graphql/squads';
import { addPostToSquad, SquadForm } from '../squads/utils';
import { SquadComment } from '../squads/Comment';
import { ModalHeaderKind } from './common/types';
import { Post } from '../../graphql/posts';
import { useToastNotification } from '../../hooks/useToastNotification';

export type PostToSquadModalProps = {
  squad: Squad;
  post: Post;
} & Pick<ModalProps, 'isOpen' | 'onRequestClose'>;

function PostToSquadModal({
  onRequestClose,
  isOpen,
  post,
  squad,
}: PostToSquadModalProps): ReactElement {
  const { displayToast } = useToastNotification();
  const form: Partial<SquadForm> = {
    post: { post },
    name: squad.name,
    file: squad.image,
    handle: squad.handle,
    buttonText: 'Done',
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const squadPost = await addPostToSquad({
      id: post.id,
      sourceId: squad.id,
      commentary: e.target[0].value,
    });
    if (squadPost) {
      displayToast('This post has been shared to your squad');
      onRequestClose(e);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
      onRequestClose={onRequestClose}
    >
      <Modal.Header title="Post article" kind={ModalHeaderKind.Tertiary} />
      <SquadComment form={form} onSubmit={onSubmit} />
    </Modal>
  );
}

export default PostToSquadModal;
