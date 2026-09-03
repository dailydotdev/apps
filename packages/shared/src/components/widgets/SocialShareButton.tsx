import type { ReactElement } from 'react';
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

const sizeToText: Partial<Record<ButtonSize, string>> = {
  [ButtonSize.Large]: 'typo-caption2',
  [ButtonSize.Medium]: 'typo-caption1',
};

/** Narrower at Medium so a grid of these can close up. */
const sizeToWidth: Partial<Record<ButtonSize, string>> = {
  [ButtonSize.Large]: 'w-16',
  [ButtonSize.Medium]: 'w-14',
};

export const SocialShareButton = ({
  href,
  icon,
  label,
  size = ButtonSize.Large,
  ...props
}: SocialShareButtonProps): ReactElement => {
  const button = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
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
      className={classNames(
        'group flex flex-col items-center',
        sizeToWidth[size] ?? 'w-16',
      )}
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
          'mt-1.5 max-w-full overflow-hidden overflow-ellipsis text-center transition-colors hover:text-text-primary group-hover:text-text-primary',
          sizeToText[size],
        )}
        onClick={() => button?.current?.click()}
      >
        {label}
      </ShareText>
    </div>
  );
};
