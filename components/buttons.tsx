import React, { ComponentType, HTMLAttributes, ReactElement } from 'react';
import styled from 'styled-components';
import { typoCallout } from '../styles/typography';
import { size1, size1px, size2, size3, sizeN } from '../styles/sizes';
import colors from '../styles/colors';
import { ButtonLoader } from './utilities';
import { focusOutline } from '../styles/helpers';

type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonStateStyle {
  background?: string;
  borderColor?: string;
  color?: string;
}

interface ButtonStatesStyles {
  default?: ButtonStateStyle;
  hover?: ButtonStateStyle;
  active?: ButtonStateStyle;
  pressed?: ButtonStateStyle;
  disabled?: ButtonStateStyle;
}

interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  loading?: boolean;
}

interface BaseButtonProps extends ButtonProps {
  hasShadow?: boolean;
  darkStates: ButtonStatesStyles;
  lightStates: ButtonStatesStyles;
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
  return styles.join('\n');
};

const applyButtonStatesStyles = (styles: ButtonStatesStyles): string =>
  `
  ${styles.default && applyButtonStateStyle(styles.default)}

  ${
    styles.pressed &&
    `&[aria-pressed="true"] {
    ${applyButtonStateStyle(styles.pressed)}
  }`
  }

  ${
    styles.hover &&
    `&:hover, &:focus {
    ${applyButtonStateStyle(styles.hover)}
  }`
  }

  ${
    styles.active &&
    `&:active {
    ${applyButtonStateStyle(styles.active)}
  }`
  }

  ${
    styles.disabled &&
    `&[disabled] {
    ${applyButtonStateStyle(styles.disabled)}
  }`
  }
  `;

const applySizeStyle = (size: ButtonSize = 'medium'): string => {
  switch (size) {
    case 'small':
      return `padding: ${size1} ${sizeN(3.5)};`;
    case 'large':
      return `padding: ${size3} ${sizeN(7.5)};`;
    default:
      return `padding: ${size2} ${sizeN(5.5)};`;
  }
};

const buttonShadows = `
  &:hover, &:focus {
    box-shadow: var(--theme-shadow3);
  }

  &:active {
    box-shadow: var(--theme-shadow2);
  }
`;

export const Button = styled.button<BaseButtonProps>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  text-decoration: none;
  border-width: ${size1px};
  border-style: solid;
  border-radius: ${size3};
  font-weight: bold;
  box-shadow: none;

  ${typoCallout}
  ${(props) =>
    [
      applySizeStyle(props.size),
      applyButtonStatesStyles(props.darkStates),
      props.hasShadow ? buttonShadows : '',
    ].join('\n')}

  ${({ loading }) =>
    loading &&
    `
    pointer-events: none;
    & > * { visibility: hidden; }
  `}

  ${ButtonLoader} {
    display: ${({ loading }) => (loading ? 'block' : 'none')};
    visibility: unset;
  }

  &[disabled] {
    pointer-events: none;
    cursor: default;
  }

  .light & {
    ${(props) => applyButtonStatesStyles(props.lightStates)}
  }

  &&& {
    ${focusOutline}
  }
`;

export const PrimaryButton = styled(Button).attrs({
  hasShadow: true,
  darkStates: {
    default: {
      color: 'var(--theme-label-invert)',
      background: '#FFFFFF',
      borderColor: 'transparent',
    },
    hover: {
      background: colors.salt['50'],
    },
    active: {
      background: colors.salt['90'],
    },
    pressed: {
      color: 'var(--theme-label-primary)',
      background: 'none',
      borderColor: 'var(--theme-label-primary)',
    },
    disabled: {
      background: `${colors.salt['90']}33`,
    },
  },
  lightStates: {
    default: {
      background: colors.pepper['90'],
      borderColor: colors.pepper['90'],
    },
    hover: {
      background: colors.pepper['50'],
    },
    active: {
      background: colors.pepper['10'],
    },
    disabled: {
      background: `${colors.pepper['10']}33`,
    },
  },
})<ButtonProps>``;

export const SecondaryButton = styled(Button).attrs({
  hasShadow: true,
  darkStates: {
    default: {
      color: 'var(--theme-label-primary)',
      background: 'none',
      borderColor: 'var(--theme-label-primary)',
    },
    hover: {
      background: `${colors.salt['90']}1F`,
    },
    active: {
      background: `${colors.salt['90']}33`,
    },
    pressed: {
      color: 'var(--theme-label-invert)',
      background: '#FFFFFF',
      borderColor: 'transparent',
    },
    disabled: {
      borderColor: `${colors.salt['90']}33`,
    },
  },
  lightStates: {
    hover: {
      background: `${colors.pepper['10']}1F`,
    },
    active: {
      background: `${colors.pepper['20']}33`,
    },
    pressed: {
      background: colors.pepper['90'],
    },
    disabled: {
      borderColor: `${colors.pepper['20']}33`,
    },
  },
})<ButtonProps>``;

export const TertiaryButton = styled(Button).attrs({
  hasShadow: false,
  darkStates: {
    default: {
      color: 'var(--theme-label-tertiary)',
      background: 'none',
      borderColor: 'transparent',
    },
    hover: {
      background: `${colors.salt['90']}1F`,
    },
    active: {
      background: `${colors.salt['90']}33`,
    },
    pressed: {
      color: 'var(--theme-label-primary)',
      background: 'none',
      borderColor: 'transparent',
    },
    disabled: {
      borderColor: 'var(--theme-label-disabled)',
    },
  },
  lightStates: {
    default: {
      color: 'var(--theme-label-tertiary)',
      background: 'none',
      borderColor: 'transparent',
    },
    hover: {
      background: `${colors.pepper['10']}1F`,
    },
    active: {
      background: `${colors.pepper['20']}33`,
    },
  },
})<ButtonProps>``;

export const LoadingButton = ({
  type: Button,
  children,
  ...props
}: { type: ComponentType<ButtonProps> } & ButtonProps): ReactElement => (
  <Button {...props}>
    <span>{children}</span>
    <ButtonLoader />
  </Button>
);
