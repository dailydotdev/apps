import React, { ReactElement } from 'react';
import { ChecklistStepProps } from '../../lib/checklist';
import { ChecklistStep } from './ChecklistStep';
import { Button } from '../buttons/Button';
import BrowsersIcon from '../../../icons/browsers.svg';
import { FlexCentered } from '../utilities';

const InstallExtensionChecklistStep = (
  props: ChecklistStepProps,
): ReactElement => {
  // TODO WT-1293-checklist-components add business logic

  return (
    <ChecklistStep {...props}>
      <Button className="btn-primary">
        <FlexCentered className="gap-2">
          <BrowsersIcon
            width="50px"
            height="23px"
            className="text-theme-label-primary"
          />
          Add to browser - it&apos;s free!
        </FlexCentered>
      </Button>
    </ChecklistStep>
  );
};

export { InstallExtensionChecklistStep };
