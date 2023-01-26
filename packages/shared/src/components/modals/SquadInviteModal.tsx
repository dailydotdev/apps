import React, { ReactElement, useRef } from 'react';
import { useQuery } from 'react-query';
import { Button } from '../buttons/Button';
import { Justify } from '../utilities';
import { Modal, ModalProps } from './common/Modal';
import Alert, { AlertType } from '../widgets/Alert';
import LinkIcon from '../icons/Link';
import { getSquad, Squad } from '../../graphql/squads';
import { Image } from '../image/Image';
import { cloudinary } from '../../lib/image';
import DailyCircle from '../DailyCircle';
import {
  InviteTextField,
  InviteTextFieldHandle,
} from '../squads/InviteTextField';

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
      <Modal.Header title="Waiting for members to join" />
      <Modal.Body className="flex overflow-x-hidden flex-col items-center">
        <div className="flex relative justify-center items-center my-4 w-full h-40">
          <DailyCircle className=" absolute bottom-0 -left-10" size="xsmall" />
          <DailyCircle className=" absolute top-4 left-10" size="xxsmall" />
          <Image
            src={squad.name}
            alt={squad.name}
            className="object-cover w-40 h-40 rounded-full"
            loading="lazy"
            fallbackSrc={cloudinary.squads.imageFallback}
          />
          <DailyCircle className=" absolute top-0 -right-10" size="xsmall" />
          <DailyCircle className=" absolute right-10 bottom-4" size="xxsmall" />
        </div>
        <h3 className="font-bold typo-title2">{squad.name}</h3>
        <h4 className="text-theme-label-tertiary">@{squad.handle}</h4>
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
        <Button
          icon={<LinkIcon />}
          className="btn-primary-cabbage"
          onClick={() => inviteTextRef.current?.onCopy()}
        >
          Copy invitation link
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SquadInviteModal;
