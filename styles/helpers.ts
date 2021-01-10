import { size05 } from './sizes';

export const focusOutline = `
  &:focus {
    outline: 0;
    box-shadow: 0 0 0 ${size05} var(--theme-focus);

    &:not(.focus-visible) {
      box-shadow: none;
    }
  }
`;

export const pageMaxWidth = '40rem';

export const multilineTextOverflow = `
  display: block;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;
