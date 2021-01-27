import React, {
  InputHTMLAttributes,
  ReactElement,
  SyntheticEvent,
  useEffect,
  useState,
} from 'react';
import styled from '@emotion/styled';
import { size05, size1, size2, size9, sizeN } from '../../styles/sizes';
import { typoCallout, typoCaption1 } from '../../styles/typography';
import { useInputField } from '../../lib/useInputField';
import { BaseField, FieldInput } from './common';

export interface Props extends InputHTMLAttributes<HTMLInputElement> {
  inputId: string;
  label: string;
  saveHintSpace?: boolean;
  hint?: string;
  valid?: boolean;
  validityChanged?: (valid: boolean) => void;
  valueChanged?: (value: string) => void;
  compact?: boolean;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
`;

const Label = styled.label`
  ${typoCaption1}
`;

const CompactLabel = styled(Label)`
  margin-bottom: ${size1};
  padding: 0 ${size2};
  color: var(--theme-label-primary);
  font-weight: bold;
`;

const CharsCount = styled.div`
  margin: 0 0 0 ${size2};
  font-weight: bold;
  ${typoCallout}
`;

const Hint = styled.div<{ valid?: boolean; saveHintSpace?: boolean }>`
  ${({ saveHintSpace }) => (saveHintSpace ? 'height: 1rem;' : '')}
  margin-top: ${size1};
  padding: 0 ${size2};
  color: var(--theme-label-tertiary);

  ${({ valid }) =>
    valid === false &&
    `&& {
      color: var(--theme-status-error);
    }`}
  ${typoCaption1}
`;

interface FieldProps {
  focused: boolean;
  showLabel: boolean;
  valid: boolean;
  compact?: boolean;
}

const insetShadow = (color: string) =>
  `box-shadow: inset ${size05} 0 0 0 ${color};`;

const applyFocusAndValid = (focused: boolean, valid: boolean): string => {
  const borderColor =
    valid !== false
      ? 'var(--theme-label-primary)'
      : 'var(--theme-status-error)';
  if (focused) {
    return `
      && {
        border-color: ${borderColor};
        ${insetShadow(borderColor)}

        ${Label} {
          color: var(--theme-label-primary);
        }
      }
    `;
  }
  if (valid === false) {
    return `
      && {
        ${insetShadow(borderColor)}
      }
    `;
  }
  return '';
};

const Field = styled(BaseField)<FieldProps>`
  height: ${({ compact }) => (compact ? size9 : sizeN(12))};
  border-radius: ${({ compact }) => (compact ? sizeN(2.5) : sizeN(3.5))};

  ${({ focused, valid }) => applyFocusAndValid(focused, valid)}

  &:hover {
    ${({ valid }) =>
      valid !== false && insetShadow('var(--theme-label-primary)')}
  }

  ${Label} {
    display: ${({ showLabel }) => (showLabel ? 'block' : 'none')};
  }

  ${Label}, ${CharsCount} {
    color: var(--field-placeholder-color);
  }
`;

export default function TextField({
  className,
  inputId,
  name,
  label,
  maxLength,
  value,
  saveHintSpace = false,
  hint,
  valid,
  validityChanged,
  valueChanged,
  placeholder,
  compact = false,
  ...props
}: Props): ReactElement {
  const {
    inputRef,
    focused,
    hasInput,
    onFocus,
    onBlur: baseOnBlur,
    onInput: baseOnInput,
    focusInput,
  } = useInputField(value, valueChanged);
  const [inputLength, setInputLength] = useState<number>(0);
  const [validInput, setValidInput] = useState<boolean>(undefined);
  const [idleTimeout, setIdleTimeout] = useState<number>(undefined);

  // Return the clearIdleTimeout to call it on cleanup
  useEffect(() => clearIdleTimeout, []);

  useEffect(() => {
    if (validityChanged && validInput !== undefined) {
      validityChanged(validInput);
    }
  }, [validInput]);

  useEffect(() => {
    if (validInput !== undefined && valid !== undefined) {
      setValidInput(valid);
    }
  }, [valid]);

  const clearIdleTimeout = () => {
    if (idleTimeout) {
      clearTimeout(idleTimeout);
      setIdleTimeout(null);
    }
  };

  const onBlur = () => {
    clearIdleTimeout();
    baseOnBlur();
    if (inputRef.current) {
      setValidInput(inputRef.current.checkValidity());
    }
  };

  const onInput = (
    event: SyntheticEvent<HTMLInputElement, InputEvent>,
  ): void => {
    clearIdleTimeout();
    baseOnInput(event);
    if (valueChanged) {
      valueChanged(event.currentTarget.value);
    }
    const len = event.currentTarget.value.length;
    setInputLength(len);
    const valid = inputRef.current.checkValidity();
    if (valid) {
      setValidInput(true);
    } else {
      setIdleTimeout(
        window.setTimeout(() => {
          setIdleTimeout(null);
          setValidInput(inputRef.current.checkValidity());
        }, 1500),
      );
    }
  };

  const getPlaceholder = () => {
    if (focused || compact) {
      return placeholder ?? '';
    }
    return label;
  };

  return (
    <Container className={className}>
      {compact && <CompactLabel htmlFor={inputId}>{label}</CompactLabel>}
      <Field
        data-testid="field"
        onClick={focusInput}
        focused={focused}
        showLabel={focused || hasInput}
        valid={validInput}
        compact={compact}
        hasInput={hasInput}
      >
        <InputContainer>
          {!compact && <Label htmlFor={inputId}>{label}</Label>}
          <FieldInput
            placeholder={getPlaceholder()}
            name={name}
            id={inputId}
            ref={inputRef}
            onFocus={onFocus}
            onBlur={onBlur}
            onInput={onInput}
            maxLength={maxLength}
            {...props}
          />
        </InputContainer>
        {maxLength && <CharsCount>{maxLength - inputLength}</CharsCount>}
      </Field>
      {(hint?.length || saveHintSpace) && (
        <Hint
          valid={validInput}
          saveHintSpace={saveHintSpace}
          role={validInput === false ? 'alert' : undefined}
        >
          {hint}
        </Hint>
      )}
    </Container>
  );
}
