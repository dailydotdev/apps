import { HTMLAttributes } from 'react';
import styled from 'styled-components';
import { size1, size10, size2, size3, size5, size6 } from '../styles/sizes';
import { typoLil2, typoMicro2Base } from '../styles/typography';
import { focusOutline } from '../styles/helpers';
import { ButtonLoader } from './utilities';

interface BaseButtonProps extends HTMLAttributes<HTMLButtonElement> {
  done?: boolean;
  size?: 'small';
  waiting?: boolean;
}

const getIconSize = (size?: string) => {
  if (size === 'small') {
    return size5;
  }
  return size6;
};

export const BaseButton = styled.button<BaseButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  overflow: hidden;
  cursor: pointer;
  text-decoration: none;
  ${typoMicro2Base}

  .icon {
    width: 1em;
    height: 1em;
    ${(props) => `font-size: ${getIconSize(props.size)};`}
  }

  ${focusOutline}

  &[disabled] {
    pointer-events: none;
    cursor: default;
  }

  ${({ waiting }) =>
    waiting &&
    `
    pointer-events: none;
    & > * { visibility: hidden; }
  `}

  ${ButtonLoader} {
    display: ${({ waiting }) => (waiting ? 'block' : 'none')};
    visibility: unset;
  }

  &&& {
    ${(props) => props.done && 'color: var(--theme-avocado);'}
  }
`;

export const IconButton = styled(BaseButton)`
  padding: ${size1};
  color: var(--theme-secondary);
  border-radius: ${size2};

  &:hover {
    color: var(--theme-primary);
    background: var(--theme-hover);
  }

  &:active {
    color: var(--theme-primary);
    background: var(--theme-focus);
  }

  &[disabled] {
    color: var(--theme-disabled);
    background: none;
  }
`;

export const TextButton = styled(BaseButton)`
  padding: ${size1} ${size3};
  border-radius: ${size1};

  .icon {
    margin-left: -${size1};
    margin-right: ${size2};

    &.right {
      margin-left: ${size2};
      margin-right: -${size1};
    }
  }
`;

interface ColorButtonProps {
  background: string;
}

export const ColorButton = styled(TextButton).attrs({
  size: 'small',
})<ColorButtonProps>`
  position: relative;
  color: var(--theme-primary-invert);
  border-radius: ${size2};
  z-index: 1;

  &:before {
    position: absolute;
    content: '';
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: ${({ background }) => background};
    z-index: -1;
  }

  &:hover:before {
    opacity: 80%;
  }

  &:active:before {
    opacity: 64%;
  }

  &[disabled] {
    color: var(--theme-disabled);

    &:before {
      background: var(--theme-background-highlight);
    }
  }
`;

export const InvertButton = styled(ColorButton).attrs({
  background: 'var(--theme-primary)',
})`
  height: ${size10};
  padding-top: 0;
  padding-bottom: 0;
  ${typoLil2}
`;

export const FloatButton = styled(TextButton)`
  color: var(--theme-secondary);

  &:hover {
    color: var(--theme-primary);
    background: var(--theme-hover);
  }

  &:active {
    color: var(--theme-primary);
    background: var(--theme-focus);
  }

  &[disabled] {
    color: var(--theme-disabled);
    background: var(--theme-background-highlight);
  }
`;

export const HollowButton = styled(FloatButton)`
  border: 0.063rem solid var(--theme-primary);

  &:focus {
    border-color: transparent;

    &:not(.focus-visible) {
      border-color: var(--theme-primary);
    }
  }

  &[disabled] {
    border-color: var(--theme-disabled);
  }
`;
