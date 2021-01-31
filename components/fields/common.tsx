import styled from '@emotion/styled';
import { typoCallout } from '../../styles/typography';
import { size1px, size3 } from '../../styles/sizes';

export const FieldInput = styled.input`
  min-width: 0;
  padding: 0;
  border: none;
  background: none;
  color: var(--theme-label-primary);
  caret-color: var(--theme-label-link);
  ${typoCallout}

  &:focus {
    outline: 0;
  }
`;

interface FieldProps {
  focused: boolean;
  compact?: boolean;
  hasInput: boolean;
}

const applyFocus = (focused: boolean): string => {
  if (focused) {
    return `
      && {
        background: transparent;
        border-color: var(--theme-label-primary);
        --field-placeholder-color: var(--theme-label-quaternary);
      }
    `;
  }
  return '';
};

export const BaseField = styled.div<FieldProps>`
  display: flex;
  padding: 0 ${size3};
  align-items: center;
  overflow: hidden;
  background: var(--theme-float);
  border: ${size1px} solid transparent;
  cursor: text;
  --field-placeholder-color: var(--theme-label-tertiary);

  ${({ focused }) => applyFocus(focused)}

  &:hover {
    background: var(--theme-hover);
    --field-placeholder-color: var(--theme-label-primary);
  }

  ${FieldInput}::placeholder {
    color: var(--field-placeholder-color);
  }
`;
