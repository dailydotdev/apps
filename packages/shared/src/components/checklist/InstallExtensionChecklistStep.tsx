import React, { ReactElement } from 'react';
import { ChecklistStepProps } from '../../lib/checklist';
import { ChecklistStep } from './ChecklistStep';
import { Button } from '../buttons/Button';

const InstallExtensionChecklistStep = (
  props: ChecklistStepProps,
): ReactElement => {
  // TODO WT-1293-checklist-components add browsers icon

  return (
    <ChecklistStep {...props}>
      <Button className="btn-primary">Add to browser - it&apos;s free! </Button>
    </ChecklistStep>
  );
};

export { InstallExtensionChecklistStep };
