import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ButtonV2Props } from '../buttons/ButtonV2';
import { ButtonV2, ButtonVariant } from '../buttons/ButtonV2';

export interface MyProfileEmptyScreenProps {
  text: string;
  cta: string;
  buttonProps?: ButtonV2Props<'a' | 'button'>;
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
      <ButtonV2 variant={ButtonVariant.Primary} {...buttonProps}>
        {cta}
      </ButtonV2>
      {children}
    </div>
  );
}
