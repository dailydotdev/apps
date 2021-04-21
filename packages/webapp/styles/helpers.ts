import sizeN from '../macros/sizeN.macro';

export const focusOutline = `
  &:focus {
    outline: 0;

    &.focus-visible {
      box-shadow: 0 0 0 ${sizeN(0.5)} var(--theme-focus);
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
