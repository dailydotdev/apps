import React, { HTMLAttributes, ReactElement } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize } from '../buttons/Button';
import classed from '../../lib/classed';

interface SocialShareIconProps extends HTMLAttributes<HTMLButtonElement> {
  href: string;
  icon: ReactElement;
  label: string;
}

export const ShareText = classed(
  'span',
  'typo-caption2 text-theme-label-tertiary',
);

export const SocialShareIcon = ({
  href,
  icon,
  className,
  onClick,
  label,
}: SocialShareIconProps): ReactElement => {
  return (
    <div className="flex flex-col items-center">
      <Button
        tag="a"
        data-testid={`social-share-${label}`}
        buttonSize={ButtonSize.Large}
        href={href}
        onClick={onClick}
        target="_blank"
        rel="noopener"
        className={classNames(className, 'mb-2 text-white')}
        iconOnly
        icon={icon}
      />
      <ShareText>{label}</ShareText>
    </div>
  );
};
