import { DOMAttributes } from 'react';
import styled from 'styled-components';
import { size1, size2, size3, size6 } from '../styles/sizes';
import { colorWater40 } from '../styles/colors';
import { typoNuggets } from '../styles/typography';

const BaseButton = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  ${typoNuggets}

  .icon {
    font-size: ${size6};
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
`;

export const IconButton = styled(BaseButton)`
  padding: ${size1};
  color: var(--theme-secondary);
  border-radius: ${size2};

  &[disabled] {
    background: none;
  }
`;

interface FloatButtonProps extends DOMAttributes<HTMLButtonElement> {
  done?: boolean;
}

export const FloatButton = styled(BaseButton)<FloatButtonProps>`
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

  && {
    ${(props) => props.done && 'color: var(--theme-avocado);'}
  }
`;
