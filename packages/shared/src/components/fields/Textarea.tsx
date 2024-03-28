import classNames from 'classnames';
import React, { ReactElement } from 'react';
import styles from './TextField.module.css';
import useInputFieldFunctions from '../../hooks/useInputFieldFunctions';
import BaseFieldContainer, {
  BaseFieldProps,
  FieldClassName,
  getFieldFontColor,
  getFieldPlaceholder,
  InnerLabel,
} from './BaseFieldContainer';

function Textarea({
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
  ...props
}: BaseFieldProps<HTMLTextAreaElement> & {
  className?: FieldClassName;
}): ReactElement {
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
  const invalid = validInput === false;
  const hasAdditionalSpacing = isPrimaryField && !focused && !hasInput;

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
          className.baseField,
          hasAdditionalSpacing ? 'pt-2' : 'pt-1',
        ),
      }}
    >
      {isPrimaryField && (focused || hasInput) && (
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
          placeholder,
          focused,
          label,
        })}
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
      <span className="ml-auto py-2 text-text-quaternary typo-caption1">
        {`${inputLength}/${maxLength}`}
      </span>
    </BaseFieldContainer>
  );
}

export default Textarea;
