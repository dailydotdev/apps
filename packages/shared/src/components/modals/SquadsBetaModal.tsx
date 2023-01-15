import React, { ReactElement } from 'react';
import { usePrompt } from '../../hooks/usePrompt';
import SquadsBackgroundSvg from '../../svg/SquadsBackground';
import { Button } from '../buttons/Button';
import { Justify } from '../utilities';
import { Modal } from './common/Modal';
import { quitSqualModal } from './NewSquadModal';

export type SquadsBetaModalProps = {
  onRequestClose: () => void;
  onNext: () => void;
};

function SquadsBetaModal({
  onRequestClose,
  onNext,
}: SquadsBetaModalProps): ReactElement {
  const { showPrompt } = usePrompt();
  const onConfirm = async () => {
    const shouldQuit = await showPrompt(quitSqualModal);
    if (shouldQuit) onRequestClose();
  };

  return (
    <Modal isOpen kind={Modal.Kind.FixedCenter} size={Modal.Size.Small}>
      <Modal.Body>
        <SquadsBackgroundSvg className="absolute top-0 left-0 w-full rounded-t-16" />
        <h3 className="mt-56 font-bold text-center typo-large-title">
          Wow! You get early access to
          <br />
          <span className="text-theme-color-cabbage">Squads!</span>
        </h3>
        <h4 className="mt-4 text-center typo-title3">
          With Squads, you can stay up to date together as a group and discuss
          privately in one place.
        </h4>
      </Modal.Body>
      <Modal.Footer justify={Justify.Between}>
        <Button className="btn-tertiary" onClick={onConfirm}>
          Close
        </Button>
        <Button className="btn-primary-cabbage" onClick={onNext}>
          Create squad
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SquadsBetaModal;
