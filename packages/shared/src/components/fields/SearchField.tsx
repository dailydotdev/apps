import React, {
  InputHTMLAttributes,
  ReactElement,
  MouseEvent,
  forwardRef,
  ForwardedRef,
} from 'react';
import classNames from 'classnames';
import { useInputField } from '../../hooks/useInputField';
import { BaseField, FieldInput } from './common';
import MagnifyingOutlineIcon from '../../../icons/outline/magnifying.svg';
import MagnifyingFilledIcon from '../../../icons/filled/magnifying.svg';
import XIcon from '../../../icons/x.svg';
import ArrowIcon from '../../../icons/arrow.svg';
import { Button } from '../buttons/Button';

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
  fieldType?: 'primary' | 'secondary';
  rightButtonDisabled?: boolean;
  rightButtonType?: 'submit' | 'reset' | 'button';
}

export const SearchField = forwardRef(function SearchField(
  {
    inputId,
    name,
    value,
    valueChanged,
    placeholder = 'Search',
    compact = false,
    showIcon = true,
    fieldType = 'primary',
    className,
    style,
    autoFocus,
    type,
    rightButtonType = 'button',
    rightButtonDisabled,
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

  const isPrimary = fieldType === 'primary';
  const isSecondary = fieldType === 'secondary';
  const SearchIcon = focused ? MagnifyingFilledIcon : MagnifyingOutlineIcon;
  const buttonIcon = isPrimary ? (
    <XIcon className="text-lg icon group-hover:text-theme-label-primary" />
  ) : (
    <ArrowIcon style={{ transform: 'rotate(90deg)' }} />
  );

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
        <SearchIcon
          className="mr-2 text-2xl icon"
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
        className={classNames(
          'flex-1',
          !hasInput && 'text-theme-label-quaternary',
        )}
        required
      />
      {((hasInput && isPrimary) || isSecondary) && (
        <Button
          type={rightButtonType}
          className={isSecondary ? 'btn-primary' : 'btn-tertiary'}
          buttonSize="xsmall"
          title="Clear query"
          onClick={rightButtonType !== 'submit' && onClearClick}
          icon={buttonIcon}
          disabled={rightButtonDisabled || !hasInput}
        />
      )}
    </BaseField>
  );
});
