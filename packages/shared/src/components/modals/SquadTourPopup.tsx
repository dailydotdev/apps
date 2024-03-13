import React, { ReactElement } from 'react';
import SquadTour from '../squads/SquadTour';
import { useSquadTour } from '../../hooks/useSquadTour';
import InteractivePopup, {
  InteractivePopupPosition,
} from '../tooltips/InteractivePopup';
import { PopupCloseEvent } from './common';

interface SquadTourPopupProps {
  onClose?: PopupCloseEvent;
}

function SquadTourPopup({ onClose }: SquadTourPopupProps): ReactElement {
  const { onCloseTour } = useSquadTour();
  const onModalClose: typeof onClose = (param) => {
    onCloseTour();
    onClose(param);
  };

  return (
    <InteractivePopup
      position={InteractivePopupPosition.Center}
      className="w-full max-w-[26.25rem]"
      closeOutsideClick
      onClose={onModalClose}
    >
      <SquadTour onClose={onModalClose} />
    </InteractivePopup>
  );
}

export default SquadTourPopup;
