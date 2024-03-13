import React, { ReactElement } from 'react';
import SquadTour from '../squads/SquadTour';
import { useSquadTour } from '../../hooks/useSquadTour';
import InteractivePopup, {
  InteractivePopupPosition,
} from '../tooltips/InteractivePopup';
import { PopupCloseEvent } from './common';
import { Drawer } from '../drawers';
import { useViewSize, ViewSize } from '../../hooks';

interface SquadTourPopupProps {
  onClose?: PopupCloseEvent;
}

function SquadTourPopup({ onClose }: SquadTourPopupProps): ReactElement {
  const { onCloseTour } = useSquadTour();
  const isMobile = useViewSize(ViewSize.MobileL);
  const onModalClose: typeof onClose = (param) => {
    onCloseTour();
    onClose(param);
  };

  if (isMobile) {
    return (
      <Drawer
        isOpen
        displayCloseButton
        onClose={() => onModalClose(null)}
        className={{ drawer: 'pb-4' }}
      >
        <SquadTour onClose={onModalClose} />
      </Drawer>
    );
  }

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
