import React, {
  FormEvent,
  ForwardedRef,
  forwardRef,
  InputHTMLAttributes,
  MouseEvent,
  ReactElement,
  useState,
} from 'react';
import classNames from 'classnames';
import {
  RaisedLabel,
  RaisedLabelContainer,
  RaisedLabelType,
} from '../cards/RaisedLabel';
import { BaseField, FieldInput } from '../fields/common';
import { AiIcon } from '../icons';
import { IconSize } from '../Icon';
import { getFieldFontColor } from '../fields/BaseFieldContainer';
import { Button, ButtonSize } from '../buttons/Button';
import CloseIcon from '../icons/MiniClose';
import { useInputField } from '../../hooks/useInputField';
import { SearchProgressBar } from './SearchProgressBar';
import { SearchChunk } from '../../graphql/search';
import useMedia from '../../hooks/useMedia';
import { tablet } from '../../styles/media';
import { useAuthContext } from '../../contexts/AuthContext';
import { SearchSubmitButton } from './SearchSubmitButton';
import { MobileSearch } from './MobileSearch';
import { SearchBarSuggestionListProps } from './SearchBarSuggestionList';
import { SearchHistoryButton } from './SearchHistoryButton';
import { LoginTrigger } from '../../lib/analytics';

interface SearchBarClassName {
  container?: string;
  field?: string;
  form?: string;
}

export interface SearchBarInputProps {
  valueChanged?: (value: string) => void;
  showIcon?: boolean;
  showProgress?: boolean;
  className?: SearchBarClassName;
  onSubmit?: (event: FormEvent, input: string) => void;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  chunk?: SearchChunk;
  shouldShowPopup?: boolean;
  suggestionsProps: SearchBarSuggestionListProps;
}

function SearchBarInputComponent(
  {
    inputProps = {},
    valueChanged,
    className,
    showProgress = true,
    onSubmit: handleSubmit,
    chunk,
    shouldShowPopup,
    suggestionsProps,
    ...props
  }: SearchBarInputProps,
  ref: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const { user, showLogin } = useAuthContext();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const {
    readOnly,
    disabled,
    value,
    onFocus: externalOnFocus,
    onBlur: externalOnBlur,
    onClick: externalOnClick,
    placeholder = 'Ask anything...',
  } = inputProps;
  const { inputRef, focused, hasInput, onFocus, onBlur, onInput, setInput } =
    useInputField(value, valueChanged);
  const isTabletAbove = useMedia(
    [tablet.replace('@media ', '')],
    [true],
    false,
  );

  const onClearClick = (event: MouseEvent): void => {
    event.stopPropagation();
    setInput('');
  };

  const onSubmit = (event: FormEvent, input?: string): void => {
    event.preventDefault();

    if (!user) return showLogin(LoginTrigger.SearchInput);

    const finalValue = input ?? inputRef.current.value;

    if (handleSubmit) {
      handleSubmit(event, finalValue);
    }

    return setInput(finalValue);
  };

  const onInputClick = () => {
    if (isTabletAbove || isMobileOpen || !shouldShowPopup) return null;

    if (!user) return showLogin(LoginTrigger.SearchInput);

    return setIsMobileOpen(true);
  };

  const onMobileSubmit = (event: FormEvent, mobileInput: string) => {
    setIsMobileOpen(false);
    onSubmit(event, mobileInput);
  };

  const onPopupClose = (event: MouseEvent, mobileInput: string) => {
    setInput(mobileInput);
    setIsMobileOpen(false);
  };

  return (
    <RaisedLabelContainer className={className?.container}>
      {isMobileOpen && (
        <MobileSearch
          suggestionsProps={suggestionsProps}
          input={inputRef.current.value}
          onClose={onPopupClose}
          onSubmit={onMobileSubmit}
        />
      )}
      <form onSubmit={onSubmit} className={className?.form}>
        <BaseField
          {...props}
          className={classNames(
            'relative items-center px-3 h-16 rounded-14 border !border-theme-divider-tertiary !bg-theme-bg-primary',
            className?.field,
            { focused },
          )}
          data-testid="searchBar"
          ref={ref}
        >
          <AiIcon
            size={IconSize.Large}
            className="mr-3 text-theme-label-tertiary"
          />
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
            onClick={(event) => {
              onInputClick();
              externalOnClick?.(event);
            }}
            onInput={onInput}
            type="primary"
            autoComplete="off"
            className={classNames(
              'flex-1 caret-theme-status-cabbage h-full',
              getFieldFontColor({ readOnly, disabled, hasInput, focused }),
            )}
          />

          <div className="hidden tablet:flex gap-3 items-center">
            {hasInput && (
              <Button
                className="btn-tertiary"
                buttonSize={ButtonSize.Small}
                title="Clear query"
                onClick={onClearClick}
                icon={<CloseIcon />}
                disabled={!hasInput}
                type="button"
              />
            )}
            <div className="h-8 border border-theme-divider-quaternary" />
            <SearchHistoryButton />
            <SearchSubmitButton
              tooltipProps={{
                content: !hasInput && 'Enter text to start searching',
              }}
            />
          </div>
        </BaseField>
      </form>
      <RaisedLabel type={RaisedLabelType.Beta} />
      {showProgress && (
        <div className="mt-3">
          <SearchProgressBar max={chunk?.steps} progress={chunk?.progress} />
          {(chunk?.status || chunk?.error?.code) && (
            <div className="mt-2 typo-callout text-theme-label-tertiary">
              {chunk?.error?.code || chunk?.status}
            </div>
          )}
        </div>
      )}
    </RaisedLabelContainer>
  );
}

export const SearchBarInput = forwardRef(SearchBarInputComponent);
