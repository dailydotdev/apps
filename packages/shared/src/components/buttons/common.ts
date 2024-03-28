import React from 'react';
import classNames from 'classnames';

import { ColorName as ButtonColor } from '../../styles/colors';
import { IconProps, IconSize } from '../Icon';

export enum ButtonSize {
  XLarge = 'xlarge', // only used for iconOnly buttons
  Large = 'large',
  Medium = 'medium',
  Small = 'small',
  XSmall = 'xsmall',
}

export enum ButtonVariant {
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tertiary',
  Float = 'tertiaryFloat',
  Subtle = 'subtle',
  Option = 'option',
}

export enum ButtonIconPosition {
  Left = 'left',
  Right = 'right',
  Top = 'top',
}

export const SizeToClassName: Record<ButtonSize, string> = {
  [ButtonSize.XLarge]: 'border-none',
  [ButtonSize.Large]: 'h-12 px-6 rounded-14',
  [ButtonSize.Medium]: 'h-10 px-5 rounded-12',
  [ButtonSize.Small]: 'h-8 px-3 rounded-10',
  [ButtonSize.XSmall]: 'h-6 px-2 rounded-8',
};

export const IconOnlySizeToClassName: Record<ButtonSize, string> = {
  [ButtonSize.XLarge]: 'h-16 w-16 p-0 rounded-22',
  [ButtonSize.Large]: 'h-12 w-12 p-0 rounded-14',
  [ButtonSize.Medium]: 'h-10 w-10 p-0 rounded-12',
  [ButtonSize.Small]: 'h-8 w-8 p-0 rounded-10',
  [ButtonSize.XSmall]: 'h-6 w-6 p-0 rounded-8',
};

export const VariantToClassName: Record<ButtonVariant, string> = {
  [ButtonVariant.Primary]: 'btn-primary',
  [ButtonVariant.Secondary]: 'btn-secondary',
  [ButtonVariant.Tertiary]: 'btn-tertiary',
  [ButtonVariant.Float]: 'btn-tertiaryFloat',
  [ButtonVariant.Subtle]: 'btn-subtle',
  [ButtonVariant.Option]: 'btn-option gap-1',
};

export const VariantColorToClassName: Record<
  ButtonVariant,
  Record<ButtonColor, string>
> = {
  [ButtonVariant.Primary]: {
    [ButtonColor.Avocado]: 'btn-primary-avocado',
    [ButtonColor.Bacon]: 'btn-primary-bacon',
    [ButtonColor.BlueCheese]: 'btn-primary-blueCheese',
    [ButtonColor.Bun]: 'btn-primary-bun',
    [ButtonColor.Burger]: 'btn-primary-burger',
    [ButtonColor.Cabbage]: 'btn-primary-cabbage',
    [ButtonColor.Cheese]: 'btn-primary-cheese',
    [ButtonColor.Facebook]: 'btn-primary-facebook',
    [ButtonColor.LinkedIn]: 'btn-primary-linkedin',
    [ButtonColor.Ketchup]: 'btn-primary-ketchup',
    [ButtonColor.Lettuce]: 'btn-primary-lettuce',
    [ButtonColor.Onion]: 'btn-primary-onion',
    [ButtonColor.Pepper]: 'btn-primary-pepper',
    [ButtonColor.Salt]: 'btn-primary-salt',
    [ButtonColor.Reddit]: 'btn-primary-reddit',
    [ButtonColor.Telegram]: 'btn-primary-telegram',
    [ButtonColor.Twitter]: 'btn-primary-twitter',
    [ButtonColor.Water]: 'btn-primary-water',
    [ButtonColor.WhatsApp]: 'btn-primary-whatsapp',
  },
  [ButtonVariant.Secondary]: {
    [ButtonColor.Avocado]: 'btn-secondary-avocado',
    [ButtonColor.Bacon]: 'btn-secondary-bacon',
    [ButtonColor.BlueCheese]: 'btn-secondary-blueCheese',
    [ButtonColor.Bun]: 'btn-secondary-bun',
    [ButtonColor.Burger]: 'btn-secondary-burger',
    [ButtonColor.Cabbage]: 'btn-secondary-cabbage',
    [ButtonColor.Cheese]: 'btn-secondary-cheese',
    [ButtonColor.Facebook]: 'btn-secondary-facebook',
    [ButtonColor.Ketchup]: 'btn-secondary-ketchup',
    [ButtonColor.Lettuce]: 'btn-secondary-lettuce',
    [ButtonColor.LinkedIn]: 'btn-secondary-linkedin',
    [ButtonColor.Onion]: 'btn-secondary-onion',
    [ButtonColor.Pepper]: 'btn-secondary-pepper',
    [ButtonColor.Salt]: 'btn-secondary-salt',
    [ButtonColor.Reddit]: 'btn-secondary-reddit',
    [ButtonColor.Telegram]: 'btn-secondary-telegram',
    [ButtonColor.Twitter]: 'btn-secondary-twitter',
    [ButtonColor.Water]: 'btn-secondary-water',
    [ButtonColor.WhatsApp]: 'btn-secondary-whatsapp',
  },
  [ButtonVariant.Tertiary]: {
    [ButtonColor.Avocado]: 'btn-tertiary-avocado',
    [ButtonColor.Bacon]: 'btn-tertiary-bacon',
    [ButtonColor.BlueCheese]: 'btn-tertiary-blueCheese',
    [ButtonColor.Bun]: 'btn-tertiary-bun',
    [ButtonColor.Burger]: 'btn-tertiary-burger',
    [ButtonColor.Cabbage]: 'btn-tertiary-cabbage',
    [ButtonColor.Cheese]: 'btn-tertiary-cheese',
    [ButtonColor.Facebook]: 'btn-tertiary-facebook',
    [ButtonColor.Ketchup]: 'btn-tertiary-ketchup',
    [ButtonColor.LinkedIn]: 'btn-tertiary-linkedin',
    [ButtonColor.Lettuce]: 'btn-tertiary-lettuce',
    [ButtonColor.Onion]: 'btn-tertiary-onion',
    [ButtonColor.Pepper]: 'btn-tertiary-pepper',
    [ButtonColor.Salt]: 'btn-tertiary-salt',
    [ButtonColor.Reddit]: 'btn-tertiary-reddit',
    [ButtonColor.Telegram]: 'btn-tertiary-telegram',
    [ButtonColor.Twitter]: 'btn-tertiary-twitter',
    [ButtonColor.Water]: 'btn-tertiary-water',
    [ButtonColor.WhatsApp]: 'btn-tertiary-whatsapp',
  },
  [ButtonVariant.Float]: {
    [ButtonColor.Avocado]: 'btn-tertiaryFloat-avocado',
    [ButtonColor.Bacon]: 'btn-tertiaryFloat-bacon',
    [ButtonColor.BlueCheese]: 'btn-tertiaryFloat-blueCheese',
    [ButtonColor.Bun]: 'btn-tertiaryFloat-bun',
    [ButtonColor.Burger]: 'btn-tertiaryFloat-burger',
    [ButtonColor.Cabbage]: 'btn-tertiaryFloat-cabbage',
    [ButtonColor.Cheese]: 'btn-tertiaryFloat-cheese',
    [ButtonColor.Facebook]: 'btn-tertiaryFloat-facebook',
    [ButtonColor.Ketchup]: 'btn-tertiaryFloat-ketchup',
    [ButtonColor.LinkedIn]: 'btn-tertiaryFloat-linkedin',
    [ButtonColor.Lettuce]: 'btn-tertiaryFloat-lettuce',
    [ButtonColor.Onion]: 'btn-tertiaryFloat-onion',
    [ButtonColor.Pepper]: 'btn-tertiaryFloat-pepper',
    [ButtonColor.Salt]: 'btn-tertiaryFloat-salt',
    [ButtonColor.Reddit]: 'btn-tertiaryFloat-reddit',
    [ButtonColor.Telegram]: 'btn-tertiaryFloat-telegram',
    [ButtonColor.Twitter]: 'btn-tertiaryFloat-twitter',
    [ButtonColor.Water]: 'btn-tertiaryFloat-water',
    [ButtonColor.WhatsApp]: 'btn-tertiaryFloat-whatsapp',
  },
  [ButtonVariant.Subtle]: {
    [ButtonColor.Avocado]: 'btn-subtle-avocado',
    [ButtonColor.Bacon]: 'btn-subtle-bacon',
    [ButtonColor.BlueCheese]: 'btn-subtle-blueCheese',
    [ButtonColor.Bun]: 'btn-subtle-bun',
    [ButtonColor.Burger]: 'btn-subtle-burger',
    [ButtonColor.Cabbage]: 'btn-subtle-cabbage',
    [ButtonColor.Cheese]: 'btn-subtle-cheese',
    [ButtonColor.Facebook]: 'btn-subtle-facebook',
    [ButtonColor.Ketchup]: 'btn-subtle-ketchup',
    [ButtonColor.LinkedIn]: 'btn-subtle-linkedin',
    [ButtonColor.Lettuce]: 'btn-subtle-lettuce',
    [ButtonColor.Onion]: 'btn-subtle-onion',
    [ButtonColor.Pepper]: 'btn-subtle-pepper',
    [ButtonColor.Salt]: 'btn-subtle-salt',
    [ButtonColor.Reddit]: 'btn-subtle-reddit',
    [ButtonColor.Telegram]: 'btn-subtle-telegram',
    [ButtonColor.Twitter]: 'btn-subtle-twitter',
    [ButtonColor.Water]: 'btn-subtle-water',
    [ButtonColor.WhatsApp]: 'btn-subtle-whatsapp',
  },
  [ButtonVariant.Option]: {
    [ButtonColor.Avocado]: 'btn-option-avocado',
    [ButtonColor.Bacon]: 'btn-option-bacon',
    [ButtonColor.BlueCheese]: 'btn-option-blueCheese',
    [ButtonColor.Bun]: 'btn-option-bun',
    [ButtonColor.Burger]: 'btn-option-burger',
    [ButtonColor.Cabbage]: 'btn-option-cabbage',
    [ButtonColor.Cheese]: 'btn-option-cheese',
    [ButtonColor.Facebook]: 'btn-option-facebook',
    [ButtonColor.Ketchup]: 'btn-option-ketchup',
    [ButtonColor.LinkedIn]: 'btn-option-linkedin',
    [ButtonColor.Lettuce]: 'btn-option-lettuce',
    [ButtonColor.Onion]: 'btn-option-onion',
    [ButtonColor.Pepper]: 'btn-option-pepper',
    [ButtonColor.Salt]: 'btn-option-salt',
    [ButtonColor.Reddit]: 'btn-option-reddit',
    [ButtonColor.Telegram]: 'btn-option-telegram',
    [ButtonColor.Twitter]: 'btn-option-twitter',
    [ButtonColor.Water]: 'btn-option-water',
    [ButtonColor.WhatsApp]: 'btn-option-whatsapp',
  },
};

const buttonSizeToIconSize: Record<ButtonSize, IconSize> = {
  [ButtonSize.XLarge]: IconSize.XLarge,
  [ButtonSize.Large]: IconSize.Large,
  [ButtonSize.Medium]: IconSize.Medium,
  [ButtonSize.Small]: IconSize.Small,
  [ButtonSize.XSmall]: IconSize.XSmall,
};

export const useGetIconWithSize = (
  size: ButtonSize,
  iconOnly: boolean,
  iconPosition: ButtonIconPosition,
): ((icon: React.ReactElement<IconProps>) => React.ReactElement<IconProps>) => {
  return (icon: React.ReactElement<IconProps>) =>
    React.cloneElement(icon, {
      size: icon.props?.size ?? buttonSizeToIconSize[size],
      className: classNames(
        icon.props.className,
        !iconOnly && '!h-6 !w-6 text-base',
        !iconOnly && iconPosition === ButtonIconPosition.Left && '-ml-2 mr-1',
        !iconOnly && iconPosition === ButtonIconPosition.Right && '-mr-2 ml-1',
      ),
    });
};
