import React, { ReactElement } from 'react';
import { ChecklistCard } from './ChecklistCard';
import { useSquadChecklistSteps } from '../../hooks/useSquadChecklistSteps';
import { Squad } from '../../graphql/sources';

const SquadChecklistCard = ({ squad }: { squad: Squad }): ReactElement => {
  const { steps } = useSquadChecklistSteps({ squad });

  return (
    <ChecklistCard
      className="fixed right-5 bottom-5 z-3"
      title="Squads v5"
      description="Use all of the new features"
      steps={steps}
      onRequestClose={() => {
        // TODO WT-1293-checklist-components hide checklist
      }}
    />
  );
};

export { SquadChecklistCard };
