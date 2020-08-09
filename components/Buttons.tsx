import { DOMAttributes } from 'react';
import styled from 'styled-components';
import { size1, size2, size3, size5, size6 } from '../styles/sizes';
import { typoLil2, typoNuggets } from '../styles/typography';
import { focusOutline } from '../styles/utilities';

interface BaseButtonProps extends DOMAttributes<HTMLButtonElement> {
  done?: boolean;
  size?: 'small';
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
  background: none;
  border: none;
  overflow: hidden;
  cursor: pointer;
  ${typoNuggets}

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
  }
`;

export const InvertButton = styled(TextButton).attrs({ size: 'small' })`
  position: relative;
  padding-top: ${size2};
  padding-bottom: ${size2};
  border-radius: ${size2};
  color: var(--theme-primary-invert);
  z-index: 1;
  ${typoLil2}

  &:before {
    position: absolute;
    content: '';
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: var(--theme-primary);
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
    background: var(--theme-background-highlight);
  }
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
