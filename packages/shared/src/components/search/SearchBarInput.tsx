import React, {
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
import { SearchChunk } from '../../graphql/search';
import { getSecondsDifference } from '../../lib/dateFormat';
import useMedia from '../../hooks/useMedia';
import { tablet } from '../../styles/media';
import { useAuthContext } from '../../contexts/AuthContext';
import InteractivePopup, {
  InteractivePopupPosition,
} from '../tooltips/InteractivePopup';
import CloseButton from '../CloseButton';

interface SearchBarClassName {
  container?: string;
  field?: string;
}

export interface SearchBarInputProps {
  valueChanged?: (value: string) => void;
  showIcon?: boolean;
  rightButtonProps?: ButtonProps<'button'> | false;
  showProgress?: boolean;
  className?: SearchBarClassName;
  onSubmit?: (event: MouseEvent, input: string) => void;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  chunk?: SearchChunk;
  shouldShowPopup?: boolean;
}

function SearchBarInputComponent(
  {
    inputProps = {},
    valueChanged,
    className,
    rightButtonProps = { type: 'button' },
    showProgress = true,
    onSubmit: handleSubmit,
    chunk,
    shouldShowPopup,
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
  const isTabletAbove = useMedia(
    [tablet.replace('@media ', '')],
    [true],
    false,
  );
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
      handleSubmit(event, inputRef.current.value);
    }

    setInput(null);
  };

  const seeSearchHistory = (event: MouseEvent): void => {
    event.stopPropagation();
  };

  const onInputClick = () => {
    if (isTabletAbove || isMobileOpen || !shouldShowPopup) return null;

    if (!user) return showLogin('search input');

    return setIsMobileOpen(true);
  };

  const isActionable = isTabletAbove || !shouldShowPopup;

  return (
    <RaisedLabelContainer className={className?.container}>
      {isMobileOpen && (
        <InteractivePopup
          position={InteractivePopupPosition.Center}
          className="w-screen h-screen"
        >
          <CloseButton onClick={() => setIsMobileOpen(false)} />
          Test Sample
        </InteractivePopup>
      )}
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
            'flex-1 caret-theme-status-cabbage',
            getFieldFontColor({ readOnly, disabled, hasInput, focused }),
          )}
        />

        <div className="flex gap-3 items-center">
          {hasInput && isActionable && (
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
          {isActionable && (
            <div className="h-8 border border-theme-divider-quaternary" />
          )}
          {isActionable && (
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
          )}
          {isActionable && (
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
          {(chunk?.status || chunk?.error?.code) && (
            <div className="mt-2 typo-callout text-theme-label-tertiary">
              {chunk?.error?.code || chunk?.status}
            </div>
          )}
          {chunk?.completedAt && chunk?.createdAt && (
            <div className="mt-2 typo-callout text-theme-label-tertiary">
              Done! {getSecondsDifference(chunk.createdAt, chunk.completedAt)}{' '}
              seconds.
            </div>
          )}
        </div>
      )}
    </RaisedLabelContainer>
  );
}

export const SearchBarInput = forwardRef(SearchBarInputComponent);
