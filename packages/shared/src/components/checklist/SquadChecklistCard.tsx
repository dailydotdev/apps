import React, { ReactElement, useContext, useEffect } from 'react';
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
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AnalyticsEvent, TargetType } from '../../lib/analytics';

const SquadChecklistCard = ({ squad }: { squad: Squad }): ReactElement => {
  const { steps, isChecklistVisible, setChecklistVisible, isChecklistReady } =
    useSquadChecklist({
      squad,
    });
  const { sidebarRendered } = useSidebarRendered();
  const { isDone } = useChecklist({ steps });
  const { trackEvent } = useContext(AnalyticsContext);

  useEffect(() => {
    trackEvent({
      event_name: AnalyticsEvent.Impression,
      target_type: TargetType.OnboardingChecklist,
      extra: JSON.stringify({ squad: squad.id }),
    });
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isChecklistVisible || !isChecklistReady || !squad.currentMember) {
    return null;
  }

  const onRequestClose = () => {
    trackEvent({
      event_name: AnalyticsEvent.ChecklistClose,
      extra: JSON.stringify({ squad: squad.id }),
    });
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
