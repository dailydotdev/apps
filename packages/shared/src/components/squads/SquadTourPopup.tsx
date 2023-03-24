import React, { MouseEvent, ReactElement } from 'react';
import { useTutorial, TutorialKey } from '../../hooks/useTutorial';
import CloseButton from '../CloseButton';
import InteractivePopup, {
  InteractivePopupPosition,
} from '../tooltips/InteractivePopup';
import SquadTour from './SquadTour';
import { useSquadTour } from '../../hooks/useSquadTour';

interface SquadTourPopupProps {
  onClose: React.EventHandler<MouseEvent>;
}

function SquadTourPopup({ onClose }: SquadTourPopupProps): ReactElement {
  const { onTourIndexChange } = useSquadTour();
  const sharePostTutorial = useTutorial({
    key: TutorialKey.SHARE_SQUAD_POST,
  });

  const onPopupClose = (event: MouseEvent) => {
    onTourIndexChange(-1);
    onClose(event);

    sharePostTutorial.activate();
  };

  return (
    <InteractivePopup
      position={InteractivePopupPosition.RightEnd}
      className="border border-theme-color-cabbage w-[26rem]"
    >
      <SquadTour onClose={onPopupClose} />
      <CloseButton
        className="top-3 right-3 !absolute !btn-secondary"
        onClick={onPopupClose}
      />
    </InteractivePopup>
  );
}

export default SquadTourPopup;
