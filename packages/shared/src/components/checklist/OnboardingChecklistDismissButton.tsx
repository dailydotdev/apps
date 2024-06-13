import React, { ReactElement } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { ChecklistViewState } from '../../lib/checklist';
import { useOnboardingChecklist } from '../../hooks';

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
