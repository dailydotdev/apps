import React, { ReactElement } from 'react';
import { useQuery } from 'react-query';
import { Button } from '../buttons/Button';
import { Justify } from '../utilities';
import { Modal, ModalProps } from './common/Modal';
import { TextField } from '../fields/TextField';
import CopyIcon from '../icons/Copy';
import Alert, { AlertType } from '../widgets/Alert';
import LinkIcon from '../icons/Link';
import { deleteSquad, getSquad, Squad } from '../../graphql/squads';
import { useCopyLink } from '../../hooks/useCopyLink';
import { Image } from '../image/Image';
import { cloudinary } from '../../lib/image';
import DailyCircle from '../DailyCircle';
import { PromptOptions, usePrompt } from '../../hooks/usePrompt';

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
  initialSqual: Squad;
} & ModalProps;

function LockedSquadModal({
  initialSqual,
  onRequestClose,
}: LockedSquadModalProps): ReactElement {
  const { data: squad, isLoading } = useQuery(
    [{ type: 'squad_locked', id: initialSqual.id }],
    ({ queryKey: [{ id }] }) => getSquad(id),
    { initialData: initialSqual },
  );
  const { showPrompt } = usePrompt();
  const token = squad?.currentMember?.referralToken ?? '';
  const invitation = `${squad?.permalink}/${token}`;
  const [copying, copyLink] = useCopyLink(() => invitation);
  const onCopy = () => {
    copyLink();
  };

  const onDeleteSquad = async (e) => {
    if (await showPrompt(options)) {
      await deleteSquad(squad.id);
      onRequestClose(e);
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
        <TextField
          aria-busy={isLoading}
          className={{ container: 'w-full mt-10' }}
          name="permalink"
          inputId="permalink"
          label={invitation}
          type="url"
          fieldType="tertiary"
          disabled
          actionButton={
            <Button
              icon={<CopyIcon />}
              onClick={onCopy}
              disabled={copying}
              className="btn-tertiary"
              data-testid="textfield-action-icon"
            />
          }
          value={invitation}
          readOnly
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
          onClick={onCopy}
          disabled={copying}
        >
          Copy invitation link
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default LockedSquadModal;
