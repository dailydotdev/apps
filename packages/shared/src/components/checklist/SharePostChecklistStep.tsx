import React, { ReactElement } from 'react';
import { ChecklistStepProps } from '../../lib/checklist';
import { Button } from '../buttons/Button';
import { ChecklistStep } from './ChecklistStep';
import { FlexRow } from '../utilities';

const SharePostChecklistStep = (props: ChecklistStepProps): ReactElement => {
  // TODO WT-1293-checklist-components add business logic

  return (
    <ChecklistStep {...props}>
      <FlexRow className="gap-4">
        <Button className="btn-secondary">Create a post</Button>
        <Button className="btn-primary">Explore</Button>
      </FlexRow>
    </ChecklistStep>
  );
};

export { SharePostChecklistStep };
