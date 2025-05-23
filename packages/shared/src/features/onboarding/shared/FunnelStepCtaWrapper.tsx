import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { ButtonProps } from '../../../components/buttons/Button';
import {
  Button,
  ButtonVariant,
  ButtonSize,
  ButtonIconPosition,
} from '../../../components/buttons/Button';
import { FunnelTargetId } from '../types/funnelEvents';
import { MoveToIcon } from '../../../components/icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { sanitizeMessage } from './utils';

export type FunnelStepCtaWrapperProps = ButtonProps<'button'> & {
  cta?: {
    label?: string;
    note?: string;
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
  const note = useMemo(() => {
    if (!cta?.note) {
      return null;
    }

    const sanitized = sanitizeMessage(cta.note);

    return (
      <Typography
        className="text-center"
        type={TypographyType.Title3}
        color={TypographyColor.Primary}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  }, [cta?.note]);

  return (
    <div className="relative flex flex-1 flex-col gap-4">
      <div className={classNames('flex-1', containerClassName)}>{children}</div>
      <div className="sticky bottom-2 m-4 flex flex-col gap-4">
        {note}
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
            icon={<MoveToIcon />}
            iconPosition={ButtonIconPosition.Right}
            {...skip}
          >
            {skip?.cta ?? 'Skip'}
          </Button>
        )}
      </div>
    </div>
  );
}
