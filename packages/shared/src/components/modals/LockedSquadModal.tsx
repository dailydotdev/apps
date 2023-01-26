import React, { ReactElement, useRef } from 'react';
import { useQuery } from 'react-query';
import { Button } from '../buttons/Button';
import { Justify } from '../utilities';
import { Modal, ModalProps } from './common/Modal';
import Alert, { AlertType } from '../widgets/Alert';
import LinkIcon from '../icons/Link';
import { deleteSquad, getSquad, Squad } from '../../graphql/squads';
import { PromptOptions, usePrompt } from '../../hooks/usePrompt';
import { useToastNotification } from '../../hooks/useToastNotification';
import { useBoot } from '../../hooks/useBoot';
import {
  InviteTextField,
  InviteTextFieldHandle,
} from '../squads/InviteTextField';
import { SquadModalHeader } from '../squads/ModalHeader';

const options: PromptOptions = {
  title: 'Delete the Squad?',
  description:
    'Deleting your Squad will free up your handle and members you invited will not be able to join',
  okButton: {
    title: 'Delete',
    className: 'btn-secondary',
  },
  cancelButton: {
    title: 'No, keep it',
    className: 'btn-primary-cabbage',
  },
  className: {
    buttons: 'flex-row-reverse',
  },
};

type LockedSquadModalProps = {
  initialSquad: Squad;
} & ModalProps;

function LockedSquadModal({
  initialSquad,
  onRequestClose,
}: LockedSquadModalProps): ReactElement {
  const { deleteSquad: deleteCachedSquad } = useBoot();
  const { showPrompt } = usePrompt();
  const { displayToast } = useToastNotification();
  const { data: squad, isLoading } = useQuery(
    [{ type: 'squad_locked', id: initialSquad.id }],
    ({ queryKey: [{ id }] }) => getSquad(id),
    { initialData: initialSquad },
  );
  const inviteTextRef = useRef<InviteTextFieldHandle>();
  const onDeleteSquad = async (e) => {
    if (!(await showPrompt(options))) {
      return;
    }
    try {
      await deleteSquad(squad.id);
      deleteCachedSquad(squad.id);
      onRequestClose(e);
    } catch (error) {
      displayToast('An error occurred.');
    }
  };

  return (
    <Modal
      isOpen
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
      onRequestClose={onRequestClose}
    >
      <Modal.Header title="Waiting for members to join" />
      <Modal.Body className="flex overflow-x-hidden flex-col items-center">
        <SquadModalHeader squad={squad} />
        <InviteTextField
          isLoading={isLoading}
          squad={squad}
          ref={inviteTextRef}
        />
        <Alert
          className="mt-4"
          type={AlertType.Info}
          title="We are waiting for new members to join in order to unlock your Squad."
        />
      </Modal.Body>
      <Modal.Footer justify={Justify.Between}>
        <Button className="btn-tertiary" onClick={onDeleteSquad}>
          Delete Squad
        </Button>
        <Button
          icon={<LinkIcon />}
          className="btn-primary-cabbage"
          onClick={() => inviteTextRef.current?.copyLink()}
        >
          Copy invitation link
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default LockedSquadModal;
