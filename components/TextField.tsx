import React, {
  HTMLAttributes,
  ReactElement,
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { size1, size2, size3, sizeN } from '../styles/sizes';
import { typoLil1, typoMicro1, typoMicro2 } from '../styles/typography';
import { colorKetchup30, colorWater60 } from '../styles/colors';

export interface Props extends HTMLAttributes<HTMLInputElement> {
  inputId: string;
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  value?: string;
  saveHintSpace?: boolean;
  hint?: string;
  valid?: boolean;
  validityChanged?: (valid: boolean) => void;
  valueChanged?: (value: string) => void;
  pattern?: string;
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
  margin: 0 ${size1} 0 ${size3};
`;

const Label = styled.label`
  color: var(--theme-secondary);
  ${typoMicro2}
`;

const Input = styled.input`
  width: 100%;
  min-width: 0;
  padding: 0;
  border: none;
  background: none;
  color: var(--theme-primary);
  caret-color: ${colorWater60};
  ${typoMicro1}

  &:focus {
    outline: 0;
  }

  &::placeholder {
    color: var(--theme-secondary);
  }
`;

const CharsCount = styled.div`
  margin: 0 ${size3} 0 ${size1};
  color: var(--theme-secondary);
  ${typoLil1}
`;

const Hint = styled.div<{ valid?: boolean; saveHintSpace?: boolean }>`
  ${({ saveHintSpace }) => (saveHintSpace ? 'height: 1.125rem' : '')};
  margin-top: ${size1};
  padding: 0 ${size2};
  ${({ valid }) =>
    valid === false
      ? `color: ${colorKetchup30};`
      : `
  color: var(--theme-secondary);
  align-self: flex-end;
  `}
  ${typoMicro2}
`;

interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  focused: boolean;
  showLabel: boolean;
  valid: boolean;
}

const Field = styled.div<FieldProps>`
  display: flex;
  height: ${sizeN(14)};
  padding: 0 ${size1};
  align-items: center;
  overflow: hidden;
  background: var(--theme-hover);
  border-radius: ${size2};
  cursor: text;
  ${({ focused, valid }) =>
    (focused || valid === false) &&
    `box-shadow: inset 0.125rem 0 0 0 ${
      valid === false ? colorKetchup30 : 'var(--theme-primary)'
    };`}

  &:hover {
    background: var(--theme-focus);
  }

  ${Label} {
    display: ${({ showLabel }) => (showLabel ? 'block' : 'none')};
    ${({ focused, valid }) =>
      (valid === false && `color: ${colorKetchup30};`) ||
      (focused && 'color: var(--theme-primary);')}
  }
`;

export default function TextField({
  className,
  inputId,
  name,
  label,
  type = 'text',
  autoFocus = false,
  required = false,
  maxLength,
  value,
  saveHintSpace = false,
  hint,
  valid,
  validityChanged,
  valueChanged,
  pattern,
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
      inputRef.current.value = value;
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
        setTimeout(() => {
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
    if (focused) {
      return '';
    }
    return label;
  };

  return (
    <Container className={className}>
      <Field
        data-testid="field"
        onClick={focusInput}
        focused={focused}
        showLabel={focused || hasInput}
        valid={validInput}
      >
        <InputContainer>
          <Label htmlFor={inputId}>{label}</Label>
          <Input
            placeholder={getPlaceholder()}
            name={name}
            id={inputId}
            ref={inputRef}
            onFocus={onFocus}
            onBlur={onBlur}
            onInput={onInput}
            type={type}
            autoFocus={autoFocus}
            required={required}
            maxLength={maxLength}
            pattern={pattern}
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
