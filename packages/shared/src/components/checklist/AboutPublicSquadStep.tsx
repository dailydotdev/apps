import React, { ReactElement } from 'react';
import { ChecklistStepProps } from '../../lib/checklist';
import { ChecklistStep } from './ChecklistStep';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ActionType } from '../../graphql/actions';
import { useActions } from '../../hooks';
import { squadsPublicGuide } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';

export const AboutPublicSquadStep = ({
  ...props
}: ChecklistStepProps): ReactElement => {
  const { completeAction } = useActions();

  const onDismiss = () => {
    completeAction(ActionType.LearnAboutPublicSquad);
  };

  return (
    <ChecklistStep {...props}>
      <Button
        href={squadsPublicGuide}
        onClick={onDismiss}
        rel={anchorDefaultRel}
        size={ButtonSize.Small}
        tag="a"
        target="_blank"
        variant={ButtonVariant.Primary}
      >
        Learn more
      </Button>
    </ChecklistStep>
  );
};
