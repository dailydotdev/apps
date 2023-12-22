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
  'text-theme-label-tertiary cursor-pointer',
);

const sizeToText = {
  [ButtonSize.Large]: 'typo-caption2',
  [ButtonSize.Medium]: 'typo-caption1',
};

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
    <div className="flex w-16 flex-col items-center">
      <Button
        {...buttonProps}
        data-testid={`social-share-${label}`}
        buttonSize={size}
        className={className}
        iconOnly
        icon={icon}
        pressed={pressed}
        ref={button}
      />
      <ShareText
        className={classNames(
          'mt-1.5 max-w-[4rem] overflow-hidden overflow-ellipsis text-center',
          sizeToText[size],
        )}
        onClick={() => button?.current?.click()}
      >
        {label}
      </ShareText>
    </div>
  );
};
