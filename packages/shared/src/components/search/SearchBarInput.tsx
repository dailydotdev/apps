import React, {
  FormEvent,
  ForwardedRef,
  forwardRef,
  InputHTMLAttributes,
  MouseEvent,
  ReactElement,
  useContext,
  useEffect,
  useRef,
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
import { AnalyticsEvent, LoginTrigger } from '../../lib/analytics';
import AnalyticsContext from '../../contexts/AnalyticsContext';

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
  const { trackEvent } = useContext(AnalyticsContext);
  const { user, showLogin } = useAuthContext();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const {
    readOnly,
    disabled,
    value,
    onFocus: externalOnFocus,
    onBlur: externalOnBlur,
    onClick: externalOnClick,
    placeholder = 'Ask a question...',
  } = inputProps;
  const { inputRef, focused, hasInput, onFocus, onBlur, onInput, setInput } =
    useInputField(value, valueChanged);
  const isTabletAbove = useMedia(
    [tablet.replace('@media ', '')],
    [true],
    false,
  );

  const lastChunkIdRef = useRef(chunk?.id);

  useEffect(() => {
    if (!chunk?.prompt) {
      return;
    }

    if (chunk.id === lastChunkIdRef.current) {
      return;
    }

    lastChunkIdRef.current = chunk.id;
    setInput(chunk.prompt);
  }, [chunk?.prompt, chunk?.id, setInput]);

  const handleClearClick = (event: MouseEvent): void => {
    event.stopPropagation();
    setInput('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const onSubmit = (event: FormEvent, input?: string): void => {
    event.preventDefault();

    if (!user) {
      return showLogin(LoginTrigger.SearchInput);
    }

    const finalValue = input ?? inputRef.current.value;

    if (handleSubmit) {
      handleSubmit(event, finalValue);
      trackEvent({
        event_name: AnalyticsEvent.SubmitSearch,
        extra: JSON.stringify({ query: finalValue }),
      });
    }

    return setInput(finalValue);
  };

  const onInputClick = () => {
    if (isTabletAbove || isMobileOpen || !shouldShowPopup) {
      return null;
    }

    if (!user) {
      return showLogin(LoginTrigger.SearchInput);
    }

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
              trackEvent({ event_name: AnalyticsEvent.FocusSearch });
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
                onClick={handleClearClick}
                icon={<CloseIcon />}
                type="button"
              />
            )}
            <div className="h-8 border border-theme-divider-quaternary" />
            <SearchHistoryButton />
            <SearchSubmitButton
              buttonProps={{ disabled: !hasInput }}
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
          {!!chunk?.status && (
            <div className="mt-2 typo-callout text-theme-label-tertiary">
              {chunk?.status}
            </div>
          )}
        </div>
      )}
    </RaisedLabelContainer>
  );
}

export const SearchBarInput = forwardRef(SearchBarInputComponent);
