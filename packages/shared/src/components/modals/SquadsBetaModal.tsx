import React, { ReactElement, useState } from 'react';
import SquadsBackgroundSvg from '../../svg/SquadsBackground';
import { Button } from '../buttons/Button';
import { Justify } from '../utilities';
import { Modal } from './common/Modal';
import { SquadsConfirmation } from './SquadsConfirmationModal';

export type SquadsBetaModalProps = {
  onRequestClose: () => void;
  onNext: () => void;
};

function SquadsBetaModal({
  onRequestClose,
  onNext,
}: SquadsBetaModalProps): ReactElement {
  const [showConfirmation, setShowConfirmation] = useState(false);

  return (
    <>
      <Modal isOpen kind={Modal.Kind.FixedCenter} size={Modal.Size.Small}>
        <Modal.Body>
          <SquadsBackgroundSvg className="absolute top-0 left-0 w-full rounded-t-16" />
          <h3 className="mt-56 font-bold text-center typo-large-title">
            Wow!! You get early access to
            <br />
            <span className="text-theme-color-cabbage">Squads!</span>
          </h3>
          <h4 className="mt-4 text-center typo-title3">
            With Squads, you can stay up to date together as a group and discuss
            privately in one place!
          </h4>
        </Modal.Body>
        <Modal.Footer justify={Justify.Between}>
          <Button
            className="btn-tertiary"
            onClick={() => setShowConfirmation(true)}
          >
            Close
          </Button>
          <Button className="btn-primary-cabbage" onClick={onNext}>
            Create squad
          </Button>
        </Modal.Footer>
      </Modal>
      {showConfirmation && (
        <SquadsConfirmation
          onContinue={onRequestClose}
          onRequestClose={() => setShowConfirmation(false)}
        />
      )}
    </>
  );
}

export default SquadsBetaModal;
