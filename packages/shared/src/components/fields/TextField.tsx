import React, {
  InputHTMLAttributes,
  ReactElement,
  ReactNode,
  SyntheticEvent,
  useEffect,
  useState,
} from 'react';
import classNames from 'classnames';
import { useInputField } from '../../hooks/useInputField';
import { BaseField, FieldInput } from './common';
import styles from './TextField.module.css';
import { Button } from '../buttons/Button';
import { IconProps } from '../Icon';
import useDebounce from '../../hooks/useDebounce';

type FieldType = 'primary' | 'secondary' | 'tertiary';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  inputId: string;
  label: string;
  saveHintSpace?: boolean;
  hint?: string;
  valid?: boolean;
  validityChanged?: (valid: boolean) => void;
  valueChanged?: (value: string) => void;
  fieldType?: FieldType;
  leftIcon?: ReactNode;
  actionIcon?: React.ReactElement<IconProps>;
  onActionIconClick?: () => unknown;
}

interface InputFontColorProps {
  readOnly?: boolean;
  disabled?: boolean;
  focused?: boolean;
  hasInput?: boolean;
  actionIcon?: React.ReactElement<IconProps>;
}

export const getInputFontColor = ({
  readOnly,
  disabled,
  focused,
  hasInput,
  actionIcon,
}: InputFontColorProps): string => {
  if (readOnly && actionIcon) {
    return 'text-theme-label-primary';
  }

  if (readOnly) {
    return 'text-theme-label-quaternary';
  }

  if (disabled) {
    return 'text-theme-label-disabled';
  }

  if (focused) {
    return hasInput
      ? 'text-theme-label-primary'
      : 'text-theme-label-quaternary';
  }

  return 'text-theme-label-tertiary hover:text-theme-label-primary';
};

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
  style,
  fieldType = 'primary',
  readOnly,
  leftIcon,
  actionIcon,
  onActionIconClick,
  disabled,
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
  const isPrimaryField = fieldType === 'primary';
  const isSecondaryField = fieldType === 'secondary';
  const isTertiaryField = fieldType === 'tertiary';
  const [inputLength, setInputLength] = useState<number>(0);
  const [validInput, setValidInput] = useState<boolean>(undefined);
  const [idleTimeout, clearIdleTimeout] = useDebounce(() => {
    setValidInput(inputRef.current.checkValidity());
  }, 1500);

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
    if (readOnly) {
      return 'text-theme-label-tertiary';
    }

    return disabled ? 'text-theme-label-disabled' : 'text-theme-label-primary';
  };

  return (
    <div
      className={classNames(className, 'flex flex-col items-stretch')}
      style={style}
    >
      {isSecondaryField && (
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
          'flex flex-row items-center',
          isSecondaryField ? 'h-9 rounded-10' : 'h-12 rounded-14',
          leftIcon && 'pl-3',
          actionIcon && 'pr-3',
          {
            readOnly,
            focused,
            invalid,
          },
          styles.field,
        )}
      >
        {leftIcon && (
          <span
            className={classNames(
              'mr-2',
              getInputFontColor({
                readOnly,
                disabled,
                hasInput,
                focused,
                actionIcon,
              }),
            )}
          >
            {leftIcon}
          </span>
        )}
        <div
          className={classNames(
            'flex flex-col flex-1 items-start max-w-full',
            actionIcon && 'mr-2',
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
              getInputFontColor({
                readOnly,
                disabled,
                hasInput,
                focused,
                actionIcon,
              }),
            )}
            disabled={disabled}
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
        {actionIcon && (
          <Button
            data-testid="textfield-action-icon"
            buttonSize="small"
            className="btn-tertiary"
            onClick={onActionIconClick}
            icon={actionIcon}
          />
        )}
      </BaseField>
      {(hint?.length || saveHintSpace) && (
        <div
          role={invalid ? 'alert' : undefined}
          className={classNames(
            'mt-1 px-2 typo-caption1',
            saveHintSpace && 'h-4',
            invalid ? 'text-theme-status-error' : 'text-theme-label-quaternary',
          )}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
