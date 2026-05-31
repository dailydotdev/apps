import type {
  ForwardedRef,
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
import type { FieldSize } from './fieldSizes';
import { getFieldSizeTokens } from './fieldSizes';

export interface TextFieldProps extends BaseFieldProps {
  progress?: string;
  leftIcon?: ReactNode;
  rightIcon?: React.ReactElement<IconProps>;
  hintIcon?: ReactElement<IconProps>;
  actionButton?: React.ReactElement<ButtonProps<'button'>>;
  showMaxLength?: boolean;
  inputRef?: (input: HTMLInputElement) => void;
  /**
   * Button-aligned sizing. When set, the field's height, radius, value
   * typography and icon size match a button of the same size exactly, so a
   * field and a button can sit together in one strip and look identical.
   * When omitted, the field keeps its legacy `fieldType`-driven dimensions.
   */
  fieldSize?: FieldSize;
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
    fieldSize,
    isLocked,
    readOnly = isLocked,
    leftIcon,
    actionButton,
    disabled,
    rightIcon,
    required,
    pressed,
    onBlur: onExternalBlur,
    focused: focusedProp,
    inputRef: inputRefProp,
    ...props
  }: TextFieldProps,
  ref: ForwardedRef<HTMLDivElement>,
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
  const sizeTokens = fieldSize ? getFieldSizeTokens(fieldSize) : null;
  const heightClass = sizeTokens?.height ?? (isSecondaryField ? 'h-9' : 'h-12');
  const withIconSize = (node: ReactNode): ReactNode => {
    if (!sizeTokens || !React.isValidElement(node)) {
      return node;
    }
    const element = node as React.ReactElement<IconProps>;
    return React.cloneElement(element, {
      size: element.props.size ?? sizeTokens.iconSize,
    });
  };

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
      fieldSize={fieldSize}
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
          heightClass,
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
          {withIconSize(leftIcon)}
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
            inputRef.current = el as HTMLInputElement;
            if (el) {
              inputRefProp?.(el);
            }
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
            styles.input,
            'self-stretch text-ellipsis',
            sizeTokens?.typo,
            className?.input,
            getFieldFontColor({
              readOnly,
              disabled,
              hasInput: hasValue,
              focused,
              hasActionIcon: !!rightIcon,
            }),
            { pressed },
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
      {withIconSize(rightIcon)}
      {actionButton}
    </BaseFieldContainer>
  );
}

export const TextField = forwardRef(TextFieldComponent);
