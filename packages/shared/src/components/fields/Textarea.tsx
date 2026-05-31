import classNames from 'classnames';
import React, { forwardRef } from 'react';
import type { ForwardedRef, ReactElement } from 'react';
import styles from './TextField.module.css';
import useInputFieldFunctions from '../../hooks/useInputFieldFunctions';
import type { BaseFieldProps, FieldClassName } from './BaseFieldContainer';
import BaseFieldContainer, {
  getFieldFontColor,
  getFieldPlaceholder,
  InnerLabel,
} from './BaseFieldContainer';
import { FieldVariant, fieldVariantToClassName } from './fieldVariants';

function Textarea(
  {
    hint,
    inputId,
    saveHintSpace,
    label,
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
    variant = FieldVariant.Filled,
    ...props
  }: BaseFieldProps<HTMLTextAreaElement> & {
    className?: FieldClassName;
    variant?: FieldVariant;
  },
  ref: ForwardedRef<HTMLTextAreaElement>,
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
  } = useInputFieldFunctions<HTMLTextAreaElement>({
    value,
    valueChanged,
    valid,
    validityChanged,
  });
  const isPrimaryField = fieldType === 'primary';
  const isSecondaryField = fieldType === 'secondary';
  const isTertiaryField = fieldType === 'tertiary';
  const isQuaternaryField = fieldType === 'quaternary';
  const invalid = validInput === false;
  // A "title inside" caption only appears for a primary field that has a label.
  // When it can't appear, nothing reserves the top, so the content should sit
  // with equal padding on every side instead of the tight floating-label top.
  const hasInnerLabel = isPrimaryField && !!label;
  const hasAdditionalSpacing = hasInnerLabel && !focused && !hasInput;
  const getPaddingClass = (): string => {
    if (!hasInnerLabel) {
      return 'py-4';
    }
    return hasAdditionalSpacing ? 'pt-2' : 'pt-1';
  };

  return (
    <BaseFieldContainer
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
        baseField: classNames(
          'flex-col',
          styles.field,
          fieldVariantToClassName[variant],
          className.baseField,
          // With an inner label, keep the tight floating-label top; without one,
          // pad every side equally (matches the 16px horizontal inset).
          getPaddingClass(),
        ),
      }}
    >
      {hasInnerLabel && (focused || hasInput) && (
        <InnerLabel
          inputId={inputId}
          label={label}
          className={className.innerLabel}
          readOnly={readOnly}
          isLocked={isLocked}
          hasInput={hasInput}
          disabled={disabled}
          focused={focused}
        />
      )}
      <textarea
        {...props}
        placeholder={getFieldPlaceholder({
          isSecondaryField,
          isTertiaryField,
          isQuaternaryField,
          placeholder,
          focused,
          label,
        })}
        name={name}
        id={inputId}
        ref={(element: HTMLTextAreaElement | null) => {
          inputRef.current = element as HTMLTextAreaElement;

          if (typeof ref === 'function') {
            ref(element);
          } else if (ref) {
            // eslint-disable-next-line no-param-reassign
            ref.current = element;
          }
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        onInput={onInput}
        maxLength={maxLength}
        readOnly={readOnly}
        rows={rows}
        className={classNames(
          'w-full min-w-0 resize-none self-stretch bg-transparent caret-text-link typo-body focus:outline-none',
          className.input,
          hasAdditionalSpacing && 'mb-3',
          getFieldFontColor({
            readOnly,
            disabled,
            hasInput,
            focused,
          }),
        )}
      />
      <span
        className={classNames(
          'ml-auto text-text-quaternary typo-caption1',
          // With the tight top, the counter carries the bottom inset (py-2).
          // With symmetric padding the field already pads the bottom, so the
          // counter only needs a small gap above it.
          hasInnerLabel ? 'py-2' : 'mt-2',
        )}
      >
        {`${inputLength || 0}/${maxLength}`}
      </span>
    </BaseFieldContainer>
  );
}

export default forwardRef(Textarea);
