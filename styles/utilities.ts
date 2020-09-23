import { colorWater40 } from './colors';

export const focusOutline = `
  &:focus {
    outline: 0;
    box-shadow: 0 0 0 0.125rem ${colorWater40};

    &:not(.focus-visible) {
      box-shadow: none;
    }
  }
`;

export const pageMaxWidth = '40rem';
