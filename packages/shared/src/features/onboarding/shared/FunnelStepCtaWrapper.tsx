import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ButtonProps } from '../../../components/buttons/Button';
import { Button, ButtonVariant } from '../../../components/buttons/Button';

export type FunnelStepCtaWrapperProps = ButtonProps<'button'> & {
  cta?: {
    label?: string;
  };
  containerClassName?: string;
};

export function FunnelStepCtaWrapper({
  children,
  cta,
  containerClassName,
  ...props
}: FunnelStepCtaWrapperProps): ReactElement {
  return (
    <div className="relative flex min-h-dvh flex-col gap-4">
      <div className={classNames('flex-1', containerClassName)}>{children}</div>
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
