import { DOMAttributes } from 'react';
import styled from 'styled-components';
import { size1, size2, size3, size5, size6 } from '../styles/sizes';
import { colorWater40 } from '../styles/colors';
import { typoNuggets } from '../styles/typography';

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

const BaseButton = styled.button<BaseButtonProps>`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  ${typoNuggets}

  .icon {
    ${(props) => `font-size: ${getIconSize(props.size)};`}
  }

  &:hover {
    color: var(--theme-primary);
    background: var(--theme-hover);
  }

  &:focus {
    outline: 0;
    border: solid 0.125rem ${colorWater40};

    &:not(.focus-visible) {
      border: none;
    }
  }

  &:active {
    color: var(--theme-primary);
    background: var(--theme-focus);
  }

  &[disabled] {
    color: var(--theme-disabled);
    cursor: default;
  }

  && {
    ${(props) => props.done && 'color: var(--theme-avocado);'}
  }
`;

export const IconButton = styled(BaseButton)`
  padding: ${size1};
  color: var(--theme-secondary);
  border-radius: ${size2};

  &[disabled] {
    background: none;
  }
`;

export const FloatButton = styled(BaseButton)`
  padding: ${size1} ${size3};
  color: var(--theme-secondary);
  border-radius: ${size1};

  .icon {
    margin-left: -${size1};
    margin-right: ${size2};
  }

  &[disabled] {
    background: var(--theme-background-highlight);
  }
`;
