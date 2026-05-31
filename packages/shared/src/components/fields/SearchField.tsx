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
import { IconSize } from '../Icon';

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
  } = useInputField(value as string | number | readonly string[], valueChanged);

  const onClearClick = (event: MouseEvent): void => {
    event.stopPropagation();
    setInput('');
  };

  const isPrimary = fieldType === 'primary';
  const isSecondary = fieldType === 'secondary';
  const isMedium = fieldSize === 'medium';
  const sizeClass = isMedium ? 'h-10 rounded-12' : 'h-12 rounded-14';
  // Mirror the TextField icon/gap scale so a search field lines up with the
  // other fields and a button of the same height.
  const searchIconSize = isMedium ? IconSize.Small : IconSize.Medium;
  const gapClass = isMedium ? 'gap-1' : 'gap-1.5';

  return (
    <BaseField
      {...props}
      className={classNames(
        'items-center !border !border-border-subtlest-secondary !bg-background-default',
        // The base `.field:hover` background is blocked by `!bg-background-default`,
        // so the search field needs its own hover feedback. Brighten the border and
        // tint the surface, scoped to `:not(.focused)` so it never overrides the
        // focus ring while the field is active.
        '[&:hover:not(.focused)]:!border-border-subtlest-primary [&:hover:not(.focused)]:!bg-surface-hover',
        gapClass,
        sizeClass,
        className,
        disabled && 'pointer-events-none opacity-32',
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
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Tertiary}
            title="Clear query"
            onClick={onClearClick}
            icon={<CloseIcon className="icon group-hover:text-text-primary" />}
            disabled={!hasInput}
          />
        ) : (
          <SearchIcon
            aria-hidden
            className="icon"
            role="presentation"
            size={searchIconSize}
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
