import React, { ReactElement } from 'react';
import { useQueryClient } from 'react-query';
import { LazyModalCommonProps, Modal } from './common/Modal';
import { Squad, editSquad } from '../../graphql/squads';
import { SquadDetails } from '../squads/Details';
import { ModalHeaderKind } from './common/types';
import { useToastNotification } from '../../hooks/useToastNotification';

export type EditSquadModalProps = {
  squad: Squad;
} & LazyModalCommonProps;

function EditSquadModal({
  onRequestClose,
  isOpen,
  squad,
}: EditSquadModalProps): ReactElement {
  const queryClient = useQueryClient();
  const { displayToast } = useToastNotification();
  const onSubmit = async (e, form) => {
    e.preventDefault();
    const editedSquad = await editSquad(squad.id, {
      ...squad,
      name: form.name,
      description: form.description,
      handle: form.handle,
    });
    if (editedSquad) {
      const queryKey = ['squad', editedSquad.handle];
      await queryClient.invalidateQueries(queryKey);
      displayToast('The Squad has been updated');
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
      <Modal.Header title="Squad details" kind={ModalHeaderKind.Tertiary} />
      <SquadDetails form={squad} onSubmit={onSubmit} createMode={false} />
    </Modal>
  );
}

export default EditSquadModal;
