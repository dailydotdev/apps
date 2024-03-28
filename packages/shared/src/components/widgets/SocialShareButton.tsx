import React, { ReactElement, useRef } from 'react';
import classNames from 'classnames';
import { Button, ButtonProps, ButtonSize } from '../buttons/Button';
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
  const buttonProps =
    href &&
    ({
      href,
      rel: 'noopener',
      target: 'blank',
      tag: 'a',
    } as ButtonProps<'a'>);

  return (
    <div className="flex w-16 flex-col items-center">
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
          'mt-1.5 max-w-16 overflow-hidden overflow-ellipsis text-center',
          sizeToText[size],
        )}
        onClick={() => button?.current?.click()}
      >
        {label}
      </ShareText>
    </div>
  );
};
