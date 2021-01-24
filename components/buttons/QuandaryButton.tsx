import React, { HTMLAttributes, ReactElement, useRef, useState } from 'react';
import BaseButton, {
  ButtonProps,
  ButtonSize,
  ButtonStatesStyles,
  ButtonStateStyle,
  StyledButtonProps,
} from './BaseButton';
import { tertiaryStyle } from './TertiaryButton';
import styled from 'styled-components/macro';
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
      ? `& :hover ~ label, & .hover ~ label, & :focus.focus-visible ~ label {
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

type QuandaryButtonProps = {
  id: string;
  reverse?: boolean;
  labelMediaQuery?: string;
};

const Container = styled.div<
  StyledButtonProps & Omit<QuandaryButtonProps, 'id'>
>`
  display: flex;
  flex-direction: ${({ reverse }) => (reverse ? 'row-reverse' : 'row')};
  align-items: stretch;
  user-select: none;

  label {
    align-items: center;
    font-weight: bold;
    cursor: pointer;
    ${typoCallout}

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

    ${({ labelMediaQuery }) =>
      labelMediaQuery
        ? `
      display: none;
      ${labelMediaQuery} {
        display: flex;
      }
    `
        : `display: flex;`}
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
  className,
  reverse,
  labelMediaQuery,
  tag,
  ...props
}: ButtonProps<Tag> & QuandaryButtonProps): ReactElement {
  const buttonStyle = tertiaryStyle(props.themeColor);
  let labelProps: HTMLAttributes<HTMLLabelElement> = {};
  let buttonProps: HTMLAttributes<HTMLButtonElement> & {
    ref?: React.MutableRefObject<{ base: HTMLButtonElement }>;
  } = {};
  if (tag === 'a') {
    const buttonRef = useRef<{ base: HTMLButtonElement }>(null);
    const [isHovered, setIsHovered] = useState(false);
    const onLabelClick = (event: React.MouseEvent<HTMLLabelElement>): void => {
      event.preventDefault();
      buttonRef.current.base.click();
    };
    labelProps = {
      onMouseOver: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      onClick: onLabelClick,
    };
    buttonProps = {
      className: isHovered && 'hover',
      ref: buttonRef,
    };
  }

  return (
    <Container
      {...buttonStyle}
      buttonSize={props.buttonSize}
      style={style}
      className={className}
      reverse={reverse}
      labelMediaQuery={labelMediaQuery}
    >
      <BaseButton<Tag>
        id={id}
        {...buttonStyle}
        {...props}
        tag={tag}
        {...buttonProps}
      />
      {children && (
        <label htmlFor={id} {...labelProps}>
          {children}
        </label>
      )}
    </Container>
  );
}
