import React, { ReactElement, useContext, useEffect } from 'react';
import { ChecklistCard } from './ChecklistCard';
import { useSquadChecklist } from '../../hooks/useSquadChecklist';
import { Squad } from '../../graphql/sources';
import InteractivePopup, {
  InteractivePopupPosition,
} from '../tooltips/InteractivePopup';
import { useChecklist } from '../../hooks/useChecklist';
import LogContext from '../../contexts/LogContext';
import { LogsEvent, TargetType } from '../../lib/logs';

const SquadChecklistCard = ({ squad }: { squad: Squad }): ReactElement => {
  const { steps, isChecklistVisible, setChecklistVisible, isChecklistReady } =
    useSquadChecklist({
      squad,
    });
  const { isDone } = useChecklist({ steps });
  const { trackEvent } = useContext(LogContext);
  const totalStepsCount = steps.length;

  useEffect(() => {
    trackEvent({
      event_name: LogsEvent.Impression,
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
      event_name: LogsEvent.ChecklistClose,
      extra: JSON.stringify({ squad: squad.id }),
    });
    setChecklistVisible(false);
  };

  return (
    <InteractivePopup
      isDrawerOnMobile
      drawerProps={{
        className: { drawer: 'pb-4', close: 'px-4' },
        displayCloseButton: true,
      }}
      position={InteractivePopupPosition.RightEnd}
      className="flex w-full max-w-[21.5rem] justify-center rounded-none"
      onClose={onRequestClose}
    >
      <ChecklistCard
        title={
          isDone ? 'Good job! you nailed it. 🥳' : 'Get started with squads'
        }
        description={`${totalStepsCount} simple steps to Squad greatness!`}
        steps={steps}
        className="max-w-full border-0"
      />
    </InteractivePopup>
  );
};

export default SquadChecklistCard;
