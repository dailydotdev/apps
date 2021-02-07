import React, {
  HTMLAttributes,
  LegacyRef,
  ReactElement,
  useRef,
  useState,
} from 'react';
import BaseButton, {
  ButtonProps,
  ButtonStatesStyles,
  ButtonStateStyle,
  StyledButtonProps,
} from './BaseButton';
import { tertiaryStyle } from './TertiaryButton';
import styled from '@emotion/styled';
import { typoCallout } from '../../styles/typography';
import sizeN from '../../macros/sizeN.macro';
import classNames from 'classnames';
import { mobileL } from '../../styles/media';

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
  responsiveLabel?: boolean;
};

const Container = styled.div<
  Pick<StyledButtonProps, 'darkStates' | 'lightStates'>
>`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  user-select: none;

  label {
    display: flex;
    align-items: center;
    font-weight: bold;
    cursor: pointer;
    padding-left: ${sizeN(1)};
    padding-right: ${sizeN(6)};
    ${typoCallout}
  }

  &.small > label {
    padding-right: ${sizeN(4)};
  }

  &.large > label {
    padding-right: ${sizeN(8)};
  }

  &&.reverse {
    flex-direction: row-reverse;

    & > label {
      padding-left: ${sizeN(6)};
      padding-right: ${sizeN(1)};
    }

    &.small > label {
      padding-left: ${sizeN(4)};
    }

    &.large > label {
      padding-left: ${sizeN(8)};
    }
  }

  &.responsiveLabel label {
    display: none;

    ${mobileL} {
      display: flex;
    }
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
  responsiveLabel,
  tag,
  ...props
}: ButtonProps<Tag> & QuandaryButtonProps): ReactElement {
  const buttonStyle = tertiaryStyle(props.themeColor);
  let labelProps: HTMLAttributes<HTMLLabelElement> = {};
  let buttonProps: {
    className?: string;
    innerRef?: LegacyRef<HTMLButtonElement>;
  } = {};
  if (tag === 'a') {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const onLabelClick = (event: React.MouseEvent<HTMLLabelElement>): void => {
      event.preventDefault();
      buttonRef.current.click();
    };
    labelProps = {
      onMouseOver: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      onClick: onLabelClick,
    };
    buttonProps = {
      className: isHovered && 'hover',
      innerRef: buttonRef,
    };
  }

  return (
    <Container
      {...buttonStyle}
      style={style}
      className={classNames(
        { reverse, responsiveLabel },
        props.buttonSize,
        className,
      )}
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
