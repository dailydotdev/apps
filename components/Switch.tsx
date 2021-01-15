import React, { ReactElement, ReactNode } from 'react';
import styled from 'styled-components';
import { size3, size4, size8 } from '../styles/sizes';
import colors, { overlayTertiary } from '../styles/colors';
import { typoFootnote } from '../styles/typography';

const switchHeight = size4;

const SwitchTrack = styled.span`
  bottom: 0;
  width: 100%;
  height: 0.625rem;
  margin: auto 0;
  background: ${overlayTertiary('white')};
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
  width: ${size8};
  height: ${switchHeight};

  ${SwitchKnob}, ${SwitchTrack} {
    position: absolute;
    left: 0;
    top: 0;
    border-radius: 0.188rem;
  }
`;

const Children = styled.span`
  margin-left: ${size3};
  color: var(--theme-label-tertiary);
  font-weight: bold;
  ${typoFootnote}
`;

const Container = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;

  &:hover ${SwitchKnob} {
    background: var(--theme-label-primary);
  }

  &:hover input:checked ~ ${SwitchContainer} ${SwitchKnob} {
    background: ${colors.water['50']};
  }

  &:active {
    background: none;
  }

  input {
    display: none;

    &:checked {
      & ~ ${SwitchContainer} ${SwitchTrack} {
        background: ${colors.water['90']};
      }

      & ~ ${SwitchContainer} ${SwitchKnob} {
        transform: translateX(100%);
        background: ${colors.water['60']};
      }

      & ~ ${Children} {
        color: var(--theme-label-primary);
      }
    }
  }
`;

export interface Props {
  children?: ReactNode;
  className?: string;
  inputId: string;
  name: string;
  checked?: boolean;
}

export default function Switch({
  className,
  inputId,
  name,
  checked,
  children,
}: Props): ReactElement {
  return (
    <Container className={className} htmlFor={inputId}>
      <input
        id={inputId}
        name={name}
        type="checkbox"
        defaultChecked={checked}
      />
      <SwitchContainer>
        <SwitchTrack />
        <SwitchKnob />
      </SwitchContainer>
      {children && <Children>{children}</Children>}
    </Container>
  );
}
