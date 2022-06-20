import React, {
  HTMLAttributes,
  ReactNode,
  ReactElement,
  Ref,
  forwardRef,
} from 'react';
import classNames from 'classnames';
import { Size, IconProps } from '../Icon';
import { Loader } from '../Loader';

export type ButtonSize = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';

const IconSize: Record<ButtonSize, Size> = {
  xsmall: 'small',
  small: 'medium',
  medium: 'large',
  large: 'xlarge',
  xlarge: 'xxlarge',
};

export interface StyledButtonProps {
  buttonSize?: ButtonSize;
  iconOnly?: boolean;
}

export interface BaseButtonProps {
  buttonSize?: ButtonSize;
  loading?: boolean;
  pressed?: boolean;
  tag?: React.ElementType;
  icon?: React.ReactElement<IconProps>;
  rightIcon?: React.ReactElement<IconProps>;
  children?: ReactNode;
  displayClass?: string;
  position?: string;
}

const getIcon = (icon: React.ReactElement<IconProps>, size: ButtonSize) =>
  React.cloneElement(icon, {
    size: IconSize[size],
  });

export type AllowedTags = keyof Pick<JSX.IntrinsicElements, 'a' | 'button'>;
export type AllowedElements = HTMLButtonElement | HTMLAnchorElement;
export type ButtonElementType<Tag extends AllowedTags> = Tag extends 'a'
  ? HTMLAnchorElement
  : HTMLButtonElement;

export type ButtonProps<Tag extends AllowedTags> = BaseButtonProps &
  HTMLAttributes<AllowedElements> &
  JSX.IntrinsicElements[Tag] & {
    ref?: Ref<ButtonElementType<Tag>>;
  };

function ButtonComponent<TagName extends AllowedTags>(
  {
    loading,
    pressed,
    icon,
    rightIcon,
    buttonSize = 'medium',
    children,
    tag: Tag = 'button',
    className,
    displayClass,
    position = 'relative',
    ...props
  }: StyledButtonProps & ButtonProps<TagName>,
  ref?: Ref<ButtonElementType<TagName>>,
): ReactElement {
  const iconOnly = icon && !children && !rightIcon;

  return (
    <Tag
      {...(props as StyledButtonProps)}
      aria-busy={loading}
      aria-pressed={pressed}
      ref={ref}
      className={classNames(
        { iconOnly },
        buttonSize,
        'btn flex-row items-center justify-center border typo-callout font-bold no-underline shadow-none cursor-pointer select-none focus-outline',
        displayClass || 'flex',
        position,
        className,
      )}
    >
      {getIcon(icon, buttonSize)}
      {children && <span>{children}</span>}
      {getIcon(rightIcon, buttonSize)}
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
