import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import classNames from 'classnames';
import type { ButtonV2Props } from '../buttons/ButtonV2';
import { ButtonV2, ButtonSize } from '../buttons/ButtonV2';
import classed from '../../lib/classed';

type SocialShareButtonProps = ButtonV2Props<'a'> & {
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
    } as ButtonV2Props<'a'>);

  return (
    <div className="group flex w-16 flex-col items-center">
      <ButtonV2
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
        onClick={() => button?.current?.click()}
      >
        {label}
      </ShareText>
    </div>
  );
};
