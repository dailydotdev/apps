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

export enum ButtonKind {
  Button = 'button',
  Link = 'link',
}

export enum ButtonVariant {
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tertiary',
  Float = 'tertiaryFloat',
  Subtle = 'subtle',
}

export enum ButtonIconPosition {
  Left = 'left',
  Right = 'right',
}
interface CommonButtonProps {
  kind?: ButtonKind;
  size?: ButtonSize;
  loading?: boolean;
  pressed?: boolean;
  disabled?: boolean;
  children?: ReactNode;
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

const useGetIconWithSize = (size: ButtonSize, iconOnly: boolean) => {
  return (icon: React.ReactElement<IconProps>) =>
    React.cloneElement(icon, {
      size: icon.props?.size ?? buttonSizeToIconSize[size],
      className: classNames(icon.props.className, !iconOnly && 'icon'),
    });
};

export type AllowedTags = keyof Pick<JSX.IntrinsicElements, 'a' | 'button'>;
export type AllowedElements = HTMLButtonElement | HTMLAnchorElement;
export type ButtonElementType<Tag extends AllowedTags> = Tag extends 'a'
  ? HTMLAnchorElement
  : HTMLButtonElement;

export type ButtonProps<Tag extends AllowedTags> = BaseButtonProps &
  HTMLAttributes<Tag> &
  JSX.IntrinsicElements[Tag] & {
    ref?: Ref<ButtonElementType<Tag>>;
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

function ButtonComponent<TagName extends AllowedTags>(
  {
    kind = ButtonKind.Button,
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
    ...props
  }: ButtonProps<TagName>,
  ref?: Ref<ButtonElementType<TagName>>,
  // TODO: @milan - this is a hack, but only way how I could get TS to be type happy for now
  Tag = kind === ButtonKind.Link ? 'a' : 'button',
): ReactElement {
  const iconOnly = icon && !children;
  const getIconWithSize = useGetIconWithSize(size, iconOnly);
  const isAnchor = kind === ButtonKind.Link;

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
        {
          [`btn-${variant}`]: variant,
          [`btn-${variant}-${color}`]: color && variant,
        },
        className,
      )}
    >
      {icon &&
        iconPosition === ButtonIconPosition.Left &&
        getIconWithSize(icon)}
      {children && <span>{children}</span>}
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
