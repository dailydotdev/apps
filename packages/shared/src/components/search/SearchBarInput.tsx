import React, {
  ForwardedRef,
  forwardRef,
  InputHTMLAttributes,
  MouseEvent,
  ReactElement,
} from 'react';
import classNames from 'classnames';
import {
  RaisedLabel,
  RaisedLabelContainer,
  RaisedLabelType,
} from '../cards/RaisedLabel';
import { BaseField, FieldInput } from '../fields/common';
import { AiIcon, SendAirplaneIcon } from '../icons';
import { IconSize } from '../Icon';
import { getFieldFontColor } from '../fields/BaseFieldContainer';
import { Button, ButtonProps, ButtonSize } from '../buttons/Button';
import CloseIcon from '../icons/MiniClose';
import TimerIcon from '../icons/Timer';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import { useInputField } from '../../hooks/useInputField';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { SearchProgressBar } from './SearchProgressBar';

interface SearchBarClassName {
  container?: string;
  field?: string;
}

export interface SearchBarInputProps {
  valueChanged?: (value: string) => void;
  showIcon?: boolean;
  rightButtonProps?: ButtonProps<'button'> | false;
  completedTime?: string;
  showProgress?: boolean;
  className?: SearchBarClassName;
  onSubmit?: <T>(event: MouseEvent<T>) => void;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
}

function SearchBarInputComponent(
  {
    inputProps = {},
    valueChanged,
    className,
    rightButtonProps = { type: 'button' },
    showProgress = true,
    completedTime,
    onSubmit: handleSubmit,
    ...props
  }: SearchBarInputProps,
  ref: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const {
    readOnly,
    disabled,
    value,
    onFocus: externalOnFocus,
    onBlur: externalOnBlur,
    placeholder = 'Ask anything...',
  } = inputProps;
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
  const { sidebarRendered } = useSidebarRendered();
  const searchHistory = [];
  const progress = 0;

  const onClearClick = (event: MouseEvent): void => {
    event.stopPropagation();
    setInput('');
  };

  const onSubmit = (event: MouseEvent): void => {
    event.stopPropagation();

    if (handleSubmit) {
      handleSubmit(event);
    }

    setInput(null);
  };

  const seeSearchHistory = (event: MouseEvent): void => {
    event.stopPropagation();
  };

  return (
    <RaisedLabelContainer className={className?.container}>
      <BaseField
        {...props}
        className={classNames(
          'relative items-center px-3 h-16 rounded-14 border !border-theme-divider-tertiary !bg-theme-bg-primary',
          className?.field,
          { focused },
        )}
        onClick={sidebarRendered ? focusInput : () => {}}
        data-testid="searchBar"
        ref={ref}
      >
        {sidebarRendered && (
          <AiIcon
            size={IconSize.Large}
            className="mr-3 text-theme-label-tertiary"
          />
        )}
        {!sidebarRendered && (
          <div className="flex-1 text-theme-label-tertiary">{placeholder}</div>
        )}
        {sidebarRendered && (
          <FieldInput
            {...inputProps}
            placeholder={placeholder}
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
            type="primary"
            autoComplete="off"
            className={classNames(
              'flex-1 caret-theme-status-cabbage',
              getFieldFontColor({ readOnly, disabled, hasInput, focused }),
            )}
          />
        )}

        <div className="flex gap-3 items-center">
          {hasInput && (
            <Button
              {...rightButtonProps}
              className="btn-tertiary"
              buttonSize={ButtonSize.Small}
              title="Clear query"
              onClick={onClearClick}
              icon={<CloseIcon />}
              disabled={!hasInput}
            />
          )}
          {sidebarRendered && (
            <div className="h-8 border border-theme-divider-quaternary" />
          )}
          <SimpleTooltip
            content={
              searchHistory.length === 0
                ? 'Your search history is empty'
                : 'See search history'
            }
          >
            <div>
              <Button
                {...rightButtonProps}
                className="btn-tertiary"
                buttonSize={ButtonSize.Small}
                title="Search history"
                onClick={seeSearchHistory}
                icon={<TimerIcon />}
                disabled={searchHistory.length === 0}
              />
            </div>
          </SimpleTooltip>
          {sidebarRendered && (
            <SimpleTooltip
              content={!hasInput && 'Enter text to start searching'}
            >
              <div>
                <Button
                  {...rightButtonProps}
                  className="btn-primary"
                  title="Submit"
                  onClick={onSubmit}
                  icon={<SendAirplaneIcon size={IconSize.Medium} />}
                  disabled={!hasInput}
                />
              </div>
            </SimpleTooltip>
          )}
        </div>
      </BaseField>
      <RaisedLabel type={RaisedLabelType.Beta} />
      {sidebarRendered && showProgress && (
        <div className="mt-6">
          <SearchProgressBar progress={progress} />

          {progress > 0 && progress < 100 && (
            <div className="mt-2 typo-callout text-theme-label-tertiary">
              🚀 Generating answer
            </div>
          )}

          {completedTime && (
            <div className="mt-2 typo-callout text-theme-label-tertiary">
              Done! {completedTime} seconds.
            </div>
          )}
        </div>
      )}
    </RaisedLabelContainer>
  );
}

export const SearchBarInput = forwardRef(SearchBarInputComponent);
