import React, { HTMLAttributes, ReactElement } from 'react';
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
  'typo-caption2 text-theme-label-tertiary',
);

export const SocialShareIcon = ({
  pressed,
  href,
  icon,
  className,
  onClick,
  label,
}: SocialShareIconProps): ReactElement => {
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
      />
      <ShareText>{label}</ShareText>
    </div>
  );
};
