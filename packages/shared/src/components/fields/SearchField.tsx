import type {
  ForwardedRef,
  InputHTMLAttributes,
  MouseEvent,
  ReactElement,
} from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import { useInputField } from '../../hooks/useInputField';
import { BaseField, FieldInput } from './common';
import { SearchIcon, MiniCloseIcon as CloseIcon, ArrowIcon } from '../icons';
import type { ButtonProps } from '../buttons/Button';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { getFieldFontColor } from './BaseFieldContainer';
import type { IconProps } from '../Icon';

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
    | 'aria-label'
    | 'aria-haspopup'
    | 'aria-expanded'
    | 'onKeyDown'
    | 'type'
    | 'disabled'
    | 'readOnly'
    | 'aria-describedby'
    | 'autoComplete'
  > {
  inputId: string;
  valueChanged?: (value: string) => void;
  fieldSize?: 'large' | 'medium';
  showIcon?: boolean;
  fieldType?: 'primary' | 'secondary';
  rightButtonProps?: ButtonProps<'button'> | false;
}

const ButtonIcon = ({
  isPrimary,
  ...attrs
}: IconProps & {
  isPrimary: boolean;
}) =>
  isPrimary ? (
    <CloseIcon {...attrs} />
  ) : (
    <ArrowIcon {...attrs} className="rotate-90" />
  );

export const SearchField = forwardRef(function SearchField(
  {
    inputId,
    name,
    value,
    valueChanged,
    placeholder = 'Search',
    fieldSize = 'large',
    readOnly,
    fieldType = 'primary',
    className,
    autoFocus,
    type,
    disabled,
    rightButtonProps = { type: 'button' },
    'aria-describedby': describedBy,
    'aria-label': ariaLabel,
    onBlur: externalOnBlur,
    onFocus: externalOnFocus,
    showIcon = true,
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
  const sizeClass =
    fieldSize === 'medium' ? 'h-10 rounded-12' : 'h-12 rounded-14';

  return (
    <BaseField
      {...props}
      className={classNames(
        'items-center !border !border-border-subtlest-tertiary !bg-background-default',
        sizeClass,
        className,
        { focused },
      )}
      onClick={focusInput}
      data-testid="searchField"
      ref={ref}
    >
      {!!showIcon &&
        (isSecondary && hasInput ? (
          <Button
            aria-label="Clear input text"
            className="mr-2"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Tertiary}
            title="Clear query"
            onClick={onClearClick}
            icon={
              <CloseIcon className="icon text-lg group-hover:text-text-primary" />
            }
            disabled={!hasInput}
          />
        ) : (
          <SearchIcon
            aria-hidden
            className="icon mr-2 text-2xl"
            role="presentation"
            secondary={focused}
            style={{
              color:
                focused || hasInput
                  ? 'var(--theme-text-primary)'
                  : 'var(--field-placeholder-color)',
            }}
          />
        ))}
      <FieldInput
        aria-label={ariaLabel}
        disabled={disabled}
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
          sizeClass,
          getFieldFontColor({ readOnly, disabled, hasInput, focused }),
        )}
        required
      />
      {((hasInput && isPrimary) || isSecondary) && !!rightButtonProps && (
        <Button
          {...rightButtonProps}
          variant={isSecondary ? ButtonVariant.Primary : ButtonVariant.Tertiary}
          size={rightButtonProps.size || ButtonSize.XSmall}
          title={rightButtonProps.title || 'Clear query'}
          onClick={
            rightButtonProps.type !== 'submit'
              ? onClearClick
              : rightButtonProps.onClick
          }
          icon={
            <ButtonIcon aria-hidden role="presentation" isPrimary={isPrimary} />
          }
          disabled={rightButtonProps?.disabled || !hasInput}
        />
      )}
    </BaseField>
  );
});
