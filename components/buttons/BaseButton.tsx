import React, { forwardRef, LegacyRef, ReactElement, ReactNode } from 'react';
import styled from '@emotion/styled';
import { typoCallout } from '../../styles/typography';
import {
  size1,
  size10,
  size1px,
  size2,
  size6,
  size7,
  size8,
  sizeN,
} from '../../styles/sizes';
import { ButtonLoader } from '../utilities';
import { focusOutline } from '../../styles/helpers';
import { ColorName } from '../../styles/colors';

export type ButtonSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface ButtonStateStyle {
  background?: string;
  borderColor?: string;
  color?: string;
  shadow?: string;
}

export interface ButtonStatesStyles {
  default?: ButtonStateStyle;
  hover?: ButtonStateStyle;
  active?: ButtonStateStyle;
  pressed?: ButtonStateStyle;
  disabled?: ButtonStateStyle;
}

export interface StyledButtonProps {
  buttonSize?: ButtonSize;
  darkStates: ButtonStatesStyles;
  lightStates: ButtonStatesStyles;
  iconOnly?: boolean;
}

const applyButtonStateStyle = (style: ButtonStateStyle): string => {
  const styles = [];
  if (style.background) {
    styles.push(`background: ${style.background};`);
  }
  if (style.borderColor) {
    styles.push(`border-color: ${style.borderColor};`);
  }
  if (style.color) {
    styles.push(`color: ${style.color};`);
    styles.push(`--loader-color: ${style.color};`);
  }
  if (style.shadow) {
    styles.push(`box-shadow: ${style.shadow};`);
  }
  return styles.join('\n');
};

const applyButtonStatesStyles = (styles: ButtonStatesStyles): string =>
  `
  ${styles.default ? applyButtonStateStyle(styles.default) : ''}

  ${
    styles.pressed
      ? `&[aria-pressed="true"] {
    ${applyButtonStateStyle(styles.pressed)}
  }`
      : ''
  }

  ${
    styles.hover
      ? `&:hover, &.hover, &:focus.focus-visible {
    ${applyButtonStateStyle(styles.hover)}
  }`
      : ''
  }

  ${
    styles.active
      ? `&:active {
    ${applyButtonStateStyle(styles.active)}
  }`
      : ''
  }

  ${
    styles.disabled
      ? `&[disabled] {
    ${applyButtonStateStyle(styles.disabled)}
  }`
      : ''
  }
  `;

const applySizeStyle = (
  size: ButtonSize = 'medium',
  iconOnly?: boolean,
): string => {
  if (iconOnly) {
    switch (size) {
      case 'small':
        return `
        padding: ${sizeN(0.75)};
        border-radius: ${sizeN(2.5)};
        `;
      case 'large':
        return `
        padding: ${sizeN(1.75)};
        border-radius: ${sizeN(3.5)};
        `;
      case 'xlarge':
        return `
        padding: ${sizeN(2.75)};
        border-radius: ${sizeN(5.5)};
        `;
      default:
        return `
        padding: ${sizeN(1.25)};
        border-radius: ${sizeN(3)};
        `;
    }
  }
  switch (size) {
    case 'small':
      return `
      padding: ${sizeN(1.25)} ${sizeN(3.75)};
      border-radius: ${sizeN(2.5)};
      `;
    case 'large':
      return `
      padding: ${sizeN(3.25)} ${sizeN(7.75)};
      border-radius: ${sizeN(3.5)};
      `;
    default:
      return `
      padding: ${sizeN(2.25)} ${sizeN(5.75)};
      border-radius: ${sizeN(3)};
      `;
  }
};

const iconMargins = `
.icon {
  width: 1em;
  height: 1em;
  font-size: ${size6};
  margin-left: -${size2};
  margin-right: ${size1};

  &:not(:first-child) {
    margin-left: ${size1};
    margin-right: -${size2};
  }

  &:only-child {
    margin-right: -${size2};
  }
}
`;

const getIconSize = ({ buttonSize, iconOnly }: StyledButtonProps): string => {
  if (iconOnly) {
    switch (buttonSize) {
      case 'small':
        return size6;
      case 'large':
        return size8;
      case 'xlarge':
        return size10;
      default:
        return size7;
    }
  }
  return size6;
};

const StyledButton = styled.button<StyledButtonProps>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  text-decoration: none;
  border-width: ${size1px};
  border-style: solid;
  font-weight: bold;
  box-shadow: none;
  user-select: none;
  ${typoCallout}

  .icon {
    width: 1em;
    height: 1em;
    font-size: ${getIconSize};
  }

  ${(props) =>
    [
      applySizeStyle(props.buttonSize, props.iconOnly),
      applyButtonStatesStyles(props.darkStates),
      props.iconOnly ? '' : iconMargins,
    ].join('\n')}
  ${ButtonLoader} {
    display: none;
  }

  &[aria-busy='true'] {
    pointer-events: none;

    & > * {
      visibility: hidden;
    }

    ${ButtonLoader} {
      display: block;
      visibility: unset;
    }
  }

  &[disabled] {
    pointer-events: none;
    cursor: default;
  }

  .light && {
    ${(props) => applyButtonStatesStyles(props.lightStates)}
  }

  &&& {
    ${focusOutline}
  }
`;

export interface BaseButtonProps {
  buttonSize?: ButtonSize;
  loading?: boolean;
  pressed?: boolean;
  tag?: React.ElementType;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  themeColor?: ColorName;
  children?: ReactNode;
}

export type ButtonProps<
  Tag extends keyof JSX.IntrinsicElements
> = BaseButtonProps & JSX.IntrinsicElements[Tag];

export default forwardRef(function BaseButton<
  Tag extends keyof JSX.IntrinsicElements
>(
  {
    loading,
    pressed,
    icon,
    rightIcon,
    children,
    tag = 'button',
    ...props
  }: StyledButtonProps & ButtonProps<Tag>,
  ref: LegacyRef<Tag>,
): ReactElement {
  return (
    <StyledButton
      as={tag}
      {...(props as StyledButtonProps)}
      iconOnly={icon && !children && !rightIcon}
      aria-busy={loading}
      aria-pressed={pressed}
      ref={ref as LegacyRef<HTMLButtonElement>}
    >
      {icon}
      {children && <span>{children}</span>}
      {rightIcon}
      {loading && <ButtonLoader data-testid="buttonLoader" />}
    </StyledButton>
  );
});
