import type { ReactElement } from 'react';
import React from 'react';
import type { ButtonProps } from '../../../components/buttons/Button';
import { Button, ButtonVariant } from '../../../components/buttons/Button';

export function FunnelStepCtaWrapper({
  children,
  ...props
}: ButtonProps<'button'>): ReactElement {
  return (
    <div className="relative flex flex-col gap-4">
      {children}
      <div className="sticky bottom-2">
        <Button
          type="button"
          className="w-full"
          variant={ButtonVariant.Primary}
          {...props}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
