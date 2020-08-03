import styled from 'styled-components';
import { size1, size2, size6 } from '../styles/sizes';
import { colorWater40 } from '../styles/colors';

export const IconButton = styled.button`
  display: flex;
  padding: ${size1};
  color: var(--theme-secondary);
  background: none;
  border: none;
  border-radius: ${size2};
  cursor: pointer;

  .icon {
    width: ${size6};
    height: ${size6};
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
    background: none;
    cursor: default;
  }
`;
