import React, { HTMLAttributes, ReactElement } from 'react';
import classNames from 'classnames';
import { Button } from '../buttons/Button';
import classed from '../../lib/classed';

interface SocialShareIconProps extends HTMLAttributes<HTMLButtonElement> {
  href?: string;
  icon: ReactElement;
  label: string;
  iconBg?: string;
  pressed?: boolean;
}

export const ShareText = classed(
  'span',
  'typo-caption2 text-theme-label-tertiary font-normal',
);

export const SocialShareIcon = ({
  href,
  icon,
  className,
  onClick,
  label,
  iconBg,
  pressed,
}: SocialShareIconProps): ReactElement => {
  const testId = `social-share-${label.replace(/\s+/g, '')}`;

  return (
    <Button
      tag={href ? 'a' : 'button'}
      href={href}
      onClick={onClick}
      target="_blank"
      rel="noopener"
      className={classNames(className, 'reset flex-col w-[62px] border-0')}
      icon={
        <div
          className={classNames(
            iconBg,
            'flex justify-center items-center w-12 h-12 rounded-[14px] mb-2',
          )}
        >
          {icon}
        </div>
      }
      data-testid={testId}
      pressed={pressed}
    >
      <ShareText>{label}</ShareText>
    </Button>
  );
};
