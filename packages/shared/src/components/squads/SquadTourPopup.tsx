import React, { MouseEvent, ReactElement } from 'react';
import CloseButton from '../CloseButton';
import InteractivePopup, {
  InteractivePopupPosition,
} from '../tooltips/InteractivePopup';
import SquadTour from './SquadTour';

interface SquadTourPopupProps {
  onClose: React.EventHandler<MouseEvent>;
}

function SquadTourPopup({ onClose }: SquadTourPopupProps): ReactElement {
  return (
    <InteractivePopup
      position={InteractivePopupPosition.RightEnd}
      className="border border-theme-color-cabbage w-[26rem]"
    >
      <SquadTour onClose={onClose} />
      <CloseButton
        className="top-3 right-3 !absolute !btn-secondary"
        onClick={onClose}
      />
    </InteractivePopup>
  );
}

export default SquadTourPopup;
