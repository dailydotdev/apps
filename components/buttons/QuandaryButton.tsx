import React, { ReactElement } from 'react';
import BaseButton, {
  ButtonProps,
  ButtonSize,
  ButtonStatesStyles,
  ButtonStateStyle,
  StyledButtonProps,
} from './BaseButton';
import { tertiaryStyle } from './TertiaryButton';
import styled from 'styled-components';
import { typoCallout } from '../../styles/typography';
import { size1, size4, size6, size8 } from '../../styles/sizes';

const getRightMargin = (size: ButtonSize = 'medium'): string => {
  switch (size) {
    case 'small':
      return size4;
    case 'large':
      return size8;
    default:
      return size6;
  }
};

const applyButtonStateStyle = (style: ButtonStateStyle): string => {
  if (style.color) {
    return `color: ${style.color};`;
  }
  return '';
};

const applyButtonStatesStyles = (styles: ButtonStatesStyles): string =>
  `
  ${styles.default ? applyButtonStateStyle(styles.default) : ''}

  ${
    styles.pressed
      ? `& [aria-pressed="true"] ~ label {
    ${applyButtonStateStyle(styles.pressed)}
  }`
      : ''
  }

  ${
    styles.hover
      ? `& :hover ~ label, & :focus.focus-visible ~ label {
    ${applyButtonStateStyle(styles.hover)}
  }`
      : ''
  }

  ${
    styles.active
      ? `& :active ~ label {
    ${applyButtonStateStyle(styles.active)}
  }`
      : ''
  }

  ${
    styles.disabled
      ? `& [disabled] ~ label {
    ${applyButtonStateStyle(styles.disabled)}
  }`
      : ''
  }
  `;

const Container = styled.div<StyledButtonProps & { reverse?: boolean }>`
  display: flex;
  flex-direction: ${({ reverse }) => (reverse ? 'row-reverse' : 'row')};
  align-items: stretch;
  user-select: none;

  label {
    display: flex;
    align-items: center;
    ${({ reverse, buttonSize }) =>
      reverse
        ? `
      padding-left: ${getRightMargin(buttonSize)};
      padding-right: ${size1};
    `
        : `
      padding-left: ${size1};
      padding-right: ${getRightMargin(buttonSize)};
    `}

    font-weight: bold;
    cursor: pointer;
    ${typoCallout}
  }

  & [disabled] ~ label {
    pointer-events: none;
  }

  ${({ darkStates }) => applyButtonStatesStyles(darkStates)}

  .light & {
    ${({ lightStates }) => applyButtonStatesStyles(lightStates)}
  }
`;

export default function QuandaryButton<
  Tag extends keyof JSX.IntrinsicElements
>({
  id,
  children,
  style,
  reverse,
  ...props
}: ButtonProps<Tag> & { id: string; reverse?: boolean }): ReactElement {
  const buttonStyle = tertiaryStyle(props.themeColor);
  return (
    <Container
      {...buttonStyle}
      buttonSize={props.buttonSize}
      style={style}
      reverse={reverse}
    >
      <BaseButton<Tag> id={id} {...buttonStyle} {...props} />
      {children && <label htmlFor={id}>{children}</label>}
    </Container>
  );
}
