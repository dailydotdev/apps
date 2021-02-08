import styled from '@emotion/styled';
import { typoCallout } from '../../styles/typography';
import sizeN from '../../macros/sizeN.macro';
import rem from '../../macros/rem.macro';

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

export const BaseField = styled.div`
  display: flex;
  padding: 0 ${sizeN(3)};
  align-items: center;
  overflow: hidden;
  background: var(--theme-float);
  border: ${rem(1)} solid transparent;
  cursor: text;
  --field-placeholder-color: var(--theme-label-tertiary);

  &:hover {
    background: var(--theme-hover);
    --field-placeholder-color: var(--theme-label-primary);
  }

  &.focused {
    background: transparent;
    border-color: var(--theme-label-primary);
    --field-placeholder-color: var(--theme-label-quaternary);
  }

  ${FieldInput}::placeholder {
    color: var(--field-placeholder-color);
  }
`;
