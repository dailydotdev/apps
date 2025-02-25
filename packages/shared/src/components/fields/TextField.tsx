import type {
  MutableRefObject,
  ReactElement,
  ReactNode,
  SyntheticEvent,
} from 'react';
import React, { forwardRef, useId } from 'react';
import classNames from 'classnames';
import { FieldInput } from './common';
import styles from './TextField.module.css';
import type { IconProps } from '../Icon';
import type { BaseFieldProps } from './BaseFieldContainer';
import BaseFieldContainer, {
  getFieldFontColor,
  getFieldLabelColor,
  getFieldPlaceholder,
} from './BaseFieldContainer';
import type { ButtonProps } from '../buttons/Button';
import useInputFieldFunctions from '../../hooks/useInputFieldFunctions';

export interface TextFieldProps extends BaseFieldProps {
  progress?: string;
  leftIcon?: ReactNode;
  rightIcon?: React.ReactElement<IconProps>;
  hintIcon?: ReactElement<IconProps>;
  actionButton?: React.ReactElement<ButtonProps<'button'>>;
  showMaxLength?: boolean;
  inputRef?: (input: HTMLInputElement) => void;
}

function TextFieldComponent(
  {
    className = {},
    inputId,
    name,
    label,
    maxLength,
    showMaxLength = true,
    value,
    saveHintSpace = false,
    progress,
    hint,
    hintIcon,
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
    onBlur: onExternalBlur,
    focused: focusedProp,
    inputRef: inputRefProp,
    ...props
  }: TextFieldProps,
  ref?: MutableRefObject<HTMLDivElement>,
): ReactElement {
  const {
    validInput,
    focused: focusedHook,
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
  const focused = focusedProp || focusedHook;
  const isPrimaryField = fieldType === 'primary';
  const isSecondaryField = fieldType === 'secondary';
  const isTertiaryField = fieldType === 'tertiary';
  const invalid = validInput === false || (required && inputLength === 0);
  const hasValue = hasInput || !!inputRef?.current?.value?.length;
  const id = useId();

  return (
    <BaseFieldContainer
      ref={ref}
      inputId={inputId}
      invalid={invalid}
      focusInput={focusInput}
      saveHintSpace={saveHintSpace}
      hint={hint}
      hintIcon={hintIcon}
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
          'flex max-w-full flex-1 flex-col items-start',
          actionButton && 'mr-2',
        )}
      >
        {isPrimaryField && (focusedHook || hasValue) && (
          <label
            className={classNames(
              'typo-caption1',
              getFieldLabelColor({
                readOnly,
                isLocked,
                hasInput: hasValue,
                focused,
                disabled,
                isPrimaryField: true,
              }),
            )}
            htmlFor={inputId.concat(id)}
          >
            {label}
          </label>
        )}
        <FieldInput
          placeholder={getFieldPlaceholder({
            label,
            focused: focusedHook,
            placeholder,
            isTertiaryField,
            isSecondaryField,
          })}
          name={name}
          id={inputId.concat(id)}
          ref={(el) => {
            inputRef.current = el;
            inputRefProp?.(el);
          }}
          onFocus={onFocus}
          onBlur={(e) => {
            if (onExternalBlur) {
              onExternalBlur(e);
            }
            onBlur();
          }}
          maxLength={maxLength}
          readOnly={readOnly}
          size={1}
          className={classNames(
            'self-stretch text-ellipsis',
            className?.input,
            getFieldFontColor({
              readOnly,
              disabled,
              hasInput: hasValue,
              focused,
              hasActionIcon: !!rightIcon,
            }),
          )}
          disabled={disabled}
          required={required}
          {...props}
          onInput={(e: SyntheticEvent<HTMLInputElement, InputEvent>) => {
            onInput(e);
            if (props.onInput) {
              props.onInput(e);
            }
          }}
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
      {maxLength && showMaxLength && (
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
