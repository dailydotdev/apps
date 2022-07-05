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
import SearchIcon from '../icons/Search';
import CloseIcon from '../icons/Close';
import ArrowIcon from '../icons/Arrow';
import { Button, ButtonProps } from '../buttons/Button';
import { getInputFontColor } from './TextField';

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
    | 'disabled'
    | 'readOnly'
    | 'aria-describedby'
  > {
  inputId: string;
  valueChanged?: (value: string) => void;
  fieldSize?: 'large' | 'medium';
  showIcon?: boolean;
  fieldType?: 'primary' | 'secondary';
  rightButtonProps?: ButtonProps<'button'>;
}

const ButtonIcon = ({ isPrimary }: { isPrimary: boolean }) =>
  isPrimary ? (
    <CloseIcon className="text-lg icon group-hover:text-theme-label-primary" />
  ) : (
    <ArrowIcon className="rotate-90" />
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

  return (
    <BaseField
      {...props}
      className={classNames(
        fieldSize === 'medium' ? 'h-10 rounded-12' : 'h-12 rounded-14',
        className,
        { focused },
      )}
      onClick={focusInput}
      data-testid="searchField"
      ref={ref}
    >
      {isSecondary && hasInput ? (
        <Button
          type="button"
          className="mr-2 btn-tertiary"
          buttonSize="xsmall"
          title="Clear query"
          onClick={onClearClick}
          icon={
            <CloseIcon className="text-lg icon group-hover:text-theme-label-primary" />
          }
          disabled={!hasInput}
        />
      ) : (
        <SearchIcon
          secondary={focused}
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
          getInputFontColor({ readOnly, disabled, hasInput, focused }),
        )}
        required
      />
      {((hasInput && isPrimary) || isSecondary) && (
        <Button
          {...rightButtonProps}
          className={isSecondary ? 'btn-primary' : 'btn-tertiary'}
          buttonSize={rightButtonProps.buttonSize || 'xsmall'}
          title={rightButtonProps.title || 'Clear query'}
          onClick={
            rightButtonProps.type !== 'submit'
              ? onClearClick
              : rightButtonProps.onClick
          }
          icon={<ButtonIcon isPrimary={isPrimary} />}
          disabled={rightButtonProps?.disabled || !hasInput}
        />
      )}
    </BaseField>
  );
});
