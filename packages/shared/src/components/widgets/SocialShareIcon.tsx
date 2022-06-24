import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Button } from '../buttons/Button';

interface SocialShareIconProps {
  href: string;
  icon: ReactElement;
  className: string;
  label: string;
}
export const SocialShareIcon = ({
  href,
  icon,
  className,
  label,
}: SocialShareIconProps): ReactElement => {
  return (
    <div className="flex flex-col items-center mr-4 mb-4">
      <Button
        tag="a"
        data-testid={`social-share-${label}`}
        buttonSize="large"
        href={href}
        target="_blank"
        rel="noopener"
        className={classNames(className, 'mb-2')}
        iconOnly
        icon={icon}
      />
      <span className="typo-caption2 text-theme-label-tertiary">{label}</span>
    </div>
  );
};
