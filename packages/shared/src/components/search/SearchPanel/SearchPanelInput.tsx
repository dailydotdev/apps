import React, {
  FormEvent,
  InputHTMLAttributes,
  MouseEvent,
  ReactElement,
  ReactNode,
  useContext,
  useRef,
} from 'react';
import classNames from 'classnames';
import { BaseField, FieldInput } from '../../fields/common';
import { AnalyticsEvent } from '../../../lib/analytics';
import { IconSize } from '../../Icon';
import { getFieldFontColor } from '../../fields/BaseFieldContainer';
import { AiIcon, ClearIcon } from '../../icons';
import { useInputField } from '../../../hooks/useInputField';
import { useAnalyticsContext } from '../../../contexts/AnalyticsContext';
import { useAuthContext } from '../../../contexts/AuthContext';
import { AuthTriggers } from '../../../lib/auth';
import { SearchPanelContext } from './SearchPanelContext';
import { ViewSize, useEventListener, useViewSize } from '../../../hooks';
import {
  isAppleDevice,
  isNullOrUndefined,
  isSpecialKeyPressed,
} from '../../../lib/func';
import { KeyboadShortcutLabel } from '../../KeyboardShortcutLabel';
import { SearchPanelProvider } from './SearchPanelProvider';
import { minSearchQueryLength } from '../../../graphql/search';
import { SearchPanelInputCursor } from './SearchPanelInputCursor';
import { useSearchProvider } from '../../../hooks/search';
import { defaultSearchProvider, providerToLabelTextMap } from './common';
import { Button, ButtonSize } from '../../buttons/ButtonV2';
import { useSearchPanelAction } from './useSearchPanelAction';

export type SearchPanelInputClassName = {
  container?: string;
  field?: string;
  form?: string;
};

export type SearchPanelInputProps = {
  className?: SearchPanelInputClassName;
  valueChanged?: (value: string) => void;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  children?: ReactNode;
};

const shortcutKeys = [isAppleDevice() ? '⌘' : 'Ctrl', 'K'];

export const SearchPanelInput = ({
  className,
  inputProps,
  valueChanged,
  children,
}: SearchPanelInputProps): ReactElement => {
  const { search } = useSearchProvider();
  const searchPanel = useContext(SearchPanelContext);
  const fieldRef = useRef<HTMLInputElement>();
  const { trackEvent } = useAnalyticsContext();
  const {
    value,
    readOnly,
    disabled,
    onFocus: externalOnFocus,
    onBlur: externalOnBlur,
    onClick: externalOnClick,
    placeholder = searchPanel.isActive
      ? 'Search posts or ask a question...'
      : 'Search',
  } = inputProps || {};
  const { inputRef, focused, hasInput, onFocus, onBlur, onInput, setInput } =
    useInputField(value, valueChanged);
  const { isLoggedIn, showLogin } = useAuthContext();
  const isLaptop = useViewSize(ViewSize.Laptop);

  const onInputClick = () => {
    if (!isLoggedIn) {
      showLogin({ trigger: AuthTriggers.SearchInput });
    }
  };

  const onSubmit = (event: FormEvent, input?: string): void => {
    event.preventDefault();

    if (!isLoggedIn) {
      return showLogin({ trigger: AuthTriggers.SearchInput });
    }

    const finalValue = input ?? inputRef.current.value;
    const provider = searchPanel.provider ?? defaultSearchProvider;

    trackEvent({
      event_name: AnalyticsEvent.SubmitSearch,
      extra: JSON.stringify({ query: finalValue, provider }),
    });

    setInput(finalValue);

    searchPanel.setActive({
      isActive: false,
    });

    inputRef.current?.blur();

    return search({ provider, query: finalValue });
  };

  useEventListener(globalThis, 'click', (event) => {
    if (
      !isNullOrUndefined(fieldRef.current) &&
      !fieldRef.current.contains(event.target as Node) &&
      fieldRef.current
    ) {
      onBlur();

      searchPanel.setActive({
        isActive: false,
      });
    }
  });

  const showDropdown =
    searchPanel.isActive && searchPanel.query.length >= minSearchQueryLength;

  useEventListener(globalThis, 'keydown', (event) => {
    if (isSpecialKeyPressed({ event }) && event.key === 'k') {
      event.preventDefault();

      if (searchPanel.isActive) {
        inputRef.current?.blur();
        searchPanel.setActive({
          isActive: false,
        });
      } else {
        inputRef.current?.focus();
        searchPanel.setActive({
          isActive: true,
        });
      }
    }
  });

  useEventListener(globalThis, 'keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();

      if (searchPanel.isActive) {
        inputRef.current?.blur();
        searchPanel.setActive({
          isActive: false,
        });
      }
    }
  });

  const itemProps = useSearchPanelAction({
    provider: undefined,
    text: providerToLabelTextMap[defaultSearchProvider],
  });

  return (
    <div className={classNames(className?.container)}>
      <form
        onSubmit={onSubmit}
        className={classNames(className?.form, 'relative w-full')}
      >
        <BaseField
          className={classNames(
            'relative translate-y-0 items-center border-0 !bg-theme-bg-secondary !px-3 duration-200 ease-in-out laptop:py-1 laptop:backdrop-blur-[3.75rem]',
            className?.field,
            { focused },
            searchPanel.isActive
              ? 'h-12 !border-theme-divider-tertiary laptop:h-14 laptop:translate-y-1 laptop:border laptop:shadow-2'
              : 'h-12',
            searchPanel.isActive && showDropdown
              ? 'rounded-12 laptop:rounded-b-none laptop:rounded-t-16'
              : 'rounded-12 laptop:rounded-16',
          )}
          ref={fieldRef}
        >
          <AiIcon
            size={IconSize.Large}
            className="mr-3 text-theme-label-tertiary"
          />
          <FieldInput
            {...inputProps}
            data-search-panel-item="true"
            placeholder={placeholder}
            ref={inputRef}
            onFocus={(event) => {
              onFocus();
              externalOnFocus?.(event);
              itemProps.onFocus(event);

              trackEvent({ event_name: AnalyticsEvent.FocusSearch });
            }}
            onBlur={(event) => {
              onBlur();
              externalOnBlur?.(event);
              itemProps.onBlur(event);
            }}
            onClick={(event) => {
              onInputClick();
              externalOnClick?.(event);
            }}
            onInput={onInput}
            type="primary"
            autoComplete="off"
            className={classNames(
              'h-full flex-1 caret-theme-status-cabbage',
              getFieldFontColor({ readOnly, disabled, hasInput, focused }),
            )}
          />
          <div
            className={classNames(
              'flex h-full items-center bg-theme-bg-secondary',
              searchPanel.isActive && '-mr-2',
            )}
          >
            {searchPanel.isActive && !!searchPanel.query && (
              <Button
                id="search-panel-input-clear-button"
                type="button"
                className="mr-2"
                size={ButtonSize.XSmall}
                title="Clear query"
                onClick={(event: MouseEvent): void => {
                  event.stopPropagation();

                  setInput('');

                  inputRef.current?.focus();
                }}
                icon={<ClearIcon secondary />}
              />
            )}
            {searchPanel.isActive && (
              <div className="flex h-full items-center border-l border-theme-float laptop:hidden">
                <Button
                  type="button"
                  onClick={() => {
                    searchPanel.setActive({
                      isActive: false,
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
          <div className="z-1 hidden items-center gap-3 laptop:flex">
            {!searchPanel.isActive && (
              <KeyboadShortcutLabel keys={shortcutKeys} />
            )}
            {searchPanel.isActive &&
              searchPanel.query.length >= minSearchQueryLength && (
                <>
                  {isLaptop && <SearchPanelInputCursor />}
                  <SearchPanelProvider className="ml-2" />
                </>
              )}
          </div>
        </BaseField>
        {children}
      </form>
    </div>
  );
};
