import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Button, ButtonProps, ButtonVariant } from '../buttons/ButtonV2';

export interface MyProfileEmptyScreenProps {
  text: string;
  cta: string;
  buttonProps?: ButtonProps<'a' | 'button'>;
  className?: string;
  children?: ReactElement;
}

export function MyProfileEmptyScreen({
  text,
  cta,
  className,
  children,
  buttonProps,
}: MyProfileEmptyScreenProps): ReactElement {
  return (
    <div className={classNames('flex flex-col gap-6', className)}>
      <p className="typo-callout text-theme-label-tertiary">{text}</p>
      <Button variant={ButtonVariant.Primary} {...buttonProps}>
        {cta}
      </Button>
      {children}
    </div>
  );
}
