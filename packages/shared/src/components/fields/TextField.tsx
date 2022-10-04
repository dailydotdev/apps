import React, {
  forwardRef,
  MutableRefObject,
  ReactElement,
  ReactNode,
} from 'react';
import classNames from 'classnames';
import { FieldInput } from './common';
import styles from './TextField.module.css';
import { IconProps } from '../Icon';
import BaseFieldContainer, {
  BaseFieldProps,
  getFieldFontColor,
  getFieldLabelColor,
  getFieldPlaceholder,
} from './BaseFieldContainer';
import { ButtonProps } from '../buttons/Button';
import useInputFieldFunctions from '../../hooks/useInputFieldFunctions';

export interface TextFieldProps extends BaseFieldProps<HTMLInputElement> {
  progress?: string;
  leftIcon?: ReactNode;
  rightIcon?: React.ReactElement<IconProps>;
  actionButton?: React.ReactElement<ButtonProps<'button'>>;
}

function TextFieldComponent(
  {
    className = {},
    inputId,
    name,
    label,
    maxLength,
    value,
    saveHintSpace = false,
    progress,
    hint,
    valid,
    validityChanged,
    valueChanged,
    placeholder,
    style,
    fieldType = 'primary',
    isLocked,
    readOnly = isLocked,
    leftIcon,
    actionButton,
    disabled,
    rightIcon,
    required,
    ...props
  }: TextFieldProps,
  ref?: MutableRefObject<HTMLDivElement>,
): ReactElement {
  const {
    validInput,
    focused,
    hasInput,
    focusInput,
    inputRef,
    onFocus,
    onBlur,
    onInput,
    inputLength,
  } = useInputFieldFunctions({
    value,
    valueChanged,
    valid,
    validityChanged,
  });
  const isPrimaryField = fieldType === 'primary';
  const isSecondaryField = fieldType === 'secondary';
  const isTertiaryField = fieldType === 'tertiary';
  const invalid = validInput === false || (required && inputLength === 0);

  return (
    <BaseFieldContainer
      ref={ref}
      inputId={inputId}
      invalid={invalid}
      focusInput={focusInput}
      saveHintSpace={saveHintSpace}
      hint={hint}
      fieldType={fieldType}
      readOnly={readOnly}
      isLocked={isLocked}
      hasInput={hasInput}
      disabled={disabled}
      focused={focused}
      label={label}
      className={{
        ...className,
        container: classNames('items-stretch', className.container),
        baseField: classNames(
          'flex-row items-center',
          styles.field,
          className.baseField,
          leftIcon && 'pl-3',
          actionButton && 'pr-3',
          isSecondaryField ? 'h-9' : 'h-12',
        ),
      }}
    >
      {leftIcon && (
        <span
          className={classNames(
            'mr-2',
            getFieldFontColor({
              readOnly,
              disabled,
              hasInput,
              focused,
              isLocked,
              hasActionIcon: !!rightIcon,
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
            className={classNames(
              'typo-caption1',
              getFieldLabelColor({
                readOnly,
                isLocked,
                hasInput,
                focused,
                disabled,
              }),
            )}
            htmlFor={inputId}
          >
            {label}
          </label>
        )}
        <FieldInput
          placeholder={getFieldPlaceholder({
            label,
            focused,
            placeholder,
            isTertiaryField,
            isSecondaryField,
          })}
          name={name}
          id={inputId}
          ref={inputRef}
          onFocus={onFocus}
          onBlur={onBlur}
          onInput={onInput}
          maxLength={maxLength}
          readOnly={readOnly}
          size={1}
          className={classNames(
            'self-stretch',
            getFieldFontColor({
              readOnly,
              disabled,
              hasInput,
              focused,
              hasActionIcon: !!rightIcon,
            }),
          )}
          disabled={disabled}
          required={required}
          {...props}
        />
        {progress && (
          <div
            className={classNames(
              'absolute bottom-0 h-[3px] rounded-10 transition-all',
              progress,
            )}
          />
        )}
      </div>
      {maxLength && (
        <div
          className="ml-2 font-bold typo-callout"
          style={{ color: 'var(--field-placeholder-color)' }}
        >
          {maxLength - (inputLength || 0)}
        </div>
      )}
      {rightIcon}
      {actionButton}
    </BaseFieldContainer>
  );
}

export const TextField = forwardRef(TextFieldComponent);
