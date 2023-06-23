import React, { HTMLAttributes, ReactElement, useRef } from 'react';
import classNames from 'classnames';
import { Button, ButtonProps, ButtonSize } from '../buttons/Button';
import classed from '../../lib/classed';

interface SocialShareIconProps extends HTMLAttributes<HTMLButtonElement> {
  pressed?: boolean;
  href?: string;
  icon: ReactElement;
  label: string;
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
}: SocialShareIconProps): ReactElement => {
  const button = useRef<HTMLButtonElement>();
  const buttonProps = href
    ? ({ href, rel: 'noopener', target: 'blank', tag: 'a' } as ButtonProps<'a'>)
    : ({ onClick } as ButtonProps<'button'>);

  return (
    <div className="flex flex-col items-center w-16">
      <Button
        {...buttonProps}
        data-testid={`social-share-${label}`}
        buttonSize={ButtonSize.Large}
        className={classNames(className, 'mb-2 text-white')}
        iconOnly
        icon={icon}
        pressed={pressed}
        ref={button}
      />
      <ShareText onClick={() => button?.current?.click()}>{label}</ShareText>
    </div>
  );
};
