import classNames from 'classnames';
import React, { ReactElement } from 'react';

import { useOnboardingChecklist } from '../../hooks';
import { ChecklistViewState } from '../../lib/checklist';
import {
  Button,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';

export type OnboardingChecklistDismissButtonProps = ButtonProps<'button'>;

export const OnboardingChecklistDismissButton = ({
  className,
  ...rest
}: OnboardingChecklistDismissButtonProps): ReactElement => {
  const { setChecklistView } = useOnboardingChecklist();

  return (
    <Button
      {...rest}
      className={classNames(className, 'border-white text-white')}
      variant={ButtonVariant.Secondary}
      size={ButtonSize.XSmall}
      onClick={() => {
        setChecklistView(ChecklistViewState.Hidden);
      }}
    >
      Dismiss
    </Button>
  );
};
