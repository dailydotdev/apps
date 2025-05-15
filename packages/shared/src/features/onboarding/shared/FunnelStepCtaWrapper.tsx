import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ButtonProps } from '../../../components/buttons/Button';
import {
  Button,
  ButtonVariant,
  ButtonSize,
} from '../../../components/buttons/Button';
import { FunnelTargetId } from '../types/funnelEvents';

export type FunnelStepCtaWrapperProps = ButtonProps<'button'> & {
  cta?: {
    label?: string;
  };
  containerClassName?: string;
  skip?: ButtonProps<'button'> & {
    cta?: string;
  };
};

export function FunnelStepCtaWrapper({
  children,
  className,
  cta,
  skip,
  containerClassName,
  ...props
}: FunnelStepCtaWrapperProps): ReactElement {
  return (
    <div className="relative flex flex-1 flex-col gap-4">
      <div className={classNames('flex-1', containerClassName)}>{children}</div>
      <div className="sticky bottom-2 m-4">
        <Button
          className={classNames(className, 'w-full')}
          data-funnel-track={FunnelTargetId.StepCta}
          size={ButtonSize.XLarge}
          type="button"
          variant={ButtonVariant.Primary}
          {...props}
        >
          {cta?.label ?? 'Next'}
        </Button>
        {skip && (
          <Button
            data-funnel-track={FunnelTargetId.StepCta}
            variant={ButtonVariant.Tertiary}
            type="button"
            {...props}
          >
            {skip?.cta ?? 'Skip'}
          </Button>
        )}
      </div>
    </div>
  );
}
