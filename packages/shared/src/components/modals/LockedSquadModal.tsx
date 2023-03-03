import React, { ReactElement, useRef } from 'react';
import { useQuery } from 'react-query';
import { Button, ButtonSize } from '../buttons/Button';
import { Justify } from '../utilities';
import { Modal, ModalProps } from './common/Modal';
import Alert, { AlertType } from '../widgets/Alert';
import LinkIcon from '../icons/Link';
import { getSquad, Squad } from '../../graphql/squads';
import {
  InviteTextField,
  InviteTextFieldHandle,
} from '../squads/InviteTextField';
import { SquadModalHeader } from '../squads/ModalHeader';
import { useDeleteSquad } from '../../hooks/useDeleteSquad';
import { Origin } from '../../lib/analytics';

type LockedSquadModalProps = {
  initialSquad: Squad;
} & ModalProps;

function LockedSquadModal({
  initialSquad,
  onRequestClose,
}: LockedSquadModalProps): ReactElement {
  const { data: squad, isLoading } = useQuery(
    [{ type: 'squad_locked', id: initialSquad.id }],
    ({ queryKey: [{ id }] }) => getSquad(id),
    { initialData: initialSquad },
  );
  const { onDeleteSquad } = useDeleteSquad({ squad, callback: onRequestClose });
  const inviteTextRef = useRef<InviteTextFieldHandle>();

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
          origin={Origin.LockedSquad}
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
