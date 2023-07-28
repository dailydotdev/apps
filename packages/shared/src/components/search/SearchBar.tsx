import React, {
  ForwardedRef,
  forwardRef,
  InputHTMLAttributes,
  MouseEvent,
  ReactElement,
} from 'react';
import classNames from 'classnames';
import { useInputField } from '../../hooks/useInputField';
import { AiIcon } from '../icons';
import CloseIcon from '../icons/MiniClose';
import ArrowIcon from '../icons/Arrow';
import { Button, ButtonProps, ButtonSize } from '../buttons/Button';
import { BaseField, FieldInput } from '../fields/common';
import { getFieldFontColor } from '../fields/BaseFieldContainer';
import ConditionalWrapper from '../ConditionalWrapper';
import { RaisedLabel, RaisedLabelType } from '../cards/RaisedLabel';
import styles from '../cards/Card.module.css';

export interface SearchBarProps
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
    // | 'type'
    | 'disabled'
    | 'readOnly'
    | 'aria-describedby'
    | 'autoComplete'
  > {
  inputId: string;
  valueChanged?: (value: string) => void;
  // fieldSize?: 'large' | 'medium';
  showIcon?: boolean;
  // fieldType?: 'primary' | 'secondary';
  rightButtonProps?: ButtonProps<'button'> | false;
  progress?: number;
  completedTime?: string;
}

const ButtonIcon = ({ isPrimary }: { isPrimary: boolean }) =>
  isPrimary ? <CloseIcon /> : <ArrowIcon className="rotate-90" />;

export const SearchBar = forwardRef(function SearchBar(
  {
    inputId,
    name,
    value,
    valueChanged,
    placeholder = 'Ask anything…',
    // fieldSize = 'large',
    readOnly,
    // fieldType = 'primary',
    className,
    autoFocus,
    // type,
    disabled,
    rightButtonProps = { type: 'button' },
    'aria-describedby': describedBy,
    onBlur: externalOnBlur,
    onFocus: externalOnFocus,
    // showIcon = true,
    progress,
    ...props
  }: SearchBarProps,
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

  const onSubmit = (event: MouseEvent): void => {
    event.stopPropagation();
    alert('submitting');
  };

  const seeSearchHistory = (event: MouseEvent): void => {
    event.stopPropagation();
    alert('see search history');
  };

  // const isPrimary = fieldType === 'primary';
  // const isSecondary = fieldType === 'secondary';

  return (
    <ConditionalWrapper
      condition={true}
      wrapper={(children) => (
        <div 
          className={classNames(
            'relative',
            styles.cardContainer,
          )
        }>
          {children}
          <RaisedLabel
            type={RaisedLabelType.Beta}
            description='desc'
          />
        </div>
      )}
    >
      <BaseField
        {...props}
        className={classNames(
          'group relative items-center h-12 rounded-14 border !border-theme-divider-tertiary',
          // fieldSize === 'medium' ? 'h-10 rounded-12' : '',
          className,
          { focused },
        )}
        onClick={focusInput}
        data-testid="searchField"
        ref={ref}
      >
        <Button
          type="button"
          className="mr-2 btn-tertiary"
          buttonSize={ButtonSize.XSmall}
          title="Clear query"
          onClick={onClearClick}
          icon={
            <AiIcon className="text-lg icon group-hover:text-theme-label-primary" />
          }
        />
        <FieldInput
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
          type='primary'
          aria-describedby={describedBy}
          autoComplete="off"
          className={classNames(
            'flex-1',
            getFieldFontColor({ readOnly, disabled, hasInput, focused }),
          )}
          required
        />

        <div className='flex gap-3'>
          {hasInput && (
            <Button
              {...rightButtonProps}
              className='btn-tertiary'
              buttonSize={ButtonSize.XSmall}
              title='Clear query'
              onClick={onClearClick}
              icon={<ButtonIcon isPrimary />}
              disabled={!hasInput}
            />
          )}

          <div className='w-[1px] h-6 bg-[#383D47]' />

          <Button
            {...rightButtonProps}
            className='btn-tertiary'
            buttonSize={ButtonSize.XSmall}
            title='Clear query'
            onClick={seeSearchHistory}
            icon={<ButtonIcon isPrimary />}
            // disabled={!hasInput}
          />
          <Button
            {...rightButtonProps}
            className='btn-primary'
            buttonSize={ButtonSize.XSmall}
            title='Submit'
            onClick={onSubmit}
            icon={<ButtonIcon isPrimary />}
            disabled={!hasInput}
          />
        </div>
      </BaseField>
    </ConditionalWrapper>
  );
});

/*
* TODO
* 1. #383D47 isn't in the system
* 2. how do we do 1px width?
*/
