import React, {
  ForwardedRef,
  forwardRef,
  InputHTMLAttributes,
  MouseEvent,
  ReactElement,
  useState,
  useContext,
} from 'react';
import classNames from 'classnames';
import { useInputField } from '../../hooks/useInputField';
import { AiIcon, SendAirplaneIcon } from '../icons';
import CloseIcon from '../icons/MiniClose';
import { Button, ButtonProps, ButtonSize } from '../buttons/Button';
import { BaseField, FieldInput } from '../fields/common';
import { getFieldFontColor } from '../fields/BaseFieldContainer';
import {
  RaisedLabel,
  RaisedLabelContainer,
  RaisedLabelType,
} from '../cards/RaisedLabel';
import TimerIcon from '../icons/Timer';
import { IconSize } from '../Icon';
import { SearchProgressBar } from './SearchProgressBar';
import {
  SearchBarSuggestion,
  SearchBarSuggestionProps,
} from './SearchBarSuggestion';
import AuthContext from '../../contexts/AuthContext';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import useSidebarRendered from '../../hooks/useSidebarRendered';

export interface SearchBarProps
  extends Pick<
    InputHTMLAttributes<HTMLInputElement>,
    | 'placeholder'
    | 'value'
    | 'style'
    | 'name'
    | 'autoFocus'
    | 'onBlur'
    | 'onFocus'
    | 'aria-haspopup'
    | 'aria-expanded'
    | 'onKeyDown'
    | 'disabled'
    | 'readOnly'
    | 'aria-describedby'
    | 'autoComplete'
  > {
  inputId: string;
  valueChanged?: (value: string) => void;
  showIcon?: boolean;
  rightButtonProps?: ButtonProps<'button'> | false;
  completedTime?: string;
  showProgress?: boolean;
  className?: {
    container?: string;
  };
}

export interface SearchBarProgressBarProps {
  progress: number;
}

export const SearchBar = forwardRef(function SearchBar(
  {
    inputId,
    name,
    value,
    valueChanged,
    placeholder = 'Ask anything…',
    readOnly,
    className,
    autoFocus,
    disabled,
    rightButtonProps = { type: 'button' },
    'aria-describedby': describedBy,
    onBlur: externalOnBlur,
    onFocus: externalOnFocus,
    showProgress = true,
    completedTime,
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
  const { user, showLogin } = useContext(AuthContext);
  const [progress, setProgress] = useState(0);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const { sidebarRendered } = useSidebarRendered();
  const suggestions: SearchBarSuggestionProps[] = [];

  if (!user) {
    suggestions.push({
      suggestion:
        'Sign up and read your first post to get search recommendations',
      onClick: () => showLogin('search bar suggestion'),
    });
  }

  const onClearClick = (event: MouseEvent): void => {
    event.stopPropagation();
    setInput('');
  };

  const onSubmit = (event: MouseEvent): void => {
    event.stopPropagation();
    setInput(null);
  };

  const seeSearchHistory = (event: MouseEvent): void => {
    event.stopPropagation();
  };

  return (
    <div className={classNames('w-full max-w-2xl', className?.container)}>
      <RaisedLabelContainer>
        <BaseField
          {...props}
          className={classNames(
            'relative items-center px-3 h-16 rounded-14 border !border-theme-divider-tertiary !bg-theme-bg-primary',
            className,
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
            <div className="flex-1 text-theme-label-tertiary">
              {placeholder}
            </div>
          )}

          {sidebarRendered && (
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
              type="primary"
              aria-describedby={describedBy}
              autoComplete="off"
              className={classNames(
                'flex-1 caret-theme-status-cabbage',
                getFieldFontColor({ readOnly, disabled, hasInput, focused }),
              )}
              required
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
      </RaisedLabelContainer>

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

      {sidebarRendered && suggestions && (
        <div className="flex flex-wrap gap-4 mt-6">
          {suggestions.map((suggestion) => (
            <SearchBarSuggestion
              key={suggestion.suggestion}
              suggestion={suggestion.suggestion}
              onClick={suggestion.onClick}
            />
          ))}
        </div>
      )}
    </div>
  );
});
