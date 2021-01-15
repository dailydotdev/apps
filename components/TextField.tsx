import React, {
  HTMLAttributes,
  InputHTMLAttributes,
  ReactElement,
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import {
  size05,
  size1,
  size1px,
  size2,
  size3,
  size9,
  sizeN,
} from '../styles/sizes';
import { typoCallout, typoCaption1 } from '../styles/typography';

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

const Input = styled.input`
  width: 100%;
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

const CharsCount = styled.div`
  margin: 0 0 0 ${size2};
  font-weight: bold;
  ${typoCallout}
`;

const Hint = styled.div<{ valid?: boolean; saveHintSpace?: boolean }>`
  ${({ saveHintSpace }) => (saveHintSpace ? 'height: 1rem' : '')};
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

interface FieldProps extends HTMLAttributes<HTMLDivElement> {
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
        background: transparent;
        border-color: ${borderColor};
        ${insetShadow(borderColor)}

        ${Label} {
          color: var(--theme-label-primary);
        }

        ${Input}::placeholder {
          color: var(--theme-label-quaternary);
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

const Field = styled.div<FieldProps>`
  display: flex;
  height: ${({ compact }) => (compact ? size9 : sizeN(12))};
  padding: 0 ${size3};
  align-items: center;
  overflow: hidden;
  background: var(--theme-float);
  border: ${size1px} solid transparent;
  border-radius: ${({ compact }) => (compact ? sizeN(2.5) : sizeN(3.5))};
  cursor: text;

  ${({ focused, valid }) => applyFocusAndValid(focused, valid)}

  &:hover {
    background: var(--theme-hover);
    ${({ valid }) =>
      valid !== false && insetShadow('var(--theme-label-primary)')}

    ${Input}:not(:focus)::placeholder {
      color: var(--theme-label-primary);
    }
  }

  ${Label} {
    display: ${({ showLabel }) => (showLabel ? 'block' : 'none')};
  }

  ${Label}, ${Input}::placeholder, ${CharsCount} {
    color: var(--theme-label-tertiary);
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState<boolean>(false);
  const [hasInput, setHasInput] = useState<boolean>(false);
  const [inputLength, setInputLength] = useState<number>(0);
  const [validInput, setValidInput] = useState<boolean>(undefined);
  const [idleTimeout, setIdleTimeout] = useState<number>(undefined);

  // Return the clearIdleTimeout to call it on cleanup
  useEffect(() => clearIdleTimeout, []);

  useEffect(() => {
    if (value) {
      inputRef.current.value = value.toString();
      inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, [value]);

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

  const onFocus = () => setFocused(true);
  const onBlur = () => {
    clearIdleTimeout();
    setFocused(false);
    if (inputRef.current) {
      setValidInput(inputRef.current.checkValidity());
    }
  };

  const onInput = (
    event: SyntheticEvent<HTMLInputElement, InputEvent>,
  ): void => {
    clearIdleTimeout();
    if (valueChanged) {
      valueChanged(event.currentTarget.value);
    }
    const len = event.currentTarget.value.length;
    setInputLength(len);
    if (!hasInput && len) {
      setHasInput(true);
    } else if (hasInput && !len) {
      setHasInput(false);
    }
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

  const focusInput = () => {
    inputRef.current.focus();
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
      >
        <InputContainer>
          {!compact && <Label htmlFor={inputId}>{label}</Label>}
          <Input
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
