import React, {
  ForwardedRef,
  forwardRef,
  InputHTMLAttributes,
  MouseEvent,
  ReactElement,
  useState,
  useEffect,
  useContext,
} from 'react';
import classNames from 'classnames';
import { useInputField } from '../../hooks/useInputField';
import { AiIcon, SendAirplaneIcon } from '../icons';
import CloseIcon from '../icons/MiniClose';
import { Button, ButtonProps, ButtonSize } from '../buttons/Button';
import { BaseField, FieldInput } from '../fields/common';
import { getFieldFontColor } from '../fields/BaseFieldContainer';
import { RaisedLabel, RaisedLabelType } from '../cards/RaisedLabel';
import styles from '../cards/Card.module.css';
import TimerIcon from '../icons/Timer';
import { IconSize } from '../Icon';
import { SearchProgressBar } from './SearchProgressBar';
import {
  SearchBarSuggestion,
  SearchBarSuggestionProps,
} from './SearchBarSuggestion';
import AuthContext from '../../contexts/AuthContext';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import moreStyles from '../cards/RaisedLabel.module.css';

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
  // TODO: Add back in
  // progress?: number;
  completedTime?: string;
  showProgress?: boolean;
}

export interface SearchBarProgressBarProps {
  progress: number;
}

// const ButtonIcon = ({ isPrimary }: { isPrimary: boolean }) =>
//   isPrimary ? <CloseIcon /> : <ArrowIcon className="rotate-90" />;

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
    // progress,
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
  const [suggestions, setSuggestions] = useState<SearchBarSuggestionProps[]>([
    {
      suggestion:
        'How to handle large-scale data storage and retrieval efficiently?',
      onClick: () =>
        setInput(
          'How to handle large-scale data storage and retrieval efficiently?',
        ),
    },
    {
      suggestion: 'How do you ensure code quality?',
      onClick: () => setInput('How do you ensure code quality?'),
    },
  ]);

  useEffect(() => {
    if (!user) {
      setSuggestions([
        {
          suggestion:
            'Sign up and read your first post to get search recommendations',
          onClick: () => showLogin('search bar suggestion'),
        },
      ]);
    }
  }, [user]);

  const onClearClick = (event: MouseEvent): void => {
    event.stopPropagation();
    setInput('');
  };

  const onSubmit = (event: MouseEvent): void => {
    event.stopPropagation();
    setProgress(0);
    const searchParam = inputRef.current?.value;

    alert(`Searching... ${searchParam}`);
    progressEmulator();
    setInput(null);
  };

  const seeSearchHistory = (event: MouseEvent): void => {
    event.stopPropagation();
    alert('see search history');
  };

  // TODO: Temp for testing
  const progressEmulator = () => {
    setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          // setCompletedTime('12:12');
          return 100;
        }
        const newProgress = oldProgress + 1;
        return newProgress;
      });
    }, 100);
  };

  return (
    <div className="max-w-2xl">
      <div className={classNames('relative', moreStyles.raiseLabelContainer)}>
        <BaseField
          {...props}
          className={classNames(
            'relative items-center px-3 h-16 rounded-14 border !border-theme-divider-tertiary !bg-theme-bg-primary',
            className,
            { focused },
          )}
          onClick={focusInput}
          data-testid="searchBar"
          ref={ref}
        >
          <AiIcon
            size={IconSize.Large}
            className="mr-3 text-theme-label-tertiary"
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
            type="primary"
            aria-describedby={describedBy}
            autoComplete="off"
            className={classNames(
              'flex-1 caret-theme-status-cabbage',
              getFieldFontColor({ readOnly, disabled, hasInput, focused }),
            )}
            required
          />

          <div className="flex gap-3 items-center">
            {hasInput && (
              <Button
                {...rightButtonProps}
                className="btn-tertiary"
                buttonSize={ButtonSize.Small}
                title="Clear query"
                onClick={onClearClick}
                icon={<CloseIcon size={IconSize.Small} />}
                disabled={!hasInput}
              />
            )}

            <div className="h-8 border border-theme-divider-quaternary" />

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
                  icon={<TimerIcon size={IconSize.Small} />}
                  disabled={searchHistory.length === 0}
                />
              </div>
            </SimpleTooltip>
            <Button
              {...rightButtonProps}
              className="btn-primary"
              buttonSize={ButtonSize.Medium}
              title="Submit"
              onClick={onSubmit}
              icon={<SendAirplaneIcon size={IconSize.Medium} />}
              disabled={!hasInput}
            />
          </div>
        </BaseField>

        <RaisedLabel type={RaisedLabelType.Beta} />
      </div>

      {showProgress && (
        <div className="mt-6">
          <SearchProgressBar progress={progress} />

          {progress > 0 && progress < 100 && (
            <div className="mt-2 typo-callout text-theme-label-tertiary">
              🚀 Generating answer
            </div>
          )}

          {progress === 100 && completedTime && (
            <div className="mt-2 typo-callout text-theme-label-tertiary">
              Done! {completedTime} seconds.
            </div>
          )}
        </div>
      )}

      {suggestions && (
        <div className="flex flex-wrap gap-4 mt-6">
          {suggestions.map((suggestion, index) => (
            <SearchBarSuggestion
              key={index}
              suggestion={suggestion.suggestion}
              onClick={suggestion.onClick}
            />
          ))}
        </div>
      )}
    </div>
  );
});
