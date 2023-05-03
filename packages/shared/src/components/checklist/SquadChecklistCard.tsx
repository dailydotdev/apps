import React, { ReactElement } from 'react';
import { ChecklistCard } from './ChecklistCard';
import { useSquadChecklistSteps } from '../../hooks/useSquadChecklistSteps';
import { Squad } from '../../graphql/sources';
import usePersistentContext from '../../hooks/usePersistentContext';
import { SQUAD_CHECKLIST_VISIBLE_KEY } from '../../lib/checklist';

const SquadChecklistCard = ({ squad }: { squad: Squad }): ReactElement => {
  const { steps } = useSquadChecklistSteps({ squad });
  const [isChecklistVisible, setChecklistVisible] = usePersistentContext(
    SQUAD_CHECKLIST_VISIBLE_KEY,
    false,
  );

  if (!isChecklistVisible) {
    return null;
  }

  return (
    <ChecklistCard
      className="fixed right-5 bottom-5 z-3"
      title="Squads v5"
      description="Use all of the new features"
      steps={steps}
      onRequestClose={() => {
        setChecklistVisible(false);
      }}
    />
  );
};

export { SquadChecklistCard };
