import React, {
  InputHTMLAttributes,
  ReactElement,
  MouseEvent,
  forwardRef,
  ForwardedRef,
  ReactNode,
} from 'react';
import classNames from 'classnames';
import { useInputField } from '../../hooks/useInputField';
import { BaseField, FieldInput } from './common';
import MagnifyingIcon from '../../../icons/magnifying.svg';
import XIcon from '../../../icons/x.svg';

export interface SearchFieldProps
  extends Pick<
    InputHTMLAttributes<HTMLInputElement>,
    | 'placeholder'
    | 'value'
    | 'className'
    | 'style'
    | 'name'
    | 'autoFocus'
    | 'onBlur'
    | 'onFocus'
    | 'aria-haspopup'
    | 'aria-expanded'
    | 'onKeyDown'
    | 'type'
    | 'aria-describedby'
  > {
  inputId: string;
  valueChanged?: (value: string) => void;
  compact?: boolean;
  showIcon?: boolean;
  rightChildren?: ReactNode;
}

export const SearchField = forwardRef(function SearchField(
  {
    inputId,
    name,
    value,
    valueChanged,
    placeholder,
    compact = false,
    showIcon = true,
    rightChildren,
    className,
    style,
    autoFocus,
    type,
    'aria-describedby': describedBy,
    onBlur: externalOnBlur,
    onFocus: externalOnFocus,
    ...props
  }: SearchFieldProps,
  ref: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const {
    inputRef,
    focused,
    hasInput,
    onFocus,
    onBlur,
    onInput,
    focusInput,
    setInput,
  } = useInputField(value, valueChanged);

  const onClearClick = (event: MouseEvent): void => {
    event.stopPropagation();
    setInput(null);
  };

  return (
    <BaseField
      {...props}
      className={classNames(compact ? 'h-10' : 'h-12', className)}
      style={{ ...style, borderRadius: compact ? '0.75rem' : '0.875rem' }}
      onClick={focusInput}
      data-testid="searchField"
      ref={ref}
    >
      {showIcon && (
        <MagnifyingIcon
          className="icon text-2xl mr-2"
          style={{
            color:
              focused || hasInput
                ? 'var(--theme-label-primary)'
                : 'var(--field-placeholder-color)',
          }}
        />
      )}
      <FieldInput
        placeholder={placeholder}
        name={name}
        id={inputId}
        ref={inputRef}
        onFocus={(event) => {
          onFocus();
          externalOnFocus?.(event);
        }}
        onBlur={(event) => {
          onBlur();
          externalOnBlur?.(event);
        }}
        onInput={onInput}
        autoFocus={autoFocus}
        type={type}
        aria-describedby={describedBy}
        autoComplete="off"
        className="flex-1"
        required
      />
      {rightChildren || (
        <button
          type="button"
          title="Clear query"
          onClick={onClearClick}
          className={classNames(
            'group flex w-8 h-8 items-center justify-center ml-1 bg-transparent cursor-pointer focus-outline',
            { invisible: !hasInput },
          )}
        >
          <XIcon className="icon text-lg text-theme-label-tertiary group-hover:text-theme-label-primary" />
        </button>
      )}
    </BaseField>
  );
});
