import React, { HTMLAttributes, ReactElement } from 'react';
import classNames from 'classnames';
import { Button } from '../buttons/Button';

interface SocialShareIconProps extends HTMLAttributes<HTMLButtonElement> {
  href: string;
  icon: ReactElement;
  label: string;
}

export const SocialShareIcon = ({
  href,
  icon,
  className,
  onClick,
  label,
}: SocialShareIconProps): ReactElement => {
  return (
    <div className="flex flex-col items-center mr-4 mb-4">
      <Button
        tag="a"
        data-testid={`social-share-${label}`}
        buttonSize="large"
        href={href}
        onClick={onClick}
        target="_blank"
        rel="noopener"
        className={classNames(className, 'mb-2 text-white')}
        iconOnly
        icon={icon}
      />
      <span className="typo-caption2 text-theme-label-tertiary">{label}</span>
    </div>
  );
};
