import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import { IconSize } from '../Icon';
import {
  AllowedTags,
  Button,
  ButtonProps,
  ButtonSize,
} from '../buttons/Button';
import VIcon from '../icons/V';

export type SquadTypeCardProps<ButtonTag extends AllowedTags> = {
  className?: string;
  title: ReactNode;
  description: string;
  isSelected: boolean;
  buttonProps?: { tag?: ButtonTag; text: string } & Omit<
    ButtonProps<ButtonTag>,
    'disabled' | 'size' | 'children'
  >;
};

export const SquadTypeCard = <ButtonTag extends AllowedTags>({
  className,
  title,
  description,
  isSelected,
  buttonProps,
}: SquadTypeCardProps<ButtonTag>): ReactElement => {
  const { text: buttonText = 'Select', ...restButtonProps } = buttonProps || {};

  return (
    <div
      className={classNames(
        'flex flex-col flex-1 p-3 rounded-16 justify-between gap-4 relative',
        isSelected &&
          'bg-gradient-to-r from-theme-bg-overlay-onion-opacity to-theme-bg-overlay-cabbage-opacity border-2 -m-1 border-theme-divider-primary',
        className,
      )}
    >
      <div>
        <h4 className="mb-2 font-bold typo-headline">{title}</h4>
        <p className="typo-footnote">{description}</p>
      </div>
      <Button
        className="btn-secondary"
        buttonSize={ButtonSize.XSmall}
        disabled={isSelected}
        {...restButtonProps}
      >
        {isSelected ? 'Selected' : buttonText}
      </Button>
      {isSelected && (
        <VIcon
          className="absolute top-3 right-3"
          size={IconSize.Medium}
          secondary
        />
      )}
    </div>
  );
};
