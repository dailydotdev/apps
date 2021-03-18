import React, { ReactElement, ReactNode } from 'react';
import styled from '@emotion/styled';
import sizeN from '../../macros/sizeN.macro';
import colors from '../../styles/colors';
import { typoFootnote } from '../../styles/typography';
import classNames from 'classnames';

const switchHeight = sizeN(4);

const SwitchTrack = styled.span`
  bottom: 0;
  width: 100%;
  height: 0.625rem;
  margin: auto 0;
  background: var(--theme-overlay-quaternary);
  will-change: background-color, opacity;
  transition: background-color 0.1s linear, opacity 0.2s linear;
`;

const SwitchKnob = styled.span`
  width: ${switchHeight};
  height: ${switchHeight};
  background: var(--theme-label-tertiary);
  will-change: transform, background-color;
  transition: background-color 0.1s linear, transform 0.2s linear;
`;

const SwitchContainer = styled.span`
  position: relative;
  display: block;
  width: ${sizeN(8)};
  height: ${switchHeight};

  ${SwitchKnob}, ${SwitchTrack} {
    position: absolute;
    left: 0;
    top: 0;
    border-radius: 0.188rem;
  }
`;

const Children = styled.span`
  margin-left: ${sizeN(3)};
  color: var(--theme-label-tertiary);
  font-weight: bold;
  ${typoFootnote}
`;

const Container = styled.label`
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;

  &:hover ${SwitchKnob} {
    background: var(--theme-label-primary);
  }

  &:hover input:checked ~ ${SwitchContainer} ${SwitchKnob} {
    background: ${colors.water['20']};
  }

  &:active {
    background: none;
  }

  input {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;

    &:checked {
      & ~ ${SwitchContainer} ${SwitchTrack} {
        background: ${colors.water['50']};
      }

      & ~ ${SwitchContainer} ${SwitchKnob} {
        transform: translateX(100%);
        background: ${colors.water['40']};
      }

      & ~ ${Children} {
        color: var(--theme-label-primary);
      }
    }
  }

  .light & {
    & input:checked ~ ${SwitchContainer} ${SwitchKnob} {
      background: ${colors.water['80']};
    }

    &:hover input:checked ~ ${SwitchContainer} ${SwitchKnob} {
      background: ${colors.water['60']};
    }
  }

  &.big {
    & ${SwitchTrack} {
      width: ${sizeN(10)};
      height: ${sizeN(3)};
      border-radius: ${sizeN(1)};
    }

    & ${SwitchContainer} {
      width: ${sizeN(10)};
      height: ${sizeN(5)};
    }

    & ${SwitchKnob} {
      width: ${sizeN(5)};
      height: ${sizeN(5)};
      border-radius: ${sizeN(1.5)};
    }
  }
`;

export interface Props {
  children?: ReactNode;
  className?: string;
  inputId: string;
  name: string;
  checked?: boolean;
  onToggle?: () => unknown;
}

export default function Switch({
  className,
  inputId,
  name,
  checked,
  children,
  onToggle,
}: Props): ReactElement {
  return (
    <Container className={classNames(className, 'group')} htmlFor={inputId}>
      <input
        id={inputId}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onToggle}
      />
      <SwitchContainer>
        <SwitchTrack />
        <SwitchKnob />
      </SwitchContainer>
      {children && <Children>{children}</Children>}
    </Container>
  );
}
