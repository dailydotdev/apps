import React, { HTMLAttributes, ReactElement } from 'react';
import styled, { keyframes } from 'styled-components';
import { size5, sizeN } from '../styles/sizes';

const loader = keyframes`
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Container = styled.div`
  position: relative;
  height: ${size5};
  width: ${size5};
  animation: ${loader} 3s linear infinite;

  & span,
  & span:before,
  & span:after {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    margin: auto;
    height: 100%;
    width: 100%;
    box-sizing: border-box;
  }

  & span {
    clip: rect(${sizeN(2.5)}, ${size5}, ${size5}, 0);
    animation: ${loader} 1.5s cubic-bezier(0.77, 0, 0.175, 1) infinite;

    &:before {
      content: '';
      border: 0.188rem solid transparent;
      border-top: 0.188rem solid var(--loader-color, #fff);
      border-radius: 50%;
      animation: ${loader} 1.5s cubic-bezier(0.77, 0, 0.175, 1) infinite;
    }

    &:after {
      content: '';
      border: 0.188rem solid var(--loader-color, #fff);
      border-radius: 50%;
      opacity: 0.5;
    }
  }
`;

export default function Loader(
  props: HTMLAttributes<HTMLDivElement>,
): ReactElement {
  return (
    <Container {...props}>
      <span />
    </Container>
  );
}
