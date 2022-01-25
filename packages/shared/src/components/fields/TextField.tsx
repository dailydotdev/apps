import React, {
  InputHTMLAttributes,
  ReactElement,
  SyntheticEvent,
  useEffect,
  useState,
} from 'react';
import classNames from 'classnames';
import { useInputField } from '../../hooks/useInputField';
import { BaseField, FieldInput } from './common';
import styles from './TextField.module.css';

type FieldType = 'primary' | 'secondary' | 'tertiary';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  inputId: string;
  label: string;
  saveHintSpace?: boolean;
  hint?: string;
  valid?: boolean;
  validityChanged?: (valid: boolean) => void;
  valueChanged?: (value: string) => void;
  compact?: boolean;
  fieldType?: FieldType;
}

export function TextField({
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
  style,
  fieldType = 'primary',
  readOnly,
  ...props
}: TextFieldProps): ReactElement {
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

  const clearIdleTimeout = () => {
    if (idleTimeout) {
      clearTimeout(idleTimeout);
      setIdleTimeout(null);
    }
  };

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
    const inputValidity = inputRef.current.checkValidity();
    if (inputValidity) {
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
    if (fieldType === 'tertiary') {
      return focused ? placeholder : label;
    }

    if (focused || compact) {
      return placeholder ?? '';
    }
    return label;
  };

  const showLabel = focused || hasInput;
  const invalid = validInput === false;
  return (
    <div
      className={classNames(className, 'flex flex-col items-stretch')}
      style={style}
    >
      {compact && (
        <label
          className="px-2 mb-1 font-bold text-theme-label-primary typo-caption1"
          htmlFor={inputId}
        >
          {label}
        </label>
      )}
      <BaseField
        data-testid="field"
        onClick={focusInput}
        className={classNames(
          compact ? 'h-9 rounded-10' : 'h-12 rounded-14',
          {
            focused,
            invalid,
          },
          styles.field,
        )}
      >
        <div className="flex flex-col flex-1 items-start max-w-full">
          {!compact && fieldType !== 'tertiary' && (
            <label
              className={classNames('typo-caption1', !showLabel && 'hidden')}
              style={{
                color: focused
                  ? 'var(--theme-label-primary)'
                  : 'var(--field-placeholder-color)',
              }}
              htmlFor={inputId}
            >
              {label}
            </label>
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
            readOnly={readOnly}
            className={classNames(
              'self-stretch',
              readOnly && 'text-theme-label-quaternary',
            )}
            {...props}
          />
        </div>
        {maxLength && (
          <div
            className="ml-2 font-bold typo-callout"
            style={{ color: 'var(--field-placeholder-color)' }}
          >
            {maxLength - inputLength}
          </div>
        )}
      </BaseField>
      {(hint?.length || saveHintSpace) && (
        <div
          role={invalid ? 'alert' : undefined}
          className={classNames(
            'mt-1 px-2 typo-caption1',
            saveHintSpace && 'h-4',
            invalid ? 'text-theme-status-error' : 'text-theme-label-tertiary',
          )}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
