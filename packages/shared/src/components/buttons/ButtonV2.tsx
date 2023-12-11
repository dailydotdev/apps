import React, {
  forwardRef,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  Ref,
} from 'react';
import classNames from 'classnames';
import { IconProps, IconSize } from '../Icon';
import { Loader } from '../Loader';
import { combinedClicks } from '../../lib/click';

import { ColorName as ButtonColor } from '../../styles/colors';

export enum ButtonSize {
  XLarge = 'xlarge', // only used for iconOnly buttons
  Large = 'large',
  Medium = 'medium',
  Small = 'small',
  XSmall = 'xsmall',
}

const buttonSizeToIconSize: Record<ButtonSize, IconSize> = {
  [ButtonSize.XLarge]: IconSize.XLarge,
  [ButtonSize.Large]: IconSize.Large,
  [ButtonSize.Medium]: IconSize.Medium,
  [ButtonSize.Small]: IconSize.Small,
  [ButtonSize.XSmall]: IconSize.XSmall,
};

export type IconType = React.ReactElement<IconProps>;

export { ButtonColor };

export enum ButtonVariant {
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tertiary',
  Float = 'tertiaryFloat',
}

export enum ButtonIconPosition {
  Left = 'left',
  Right = 'right',
}
interface CommonButtonProps {
  size?: ButtonSize;
  loading?: boolean;
  pressed?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  tag?: React.ElementType & AllowedTags;
}

// when color is present, variant is required
type ColorButtonProps =
  | { color: ButtonColor; variant: ButtonVariant }
  | { color?: never; variant?: ButtonVariant };

// when iconPosition is present, icon is required
type IconButtonProps =
  | { iconPosition: ButtonIconPosition; icon: IconType }
  | { iconPosition?: never; icon?: IconType };

type BaseButtonProps = CommonButtonProps & ColorButtonProps & IconButtonProps;

const useGetIconWithSize = (
  size: ButtonSize,
  iconOnly: boolean,
  iconPosition: ButtonIconPosition,
) => {
  return (icon: React.ReactElement<IconProps>) =>
    React.cloneElement(icon, {
      size: icon.props?.size ?? buttonSizeToIconSize[size],
      className: classNames(
        icon.props.className,
        !iconOnly && 'text-base !w-6 !h-6',
        !iconOnly && iconPosition === ButtonIconPosition.Left && '-ml-2 mr-1',
        !iconOnly && iconPosition === ButtonIconPosition.Right && 'ml-1 -mr-2',
        // add margin to social icons
        icon.props.className?.split(' ').includes('socialIcon') && 'mr-3',
      ),
    });
};

export type AllowedTags = keyof Pick<JSX.IntrinsicElements, 'a' | 'button'>;
export type AllowedElements = HTMLButtonElement | HTMLAnchorElement;
export type ButtonElementType<Tag extends AllowedTags> = Tag extends 'a'
  ? HTMLAnchorElement
  : HTMLButtonElement;

export type ButtonProps<T extends AllowedTags> = BaseButtonProps &
  HTMLAttributes<T> &
  JSX.IntrinsicElements[T] & {
    ref?: Ref<ButtonElementType<T>>;
  };

const sizeToClassName: Record<ButtonSize, string> = {
  [ButtonSize.XLarge]: 'border-none',
  [ButtonSize.Large]: 'h-12 px-6 rounded-14',
  [ButtonSize.Medium]: 'h-10 px-5 rounded-xl',
  [ButtonSize.Small]: 'h-8 px-3 rounded-10',
  [ButtonSize.XSmall]: 'h-6 px-2 rounded-lg',
};

const iconOnlySizeToClassName: Record<ButtonSize, string> = {
  [ButtonSize.XLarge]: 'h-16 w-16 p-0 rounded-[1.375rem]',
  [ButtonSize.Large]: 'h-12 w-12 p-0 rounded-14',
  [ButtonSize.Medium]: 'h-10 w-10 p-0 rounded-xl',
  [ButtonSize.Small]: 'h-8 w-8 p-0 rounded-10',
  [ButtonSize.XSmall]: 'h-6 w-6 p-0 rounded-lg',
};

const variantToClassName: Record<ButtonVariant, string> = {
  [ButtonVariant.Primary]: 'btn-primary',
  [ButtonVariant.Secondary]: 'btn-secondary',
  [ButtonVariant.Tertiary]: 'btn-tertiary',
  [ButtonVariant.Float]: 'btn-tertiaryFloat',
};

const variantColorToClassName: Record<
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
    [ButtonColor.Ketchup]: 'btn-primary-ketchup',
    [ButtonColor.Lettuce]: 'btn-primary-lettuce',
    [ButtonColor.Onion]: 'btn-primary-onion',
    [ButtonColor.Pepper]: 'btn-primary-pepper',
    [ButtonColor.Salt]: 'btn-primary-salt',
    [ButtonColor.Twitter]: 'btn-primary-twitter',
    [ButtonColor.Water]: 'btn-primary-water',
    [ButtonColor.Whatsapp]: 'btn-primary-whatsapp',
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
    [ButtonColor.Onion]: 'btn-secondary-onion',
    [ButtonColor.Pepper]: 'btn-secondary-pepper',
    [ButtonColor.Salt]: 'btn-secondary-salt',
    [ButtonColor.Twitter]: 'btn-secondary-twitter',
    [ButtonColor.Water]: 'btn-secondary-water',
    [ButtonColor.Whatsapp]: 'btn-secondary-whatsapp',
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
    [ButtonColor.Lettuce]: 'btn-tertiary-lettuce',
    [ButtonColor.Onion]: 'btn-tertiary-onion',
    [ButtonColor.Pepper]: 'btn-tertiary-pepper',
    [ButtonColor.Salt]: 'btn-tertiary-salt',
    [ButtonColor.Twitter]: 'btn-tertiary-twitter',
    [ButtonColor.Water]: 'btn-tertiary-water',
    [ButtonColor.Whatsapp]: 'btn-tertiary-whatsapp',
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
    [ButtonColor.Lettuce]: 'btn-tertiaryFloat-lettuce',
    [ButtonColor.Onion]: 'btn-tertiaryFloat-onion',
    [ButtonColor.Pepper]: 'btn-tertiaryFloat-pepper',
    [ButtonColor.Salt]: 'btn-tertiaryFloat-salt',
    [ButtonColor.Twitter]: 'btn-tertiaryFloat-twitter',
    [ButtonColor.Water]: 'btn-tertiaryFloat-water',
    [ButtonColor.Whatsapp]: 'btn-tertiaryFloat-whatsapp',
  },
};

function ButtonComponent<TagName extends AllowedTags>(
  {
    variant,
    size = ButtonSize.Medium,
    color,
    className,
    icon,
    iconPosition = ButtonIconPosition.Left,
    loading,
    pressed,
    children,
    onClick,
    tag: Tag = 'button',
    ...props
  }: ButtonProps<TagName>,
  ref?: Ref<ButtonElementType<TagName>>,
): ReactElement {
  const iconOnly = icon && !children;
  const getIconWithSize = useGetIconWithSize(size, iconOnly, iconPosition);
  const isAnchor = Tag === 'a';

  return (
    <Tag
      {...props}
      {...(isAnchor ? combinedClicks(onClick) : { onClick })}
      aria-busy={loading}
      aria-pressed={pressed}
      ref={ref}
      className={classNames(
        `btn inline-flex flex-row items-center justify-center border
        typo-callout font-bold
        no-underline shadow-none cursor-pointer select-none focus-outline relative
        transition duration-200 ease-in-out`,
        { iconOnly },
        iconOnly ? iconOnlySizeToClassName[size] : sizeToClassName[size],
        !color && variantToClassName[variant],
        variantColorToClassName[variant]?.[color],
        className,
      )}
    >
      {icon &&
        iconPosition === ButtonIconPosition.Left &&
        getIconWithSize(icon)}
      {loading ? <span className="invisible">{children}</span> : children}
      {icon &&
        iconPosition === ButtonIconPosition.Right &&
        getIconWithSize(icon)}
      {loading && (
        <Loader
          data-testid="buttonLoader"
          className="absolute inset-0 m-auto !visible"
        />
      )}
    </Tag>
  );
}

export const Button = forwardRef(ButtonComponent);
