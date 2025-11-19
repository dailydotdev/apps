import React from 'react';
import type { ReactElement } from 'react';
import { FlexRow } from '../../../components/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';

export const StepNavigation = ({
  onBack,
  onNext,
  backLabel = 'Back',
  nextLabel = 'Next',
  nextDisabled = false,
  nextLoading = false,
}: {
  onBack: () => void;
  onNext: () => void;
  backLabel?: string;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
}): ReactElement => {
  return (
    <FlexRow className="justify-between">
      <Button
        size={ButtonSize.Large}
        variant={ButtonVariant.Tertiary}
        className="hidden laptop:flex"
        onClick={onBack}
      >
        {backLabel}
      </Button>
      <Button
        size={ButtonSize.Large}
        variant={ButtonVariant.Primary}
        className="w-full laptop:w-auto"
        onClick={onNext}
        disabled={nextDisabled}
        loading={nextLoading}
      >
        {nextLabel}
      </Button>
    </FlexRow>
  );
};
