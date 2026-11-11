import type { ReactElement } from 'react';
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../dropdown/DropdownMenu';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { ArrowIcon } from '../../icons';
import { IconSize } from '../../Icon';
import type { CreatorPerformancePeriod } from '../../../graphql/creatorAnalytics';
import { periodLabel, periodOptions } from './common';

interface CreatorPeriodSelectProps {
  period: CreatorPerformancePeriod;
  onChange: (period: CreatorPerformancePeriod) => void;
  disabled?: boolean;
}

export const CreatorPeriodSelect = ({
  period,
  onChange,
  disabled,
}: CreatorPeriodSelectProps): ReactElement => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild disabled={disabled}>
      <Button
        size={ButtonSize.Small}
        variant={ButtonVariant.Float}
        disabled={disabled}
        aria-label={`Period: ${periodLabel[period]}. Change period.`}
        icon={<ArrowIcon size={IconSize.XSmall} className="rotate-180" />}
        iconPosition={ButtonIconPosition.Right}
      >
        {periodLabel[period]}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {periodOptions.map((option) => (
        <DropdownMenuItem
          key={option}
          onClick={() => onChange(option)}
          // Radix exposes the checked state to assistive tech; the visual
          // affordance is the trigger label, which already names the choice.
          aria-current={option === period}
        >
          {periodLabel[option]}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);
