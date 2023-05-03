import React, { ReactElement } from 'react';
import { ChecklistCard } from './ChecklistCard';
import { useSquadChecklistSteps } from '../../hooks/useSquadChecklistSteps';
import { Squad } from '../../graphql/sources';
import usePersistentContext from '../../hooks/usePersistentContext';
import { SQUAD_CHECKLIST_VISIBLE_KEY } from '../../lib/checklist';
import InteractivePopup, {
  InteractivePopupPosition,
} from '../tooltips/InteractivePopup';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import { Modal } from '../modals/common/Modal';
import { ModalKind } from '../modals/common/types';

const SquadChecklistCard = ({ squad }: { squad: Squad }): ReactElement => {
  const { steps } = useSquadChecklistSteps({ squad });
  const [isChecklistVisible, setChecklistVisible] = usePersistentContext(
    SQUAD_CHECKLIST_VISIBLE_KEY,
    false,
  );
  const { sidebarRendered } = useSidebarRendered();

  if (!isChecklistVisible) {
    return null;
  }

  const checklistElement = (
    <ChecklistCard
      title="Squads v5"
      description="Use all of the new features"
      steps={steps}
      onRequestClose={() => {
        setChecklistVisible(false);
      }}
    />
  );

  if (!sidebarRendered) {
    return (
      <Modal
        className="!w-auto"
        isOpen={isChecklistVisible}
        kind={ModalKind.FlexibleCenter}
      >
        {checklistElement}
      </Modal>
    );
  }

  return (
    <InteractivePopup
      position={InteractivePopupPosition.RightEnd}
      className="rounded-none"
    >
      {checklistElement}
    </InteractivePopup>
  );
};

export default SquadChecklistCard;
