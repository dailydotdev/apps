import React, {
  InputHTMLAttributes,
  ReactElement,
  ReactNode,
  SyntheticEvent,
  useEffect,
  useState,
} from 'react';
import classNames from 'classnames';
import { passwordStrength } from 'check-password-strength';
import { useInputField } from '../../hooks/useInputField';
import { BaseField, FieldInput } from './common';
import styles from './TextField.module.css';
import { ButtonProps } from '../buttons/Button';
import useDebounce from '../../hooks/useDebounce';
import { IconProps } from '../Icon';
import EyeIcon from '../icons/Eye';
import EyeCancelIcon from '../icons/EyeCancel';

type FieldType = 'primary' | 'secondary' | 'tertiary';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  inputId: string;
  label: string;
  saveHintSpace?: boolean;
  absoluteLabel?: boolean;
  hint?: string;
  valid?: boolean;
  validityChanged?: (valid: boolean) => void;
  valueChanged?: (value: string) => void;
  fieldType?: FieldType;
  leftIcon?: ReactNode;
  actionButton?: React.ReactElement<ButtonProps<'button'>>;
  rightIcon?: React.ReactElement<IconProps>;
}

interface InputFontColorProps {
  readOnly?: boolean;
  disabled?: boolean;
  focused?: boolean;
  hasInput?: boolean;
  actionIcon?: React.ReactElement<IconProps>;
}

const passwordStrengthStates = {
  0: {
    label: 'Risky',
    className: 'text-theme-status-error',
    progress: 'bg-theme-status-error w-1/6',
  },
  1: {
    label: 'Risky',
    className: 'text-theme-status-error',
    progress: 'bg-theme-status-error w-1/6',
  },
  2: {
    label: `You're almost there`,
    className: 'text-theme-status-warning',
    progress: 'bg-theme-status-warning w-1/4',
  },
  3: {
    label: 'Strong as it gets',
    className: 'text-theme-status-success',
    progress: 'bg-theme-status-success w-1/2',
  },
};

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
  absoluteLabel = false,
  type,
  hint,
  valid,
  validityChanged,
  valueChanged,
  placeholder,
  style,
  fieldType = 'primary',
  readOnly,
  leftIcon,
  actionButton,
  disabled,
  rightIcon,
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
  const isPassword = type === 'password';
  const [useType, setUseType] = useState(type);
  const [inputLength, setInputLength] = useState<number>(0);
  const [passwordStrengthLevel, setPasswordStrengthLevel] = useState<number>(0);
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
    if (isPassword) {
      setPasswordStrengthLevel(passwordStrength(event.currentTarget.value).id);
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

  const passwordHint = () => {
    if (invalid) {
      return `Password need a minimum length of ${props.minLength}`;
    }

    return passwordStrengthStates[passwordStrengthLevel].label;
  };

  return (
    <div
      className={classNames(className, 'flex flex-col items-stretch relative')}
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
          'flex flex-row items-center relative',
          isSecondaryField ? 'h-9 rounded-10' : 'h-12 rounded-14',
          leftIcon && 'pl-3',
          actionButton && 'pr-3',
          {
            readOnly,
            focused,
            invalid,
          },
          isPassword && inputLength > 0 && `password-${passwordStrengthLevel}`,
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
                actionIcon: rightIcon,
              }),
            )}
          >
            {leftIcon}
          </span>
        )}
        <div
          className={classNames(
            'flex flex-col flex-1 items-start max-w-full',
            actionButton && 'mr-2',
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
            type={useType}
            className={classNames(
              'self-stretch',
              getInputFontColor({
                readOnly,
                disabled,
                hasInput,
                focused,
                actionIcon: rightIcon,
              }),
            )}
            disabled={disabled}
            {...props}
          />
          {isPassword && inputLength > 0 && (
            <div
              className={classNames(
                'absolute bottom-0 h-[3px] rounded-10 transition-all',
                passwordStrengthStates[passwordStrengthLevel].progress,
              )}
            />
          )}
        </div>
        {maxLength && (
          <div
            className="ml-2 font-bold typo-callout"
            style={{ color: 'var(--field-placeholder-color)' }}
          >
            {maxLength - inputLength}
          </div>
        )}
        {isPassword && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setUseType((_type) =>
                _type === 'password' ? 'text' : 'password',
              );
            }}
          >
            {useType === 'password' ? <EyeIcon /> : <EyeCancelIcon />}
          </button>
        )}
        {rightIcon}
        {actionButton}
      </BaseField>
      {(hint?.length || saveHintSpace || (isPassword && inputLength > 0)) && (
        <div
          role={invalid ? 'alert' : undefined}
          className={classNames(
            ' px-2 typo-caption1',
            saveHintSpace && 'h-4',
            invalid ? 'text-theme-status-error' : 'text-theme-label-quaternary',
            absoluteLabel ? 'absolute -bottom-5' : 'mt-1',
            isPassword &&
              passwordStrengthStates[passwordStrengthLevel].className,
          )}
        >
          {isPassword ? passwordHint() : hint}
        </div>
      )}
    </div>
  );
}
