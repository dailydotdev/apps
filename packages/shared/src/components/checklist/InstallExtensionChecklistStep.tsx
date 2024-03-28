import React, { ReactElement } from 'react';
import { ChecklistStepProps } from '../../lib/checklist';
import { ChecklistStep } from './ChecklistStep';
import { Button, ButtonVariant } from '../buttons/Button';
import BrowsersIcon from '../../../icons/browsers.svg';
import { FlexCentered } from '../utilities';
import { useActions } from '../../hooks/useActions';
import { ActionType } from '../../graphql/actions';
import { downloadBrowserExtension } from '../../lib/constants';

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
