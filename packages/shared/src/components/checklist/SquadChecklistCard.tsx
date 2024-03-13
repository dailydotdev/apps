import React, { ReactElement, useContext, useEffect } from 'react';
import { ChecklistCard } from './ChecklistCard';
import { useSquadChecklist } from '../../hooks/useSquadChecklist';
import { Squad } from '../../graphql/sources';
import InteractivePopup, {
  InteractivePopupPosition,
} from '../tooltips/InteractivePopup';
import { useChecklist } from '../../hooks/useChecklist';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AnalyticsEvent, TargetType } from '../../lib/analytics';
import { useViewSize, ViewSize } from '../../hooks';
import { Drawer } from '../drawers';

const SquadChecklistCard = ({ squad }: { squad: Squad }): ReactElement => {
  const { steps, isChecklistVisible, setChecklistVisible, isChecklistReady } =
    useSquadChecklist({
      squad,
    });
  const isMobile = useViewSize(ViewSize.MobileL);
  const { isDone } = useChecklist({ steps });
  const { trackEvent } = useContext(AnalyticsContext);
  const totalStepsCount = steps.length;

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
      description={`${totalStepsCount} simple steps to Squad greatness!`}
      steps={steps}
      onRequestClose={onRequestClose}
      className={isMobile && 'w-full !max-w-full border-0'}
    />
  );

  if (isMobile) {
    return (
      <Drawer
        isOpen
        displayCloseButton
        onClose={onRequestClose}
        className={{ drawer: 'pb-4' }}
      >
        {checklistElement}
      </Drawer>
    );
  }

  return (
    <InteractivePopup
      position={InteractivePopupPosition.RightEnd}
      className="flex w-full max-w-[21.5rem] justify-center rounded-none"
    >
      {checklistElement}
    </InteractivePopup>
  );
};

export default SquadChecklistCard;
