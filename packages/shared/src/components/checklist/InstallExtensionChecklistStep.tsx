import React, { ReactElement } from 'react';

import BrowsersIcon from '../../../icons/browsers.svg';
import { ActionType } from '../../graphql/actions';
import { useActions } from '../../hooks/useActions';
import { ChecklistStepProps } from '../../lib/checklist';
import { downloadBrowserExtension } from '../../lib/constants';
import { Button, ButtonVariant } from '../buttons/Button';
import { FlexCentered } from '../utilities';
import { ChecklistStep } from './ChecklistStep';

const InstallExtensionChecklistStep = (
  props: ChecklistStepProps,
): ReactElement => {
  const { completeAction } = useActions();

  return (
    <ChecklistStep {...props}>
      <Button
        variant={ButtonVariant.Primary}
        tag="a"
        href={downloadBrowserExtension}
        onClick={() => {
          completeAction(ActionType.BrowserExtension);
        }}
        target="_blank"
      >
        <FlexCentered className="gap-2">
          <BrowsersIcon
            width="50px"
            height="23px"
            className="text-text-primary"
          />
          Add to browser - it&apos;s free!
        </FlexCentered>
      </Button>
    </ChecklistStep>
  );
};

export { InstallExtensionChecklistStep };
