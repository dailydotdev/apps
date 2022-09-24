import classNames from 'classnames';
import React, {
  ReactElement,
  SyntheticEvent,
  useEffect,
  useState,
} from 'react';
import useDebounce from '../../hooks/useDebounce';
import { useInputField } from '../../hooks/useInputField';
import { getInputFontColor } from './TextField';
import { BaseField, TextFieldProps } from './common';

interface ClassName {
  container?: string;
  label?: string;
  input?: string;
  hint?: string;
  baseField?: string;
}

interface TextareaProps
  extends Omit<TextFieldProps<HTMLTextAreaElement>, 'className'> {
  className?: ClassName;
  absoluteHint?: boolean;
}

function Textarea({
  hint,
  inputId,
  saveHintSpace,
  label,
  absoluteHint,
  value,
  valueChanged,
  valid,
  validityChanged,
  className = {},
  placeholder,
  readOnly,
  isLocked,
  disabled,
  name,
  maxLength = 100,
  rows,
  fieldType = 'primary',
}: TextareaProps): ReactElement {
  const {
    inputRef,
    focused,
    hasInput,
    onFocus,
    onBlur: baseOnBlur,
    onInput: baseOnInput,
    focusInput,
  } = useInputField<HTMLTextAreaElement>(value, valueChanged);
  const isPrimaryField = fieldType === 'primary';
  const isSecondaryField = fieldType === 'secondary';
  const isTertiaryField = fieldType === 'tertiary';
  const [inputLength, setInputLength] = useState<number>(0);
  const [validInput, setValidInput] = useState<boolean>(undefined);
  const [idleTimeout, clearIdleTimeout] = useDebounce(() => {
    setValidInput(inputRef.current.checkValidity());
  }, 1500);

  useEffect(() => {
    if (validInput !== undefined) {
      validityChanged?.(validInput);
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
    event: SyntheticEvent<HTMLTextAreaElement, InputEvent>,
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
      idleTimeout();
    }
  };

  const getPlaceholder = () => {
    if (isTertiaryField) {
      return focused ? placeholder : label;
    }

    if (focused || isSecondaryField) {
      return placeholder ?? '';
    }

    return label;
  };

  const invalid = validInput === false;
  const getLabelColor = () => {
    if (readOnly || isLocked || (hasInput && !focused)) {
      return 'text-theme-label-tertiary';
    }

    return disabled ? 'text-theme-label-disabled' : 'text-theme-label-primary';
  };

  const hasAdditionalSpacing = isPrimaryField && !focused && !hasInput;

  return (
    <div className={classNames('flex flex-col', className.container)}>
      {isSecondaryField && (
        <label
          className={classNames(
            'px-2 mb-1 font-bold text-theme-label-primary typo-caption1',
            className.label,
            getLabelColor(),
          )}
          htmlFor={inputId}
        >
          {label}
        </label>
      )}
      <BaseField
        onClick={focusInput}
        className={classNames(
          'flex flex-col relative',
          isSecondaryField ? 'rounded-10' : 'rounded-14',
          { readOnly, focused, invalid },
          hasAdditionalSpacing ? 'pt-2' : 'pt-1',
          className.baseField,
        )}
      >
        {isPrimaryField && (focused || hasInput) && (
          <label
            className={classNames('typo-caption1', getLabelColor())}
            htmlFor={inputId}
          >
            {label}
          </label>
        )}
        <textarea
          placeholder={getPlaceholder()}
          name={name}
          id={inputId}
          ref={inputRef}
          onFocus={onFocus}
          onBlur={onBlur}
          onInput={onInput}
          maxLength={maxLength}
          readOnly={readOnly}
          rows={rows}
          className={classNames(
            'w-full min-w-0 self-stretch bg-transparent typo-body caret-theme-label-link focus:outline-none resize-none',
            className.input,
            hasAdditionalSpacing && 'mb-3',
            getInputFontColor({
              readOnly,
              disabled,
              hasInput,
              focused,
            }),
          )}
        />
        <span className="py-2 ml-auto typo-caption1 text-theme-label-quaternary">
          {`${inputLength}/${maxLength}`}
        </span>
      </BaseField>
      {(hint?.length || saveHintSpace) && (
        <div
          className={classNames(
            ' px-2 typo-caption1',
            saveHintSpace && 'h-4',
            invalid ? 'text-theme-status-error' : 'text-theme-label-quaternary',
            absoluteHint ? 'absolute -bottom-5' : 'mt-1',
            className.hint,
          )}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

export default Textarea;
