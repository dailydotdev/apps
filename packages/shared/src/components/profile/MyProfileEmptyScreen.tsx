import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ButtonProps } from '../buttons/Button';
import { Button, ButtonVariant } from '../buttons/Button';
import { Image } from '../image/Image';

export interface MyProfileEmptyScreenProps {
  text: string;
  cta: string;
  buttonProps?: ButtonProps<'a' | 'button'>;
  className?: string;
  children?: ReactElement;
  image?: string;
  imageAlt?: string;
}

export function MyProfileEmptyScreen({
  text,
  cta,
  className,
  children,
  buttonProps,
  image,
  imageAlt,
}: MyProfileEmptyScreenProps): ReactElement {
  return (
    <div className={classNames('flex flex-col gap-6', className)}>
      {image && (
        <Image
          className="h-40 w-40 object-contain"
          src={image}
          alt={imageAlt}
          loading="lazy"
        />
      )}
      <p className="text-text-tertiary typo-callout">{text}</p>
      <Button variant={ButtonVariant.Primary} {...buttonProps}>
        {cta}
      </Button>
      {children}
    </div>
  );
}
