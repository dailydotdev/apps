import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Button, ButtonProps, ButtonVariant } from '../buttons/Button';

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
      <p className="text-text-tertiary typo-callout">{text}</p>
      <Button variant={ButtonVariant.Primary} {...buttonProps}>
        {cta}
      </Button>
      {children}
    </div>
  );
}
