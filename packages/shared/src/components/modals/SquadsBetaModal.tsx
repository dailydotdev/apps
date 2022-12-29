import React, { ReactElement, useState } from 'react';
import SquadsBackgroundSvg from '../../svg/SquadsBackground';
import { Button } from '../buttons/Button';
import { Justify } from '../utilities';
import { Modal } from './common/Modal';
import {
  ConfirmationButtons,
  ConfirmationDescription,
  ConfirmationHeading,
  ConfirmationModal,
} from './ConfirmationModal';

export type SquadsBetaModalProps = {
  onRequestClose: () => void;
  onNext: () => void;
};

type ConfirmationProps = {
  onRequestClose: () => void;
  onContinue: () => void;
};

function Confirmation({
  onRequestClose,
  onContinue,
}: ConfirmationProps): ReactElement {
  return (
    <ConfirmationModal isOpen>
      <ConfirmationHeading>Quit the process?</ConfirmationHeading>
      <ConfirmationDescription>
        <p>
          Learning is more powerful together. Are you sure you want to quit the
          process?
        </p>
        <p>p.s you can create a new squad from the left sidebar</p>
      </ConfirmationDescription>
      <ConfirmationButtons>
        <Button className="btn-secondary" onClick={onRequestClose}>
          Cancel
        </Button>
        <Button className="btn-primary-ketchup" onClick={onContinue}>
          Continue
        </Button>
      </ConfirmationButtons>
    </ConfirmationModal>
  );
}

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
            You get access to
            <br />
            <span className="text-theme-color-cabbage">Squad Beta.</span>
          </h3>
          <h4 className="mt-4 text-center typo-title3">
            With squad, you can share knowledge, content and collaborate with
            your colleagues, in one place.
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
        <Confirmation
          onContinue={onRequestClose}
          onRequestClose={() => setShowConfirmation(false)}
        />
      )}
    </>
  );
}

export default SquadsBetaModal;
