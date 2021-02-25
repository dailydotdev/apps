import React, { LegacyRef, ReactElement, ReactNode } from 'react';
import styled from '@emotion/styled';
import classNames from 'classnames';
import { typoCallout } from '../../styles/typography';
import sizeN from '../../macros/sizeN.macro';
import rem from '../../macros/rem.macro';
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

const StyledButton = styled.button<
  Pick<StyledButtonProps, 'darkStates' | 'lightStates'>
>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  text-decoration: none;
  border-width: ${rem(1)};
  border-style: solid;
  font-weight: bold;
  box-shadow: none;
  user-select: none;
  padding: ${sizeN(2.25)} ${sizeN(5.75)};
  border-radius: ${sizeN(3)};
  ${typoCallout}

  .icon {
    width: 1em;
    height: 1em;
    font-size: ${sizeN(6)};
  }

  &.small {
    padding: ${sizeN(1.25)} ${sizeN(3.75)};
    border-radius: ${sizeN(2.5)};
  }

  &.large {
    padding: ${sizeN(3.25)} ${sizeN(7.75)};
    border-radius: ${sizeN(3.5)};
  }

  &:not(.iconOnly) {
    .icon {
      margin-left: -${sizeN(2)};
      margin-right: ${sizeN(1)};

      &:not(:first-child) {
        margin-left: ${sizeN(1)};
        margin-right: -${sizeN(2)};
      }

      &:only-child {
        margin-right: -${sizeN(2)};
      }
    }
  }

  &.iconOnly {
    padding: ${sizeN(1.25)};
    border-radius: ${sizeN(3)};
    font-size: ${sizeN(67)};

    &.small {
      padding: ${sizeN(0.75)};
      border-radius: ${sizeN(2.5)};
      font-size: ${sizeN(6)};
    }

    &.large {
      padding: ${sizeN(1.75)};
      border-radius: ${sizeN(3.5)};
      font-size: ${sizeN(8)};
    }

    &.xlarge {
      padding: ${sizeN(2.75)};
      border-radius: ${sizeN(5.5)};
      font-size: ${sizeN(10)};
    }
  }

  ${(props) => applyButtonStatesStyles(props.darkStates)}
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

  .light &&,
  .invert && {
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
> = BaseButtonProps &
  JSX.IntrinsicElements[Tag] & { innerRef?: LegacyRef<Tag> };

export default function BaseButton<Tag extends keyof JSX.IntrinsicElements>({
  loading,
  pressed,
  icon,
  rightIcon,
  children,
  tag = 'button',
  innerRef,
  className,
  ...props
}: StyledButtonProps & ButtonProps<Tag>): ReactElement {
  const iconOnly = icon && !children && !rightIcon;
  return (
    <StyledButton
      as={tag}
      {...(props as StyledButtonProps)}
      aria-busy={loading}
      aria-pressed={pressed}
      ref={innerRef as LegacyRef<HTMLButtonElement>}
      className={classNames({ iconOnly }, props.buttonSize, className)}
    >
      {icon}
      {children && <span>{children}</span>}
      {rightIcon}
      {loading && <ButtonLoader data-testid="buttonLoader" />}
    </StyledButton>
  );
}
