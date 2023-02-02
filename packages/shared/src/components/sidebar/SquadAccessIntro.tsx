import React, { ReactElement } from 'react';
import SquadsBackgroundSvg from '../../svg/SquadsBackground';
import { Button } from '../buttons/Button';
import { Modal } from '../modals/common/Modal';
import { Justify } from '../utilities';

interface SquadAccessIntroProps {
  onClose: () => void;
  onCreateSquad: () => void;
}

function SquadAccessIntro({
  onClose,
  onCreateSquad,
}: SquadAccessIntroProps): ReactElement {
  return (
    <>
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
        <Button className="btn-tertiary" onClick={onClose}>
          Close
        </Button>
        <Button className="btn-primary-cabbage" onClick={onCreateSquad}>
          Create squad
        </Button>
      </Modal.Footer>
    </>
  );
}

export default SquadAccessIntro;
