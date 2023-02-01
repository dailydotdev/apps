import React, { ReactElement } from 'react';
import { useQueryClient } from 'react-query';
import { LazyModalCommonProps, Modal } from './common/Modal';
import { Squad, editSquad } from '../../graphql/squads';
import { SquadDetails } from '../squads/Details';
import { ModalHeaderKind } from './common/types';
import { useToastNotification } from '../../hooks/useToastNotification';
import { useBoot } from '../../hooks/useBoot';

export type EditSquadModalProps = {
  squad: Squad;
} & LazyModalCommonProps;

function EditSquadModal({
  onRequestClose,
  isOpen,
  squad,
}: EditSquadModalProps): ReactElement {
  const queryClient = useQueryClient();
  const { updateSquad } = useBoot();
  const { displayToast } = useToastNotification();
  const onSubmit = async (e, form) => {
    e.preventDefault();
    const formJson = {
      ...squad,
      name: form.name,
      description: form.description,
      handle: form.handle,
      file: form.file,
    };
    const editedSquad = await editSquad(squad.id, formJson);
    if (editedSquad) {
      const queryKey = ['squad', editedSquad.handle];
      await queryClient.invalidateQueries(queryKey);
      updateSquad(editedSquad);
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
