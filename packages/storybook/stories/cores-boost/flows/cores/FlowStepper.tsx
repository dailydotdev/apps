import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

// Storybook-only control for the walkthroughs, not part of the product UI.
// The screens' own buttons move the flow forward; this jumps between steps.

export const FlowStepper = ({
  steps,
  index,
  onChange,
}: {
  steps: string[];
  index: number;
  onChange: (index: number) => void;
}): ReactElement => (
  <nav
    aria-label="Walkthrough steps"
    className="fixed bottom-4 left-4 z-max flex items-center gap-1 rounded-16 border border-border-subtlest-secondary bg-background-popover p-1 shadow-2"
  >
    {steps.map((step, stepIndex) => (
      <Button
        key={step}
        size={ButtonSize.XSmall}
        variant={
          stepIndex === index ? ButtonVariant.Primary : ButtonVariant.Tertiary
        }
        onClick={() => onChange(stepIndex)}
      >
        {stepIndex + 1}. {step}
      </Button>
    ))}
  </nav>
);
