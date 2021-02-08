/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import {
  InputHTMLAttributes,
  ReactElement,
  SyntheticEvent,
  useEffect,
  useState,
} from 'react';
import styled from '@emotion/styled';
import sizeN from '../../macros/sizeN.macro';
import { typoCallout, typoCaption1 } from '../../styles/typography';
import { useInputField } from '../../lib/useInputField';
import { BaseField, FieldInput } from './common';
import classNames from 'classnames';

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
  margin-bottom: ${sizeN(1)};
  padding: 0 ${sizeN(2)};
  color: var(--theme-label-primary);
  font-weight: bold;
`;

const CharsCount = styled.div`
  margin: 0 0 0 ${sizeN(2)};
  font-weight: bold;
  ${typoCallout}
`;

const Hint = styled.div`
  margin-top: ${sizeN(1)};
  padding: 0 ${sizeN(2)};
  color: var(--theme-label-tertiary);
  ${typoCaption1}

  &[role="alert"] {
    color: var(--theme-status-error);
  }

  &.saveHintSpace {
    height: 1rem;
  }
`;

const insetShadow = (color: string) =>
  `box-shadow: inset ${sizeN(0.5)} 0 0 0 ${color};`;

const Field = styled(BaseField)`
  height: ${sizeN(12)};
  border-radius: ${sizeN(3.5)};

  &:hover {
    ${insetShadow('var(--theme-label-primary)')}
  }

  &.focused {
    border-color: var(--theme-label-primary);
    ${insetShadow('var(--theme-label-primary)')}

    ${Label} {
      color: var(--theme-label-primary);
    }
  }

  &.invalid {
    && {
      ${insetShadow('var(--theme-status-error)')}
    }

    &.focused {
      border-color: var(--theme-status-error);
    }
  }

  ${Label} {
    display: none;

    &.showLabel {
      display: block;
    }
  }

  ${Label}, ${CharsCount} {
    color: var(--field-placeholder-color);
  }

  &.compact {
    height: ${sizeN(9)};
    border-radius: ${sizeN(2.5)};
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

  const showLabel = focused || hasInput;
  return (
    <Container className={className}>
      {compact && <CompactLabel htmlFor={inputId}>{label}</CompactLabel>}
      <Field
        data-testid="field"
        onClick={focusInput}
        className={classNames({
          compact,
          focused,
          invalid: validInput === false,
        })}
      >
        <InputContainer>
          {!compact && (
            <Label className={classNames({ showLabel })} htmlFor={inputId}>
              {label}
            </Label>
          )}
          <FieldInput
            placeholder={getPlaceholder()}
            name={name}
            id={inputId}
            ref={inputRef}
            onFocus={onFocus}
            onBlur={onBlur}
            onInput={onInput}
            maxLength={maxLength}
            css={css`
              align-self: stretch;
            `}
            {...props}
          />
        </InputContainer>
        {maxLength && <CharsCount>{maxLength - inputLength}</CharsCount>}
      </Field>
      {(hint?.length || saveHintSpace) && (
        <Hint
          role={validInput === false ? 'alert' : undefined}
          className={classNames({ saveHintSpace })}
        >
          {hint}
        </Hint>
      )}
    </Container>
  );
}
