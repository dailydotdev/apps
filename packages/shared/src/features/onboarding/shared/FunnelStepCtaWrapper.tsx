import type { ReactElement } from 'react';
import React from 'react';
import type { ButtonProps } from '../../../components/buttons/Button';
import { Button, ButtonVariant } from '../../../components/buttons/Button';

export type FunnelStepCtaWrapperProps = ButtonProps<'button'> & {
  cta?: {
    label?: string;
  };
};

export function FunnelStepCtaWrapper({
  children,
  cta,
  ...props
}: FunnelStepCtaWrapperProps): ReactElement {
  return (
    <div className="relative flex min-h-dvh flex-col gap-4">
      <div className="flex-1">{children}</div>
      <div className="sticky bottom-2 m-4">
        <Button
          type="button"
          className="w-full"
          variant={ButtonVariant.Primary}
          {...props}
        >
          {cta?.label ?? 'Next'}
        </Button>
      </div>
    </div>
  );
}
