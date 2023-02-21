import React, { ReactElement, useRef } from 'react';
import { useQuery } from 'react-query';
import { Button } from '../buttons/Button';
import { Modal, ModalProps } from './common/Modal';
import Alert, { AlertType } from '../widgets/Alert';
import LinkIcon from '../icons/Link';
import { getSquad, Squad } from '../../graphql/squads';
import {
  InviteTextField,
  InviteTextFieldHandle,
} from '../squads/InviteTextField';
import { SquadModalHeader } from '../squads/ModalHeader';
import { Origin } from '../../lib/analytics';

type SquadInviteModalProps = {
  initialSquad: Squad;
} & ModalProps;

function SquadInviteModal({
  initialSquad,
  onRequestClose,
}: SquadInviteModalProps): ReactElement {
  const { data: squad, isLoading } = useQuery(
    [{ type: 'squad_locked', id: initialSquad.id }],
    ({ queryKey: [{ id }] }) => getSquad(id),
    { initialData: initialSquad },
  );
  const inviteTextRef = useRef<InviteTextFieldHandle>();

  return (
    <Modal
      isOpen
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
      onRequestClose={onRequestClose}
    >
      <Modal.Header title="Invite more members to join" />
      <Modal.Body className="flex flex-col items-center overflow-x-hidden">
        <SquadModalHeader squad={squad} />
        <InviteTextField
          isLoading={isLoading}
          squad={squad}
          ref={inviteTextRef}
          origin={Origin.SquadPage}
        />
        <Alert
          className="mt-4"
          type={AlertType.Info}
          title={`Invite more members to ${squad.name} to stay up to date together and collaborate.`}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button
          icon={<LinkIcon />}
          className="btn-primary-cabbage mx-4 flex-1"
          onClick={() => inviteTextRef.current?.copyLink()}
        >
          Copy invitation link
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SquadInviteModal;
