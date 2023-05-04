import React, { ReactElement } from 'react';
import { ChecklistCard } from './ChecklistCard';
import { useSquadChecklist } from '../../hooks/useSquadChecklist';
import { Squad } from '../../graphql/sources';
import InteractivePopup, {
  InteractivePopupPosition,
} from '../tooltips/InteractivePopup';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import { Modal } from '../modals/common/Modal';
import { ModalKind } from '../modals/common/types';
import { useChecklist } from '../../hooks/useChecklist';

const SquadChecklistCard = ({ squad }: { squad: Squad }): ReactElement => {
  const { steps, isChecklistVisible, setChecklistVisible } = useSquadChecklist({
    squad,
  });
  const { sidebarRendered } = useSidebarRendered();
  const { isDone } = useChecklist({ steps });

  if (!isChecklistVisible) {
    return null;
  }

  const onRequestClose = () => {
    setChecklistVisible(false);
  };

  const checklistElement = (
    <ChecklistCard
      title={isDone ? 'Good job! you nailed it. 🥳' : 'Get started with squads'}
      description="5 simple steps to squad greatness!"
      steps={steps}
      onRequestClose={onRequestClose}
    />
  );

  if (!sidebarRendered) {
    return (
      <Modal
        className="!w-auto"
        isOpen={isChecklistVisible}
        kind={ModalKind.FlexibleCenter}
        onRequestClose={onRequestClose}
      >
        {checklistElement}
      </Modal>
    );
  }

  return (
    <InteractivePopup
      position={InteractivePopupPosition.RightEnd}
      className="rounded-none !bg-transparent"
    >
      {checklistElement}
    </InteractivePopup>
  );
};

export default SquadChecklistCard;
