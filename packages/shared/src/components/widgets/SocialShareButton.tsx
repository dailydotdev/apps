import type { MouseEvent, ReactElement } from 'react';
import React, { useRef } from 'react';
import classNames from 'classnames';
import type { ButtonProps } from '../buttons/Button';
import { Button, ButtonSize } from '../buttons/Button';
import classed from '../../lib/classed';

type SocialShareButtonProps = ButtonProps<'a'> & {
  icon: ReactElement;
  label: string;
};

export const ShareText = classed('span', 'text-text-tertiary cursor-pointer');

const sizeToText = {
  [ButtonSize.Large]: 'typo-caption2',
  [ButtonSize.Medium]: 'typo-caption1',
};

export const SocialShareButton = ({
  href,
  icon,
  label,
  size = ButtonSize.Large,
  ...props
}: SocialShareButtonProps): ReactElement => {
  const button = useRef<HTMLButtonElement>();
  const onWrapperClick = (event: MouseEvent<HTMLDivElement>): void => {
    if ((event.target as HTMLElement).closest('button, a')) {
      return;
    }
    button?.current?.click();
  };
  const onWrapperKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ): void => {
    if ((event.target as HTMLElement).closest('button, a')) {
      return;
    }
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    button?.current?.click();
  };
  const buttonProps =
    href &&
    ({
      href,
      rel: 'noopener',
      target: 'blank',
      tag: 'a',
    } as ButtonProps<'a'>);

  return (
    <div
      className="group flex w-16 cursor-pointer flex-col items-center"
      onClick={onWrapperClick}
      onKeyDown={onWrapperKeyDown}
    >
      <Button
        {...buttonProps}
        {...props}
        data-testid={`social-share-${label}`}
        size={size}
        icon={icon}
        ref={button}
      />
      <ShareText
        className={classNames(
          'mt-1.5 max-w-16 overflow-hidden overflow-ellipsis text-center transition-colors hover:text-text-primary group-hover:text-text-primary',
          sizeToText[size],
        )}
      >
        {label}
      </ShareText>
    </div>
  );
};
