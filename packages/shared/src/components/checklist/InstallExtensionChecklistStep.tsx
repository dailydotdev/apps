import React, { ReactElement } from 'react';
import { ChecklistStepProps } from '../../lib/checklist';
import { ChecklistStep } from './ChecklistStep';
import { Button } from '../buttons/Button';
import BrowsersIcon from '../icons/Browsers';
import { FlexCentered } from '../utilities';

const InstallExtensionChecklistStep = (
  props: ChecklistStepProps,
): ReactElement => {
  // TODO WT-1293-checklist-components add business logic

  return (
    <ChecklistStep {...props}>
      <Button className="btn-primary">
        <FlexCentered className="gap-2">
          <BrowsersIcon className="text-theme-label-primary !w-12" /> Add to
          browser - it&apos;s free!
        </FlexCentered>
      </Button>
    </ChecklistStep>
  );
};

export { InstallExtensionChecklistStep };
