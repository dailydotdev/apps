import React, {
  FormEvent,
  InputHTMLAttributes,
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
import { AiIcon } from '../../icons';
import { useInputField } from '../../../hooks/useInputField';
import { useAnalyticsContext } from '../../../contexts/AnalyticsContext';
import { useAuthContext } from '../../../contexts/AuthContext';
import { AuthTriggers } from '../../../lib/auth';
import { SearchPanelContext } from './SearchPanelContext';
import { useEventListener } from '../../../hooks';
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
import { defaultSearchProvider } from './common';

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

    trackEvent({
      event_name: AnalyticsEvent.SubmitSearch,
      extra: JSON.stringify({ query: finalValue }),
    });

    setInput(finalValue);

    const provider = searchPanel.provider ?? defaultSearchProvider;

    searchPanel.setActive({
      isActive: false,
    });

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

  return (
    <div className={classNames(className?.container, 'hidden laptop:flex')}>
      <form
        onSubmit={onSubmit}
        className={classNames(className?.form, 'relative w-full')}
      >
        <BaseField
          className={classNames(
            'relative translate-y-0 items-center !bg-overlay-float-salt !px-3 py-1 backdrop-blur-[3.75rem] duration-200 ease-in-out',
            className?.field,
            { focused },
            searchPanel.isActive
              ? 'h-14 translate-y-1 border !border-theme-divider-quaternary shadow-2'
              : 'h-12',
            searchPanel.isActive && showDropdown
              ? 'rounded-t-16'
              : 'rounded-16',
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
              'h-full flex-1 caret-theme-status-cabbage',
              getFieldFontColor({ readOnly, disabled, hasInput, focused }),
            )}
          />
          <div className="z-1 hidden items-center gap-3 tablet:flex">
            {!searchPanel.isActive && (
              <KeyboadShortcutLabel keys={shortcutKeys} />
            )}
            {searchPanel.isActive && (
              <>
                <SearchPanelInputCursor />
                <SearchPanelProvider />
              </>
            )}
          </div>
        </BaseField>
        {children}
      </form>
    </div>
  );
};
