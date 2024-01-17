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
import { isNullOrUndefined, isSpecialKeyPressed } from '../../../lib/func';
import { minQueryLength } from './common';

export type SearchPanelInputClassName = {
  container?: string;
  field?: string;
  form?: string;
};

export type SearchPanelInputProps = {
  className?: SearchPanelInputClassName;
  valueChanged?: (value: string) => void;
  onSubmit?: (event: FormEvent, input: string) => void;
  inputProps?: InputHTMLAttributes<HTMLInputElement> & {
    value: string;
  };
  children?: ReactNode;
};

export const SearchPanelInput = ({
  onSubmit: handleSubmit,
  className,
  inputProps,
  valueChanged,
  children,
}: SearchPanelInputProps): ReactElement => {
  const searchPanel = useContext(SearchPanelContext);
  const fieldRef = useRef<HTMLInputElement>();
  const { trackEvent } = useAnalyticsContext();
  const {
    value,
    readOnly,
    disabled,
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

    if (typeof handleSubmit === 'function') {
      handleSubmit(event, finalValue);

      trackEvent({
        event_name: AnalyticsEvent.SubmitSearch,
        extra: JSON.stringify({ query: finalValue }),
      });
    }

    return setInput(finalValue);
  };

  useEventListener(globalThis, 'keydown', (event) => {
    if (isSpecialKeyPressed({ event }) && event.key === 'k') {
      event.preventDefault();

      if (searchPanel.isActive) {
        inputRef.current?.blur();
      } else {
        inputRef.current.focus();
      }
    }
  });

  useEventListener(globalThis, 'click', (event) => {
    if (
      !isNullOrUndefined(fieldRef.current) &&
      !fieldRef.current.contains(event.target as Node) &&
      fieldRef.current
    ) {
      onBlur();

      searchPanel.setActive(false);
    }
  });

  const showDropdown =
    searchPanel.isActive && searchPanel.query.length >= minQueryLength;

  return (
    <div className={classNames(className?.container, 'hidden laptop:flex')}>
      <form
        onSubmit={onSubmit}
        className={classNames(className?.form, 'relative w-full')}
      >
        <BaseField
          className={classNames(
            'relative translate-y-0 items-center !bg-theme-bg-secondary px-4 py-1 duration-200 ease-in-out',
            className?.field,
            { focused },
            searchPanel.isActive
              ? 'h-14 translate-y-1 border !border-theme-divider-quaternary shadow-3'
              : 'h-12',
            searchPanel.isActive && showDropdown
              ? 'rounded-t-2xl'
              : 'rounded-2xl',
          )}
          data-testid="searchBar"
          ref={fieldRef}
        >
          <AiIcon
            size={IconSize.Large}
            className="mr-3 text-theme-label-tertiary"
          />
          <FieldInput
            {...inputProps}
            placeholder={placeholder}
            ref={inputRef}
            onFocus={() => {
              onFocus();

              trackEvent({ event_name: AnalyticsEvent.FocusSearch });

              searchPanel.setActive(true);
            }}
            onClick={onInputClick}
            onInput={onInput}
            type="primary"
            autoComplete="off"
            className={classNames(
              'h-full flex-1 caret-theme-status-cabbage',
              getFieldFontColor({ readOnly, disabled, hasInput, focused }),
            )}
          />
        </BaseField>
        {children}
      </form>
    </div>
  );
};
