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
  None = 'none',
}

const buttonSizeToIconSize: Record<ButtonSize, IconSize> = {
  [ButtonSize.XLarge]: IconSize.XLarge,
  [ButtonSize.Large]: IconSize.Large,
  [ButtonSize.Medium]: IconSize.Medium,
  [ButtonSize.Small]: IconSize.Small,
  [ButtonSize.XSmall]: IconSize.XSmall,
  [ButtonSize.None]: IconSize.Small,
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
  [ButtonSize.Large]: 'h-12 px-6 rounded-[0.88rem]',
  [ButtonSize.Medium]: 'h-10 px-5 rounded-xl',
  [ButtonSize.Small]: 'h-8 px-3 rounded-[0.63rem]',
  [ButtonSize.XSmall]: 'h-6 px-2 rounded-lg',
  [ButtonSize.None]: 'border-none',
};

const iconOnlySizeToClassName: Record<ButtonSize, string> = {
  [ButtonSize.XLarge]: 'h-16 w-16 p-0 rounded-[1.375rem]',
  [ButtonSize.Large]: 'h-12 w-12 p-0 rounded-[0.88rem]',
  [ButtonSize.Medium]: 'h-10 w-10 p-0 rounded-xl',
  [ButtonSize.Small]: 'h-8 w-8 p-0 rounded-[0.63rem]',
  [ButtonSize.XSmall]: 'h-6 w-6 p-0 rounded-lg',
  [ButtonSize.None]: 'w-5 p-0 border-none',
};

const variantToClassName: Record<ButtonVariant, string> = Object.values(
  ButtonVariant,
).reduce((acc, variant) => {
  acc[variant] = `btn-${variant}`;
  return acc;
}, {} as Record<ButtonVariant, string>);

const variantColorToClassName: Record<
  ButtonVariant,
  Record<ButtonColor, string>
> = Object.values(ButtonVariant).reduce((variantAcc, variant) => {
  return {
    ...variantAcc,
    [variant]: Object.values(ButtonColor).reduce((colorAcc, color) => {
      return {
        ...colorAcc,
        [color]: `btn-${variant}-${color}`,
      };
    }, {} as Record<ButtonColor, string>),
  };
}, {} as Record<ButtonVariant, Record<ButtonColor, string>>);

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
        variantToClassName[variant],
        variantColorToClassName[variant]?.[color],
        className,
      )}
    >
      {icon &&
        iconPosition === ButtonIconPosition.Left &&
        getIconWithSize(icon)}
      {children}
      {icon &&
        iconPosition === ButtonIconPosition.Right &&
        getIconWithSize(icon)}
      {loading && (
        <Loader
          data-testid="buttonLoader"
          className="hidden absolute top-0 right-0 bottom-0 left-0 m-auto btn-loader"
        />
      )}
    </Tag>
  );
}

export const Button = forwardRef(ButtonComponent);
