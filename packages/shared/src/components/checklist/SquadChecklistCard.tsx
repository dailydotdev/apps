import React, { ReactElement, useContext, useEffect } from 'react';
import { ChecklistCard } from './ChecklistCard';
import { useSquadChecklist } from '../../hooks/useSquadChecklist';
import { Squad } from '../../graphql/sources';
import InteractivePopup, {
  InteractivePopupPosition,
} from '../tooltips/InteractivePopup';
import { useChecklist } from '../../hooks/useChecklist';
import LogContext from '../../contexts/LogContext';
import { LogEvent, TargetId, TargetType } from '../../lib/log';

const SquadChecklistCard = ({ squad }: { squad: Squad }): ReactElement => {
  const { steps, isChecklistVisible, setChecklistVisible, isChecklistReady } =
    useSquadChecklist({
      squad,
    });
  const { isDone } = useChecklist({ steps });
  const { logEvent } = useContext(LogContext);
  const totalStepsCount = steps.length;

  useEffect(() => {
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.OnboardingChecklist,
      target_id: TargetId.Squad,
      extra: JSON.stringify({ squad: squad.id }),
    });
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isChecklistVisible || !isChecklistReady || !squad.currentMember) {
    return null;
  }

  const onRequestClose = () => {
    logEvent({
      event_name: LogEvent.ChecklistClose,
      target_id: TargetId.Squad,
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
      className="flex w-full max-w-[21.5rem] justify-center rounded-none !bg-transparent"
      onClose={onRequestClose}
    >
      <ChecklistCard
        title={
          isDone ? 'Good job! you nailed it. 🥳' : 'Get started with squads'
        }
        content={
          <p className="text-white typo-callout">{`${totalStepsCount} simple steps to Squad greatness!`}</p>
        }
        steps={steps}
        className="max-w-full border-0"
      />
    </InteractivePopup>
  );
};

export default SquadChecklistCard;
