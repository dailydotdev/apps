import React, { HTMLAttributes, ReactElement, useRef } from 'react';
import classNames from 'classnames';
import { Button, ButtonProps, ButtonSize } from '../buttons/Button';
import classed from '../../lib/classed';

interface SocialShareIconProps extends HTMLAttributes<HTMLButtonElement> {
  pressed?: boolean;
  href?: string;
  icon: ReactElement;
  label: string;
  size?: ButtonSize;
  disabled?: boolean;
}

export const ShareText = classed(
  'span',
  'typo-caption2 text-theme-label-tertiary cursor-pointer',
);

export const SocialShareIcon = ({
  pressed,
  href,
  icon,
  className,
  onClick,
  label,
  disabled,
  size = ButtonSize.Large,
}: SocialShareIconProps): ReactElement => {
  const button = useRef<HTMLButtonElement>();
  const buttonProps = href
    ? ({
        href,
        rel: 'noopener',
        target: 'blank',
        tag: 'a',
        disabled,
      } as ButtonProps<'a'>)
    : ({ onClick, disabled } as ButtonProps<'button'>);

  return (
    <div className="flex flex-col items-center w-16">
      <Button
        {...buttonProps}
        data-testid={`social-share-${label}`}
        buttonSize={size}
        className={classNames(className, 'text-white')}
        iconOnly
        icon={icon}
        pressed={pressed}
        ref={button}
      />
      <ShareText className="mt-1.5" onClick={() => button?.current?.click()}>
        {label}
      </ShareText>
    </div>
  );
};
