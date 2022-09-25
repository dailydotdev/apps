import classNames from 'classnames';
import React, {
  ReactElement,
  ReactNode,
  forwardRef,
  MutableRefObject,
} from 'react';
import { BaseField, FieldType, TextInputProps } from './common';

interface FieldStateProps {
  readOnly?: boolean;
  isLocked?: boolean;
  hasInput?: boolean;
  focused?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  hasActionIcon?: boolean;
  isTertiaryField?: boolean;
  isSecondaryField?: boolean;
}

export interface FieldClassName {
  container?: string;
  outerLabel?: string;
  innerLabel?: string;
  input?: string;
  hint?: string;
  baseField?: string;
}

export const getFieldLabelColor = ({
  readOnly,
  isLocked,
  hasInput,
  disabled,
  focused,
}: FieldStateProps): string => {
  if (readOnly || isLocked || (hasInput && !focused)) {
    return 'text-theme-label-tertiary';
  }

  return disabled ? 'text-theme-label-disabled' : 'text-theme-label-primary';
};

export const getFieldFontColor = ({
  readOnly,
  isLocked,
  disabled,
  focused,
  hasInput,
  hasActionIcon,
}: FieldStateProps): string => {
  if ((readOnly && hasActionIcon) || hasInput) {
    return 'text-theme-label-primary';
  }

  if (readOnly || isLocked) {
    return 'text-theme-label-quaternary';
  }

  if (disabled) {
    return 'text-theme-label-disabled';
  }

  if (focused) {
    return 'text-theme-label-quaternary';
  }

  return 'text-theme-label-tertiary hover:text-theme-label-primary';
};

interface InnerLabelProps extends FieldStateProps {
  className?: string;
  inputId: string;
  label: string;
}

interface FieldPlaceholderProps extends FieldStateProps {
  placeholder?: string;
  label: string;
}

interface BaseFieldContainerProps extends FieldPlaceholderProps {
  className?: FieldClassName;
  inputId: string;
  fieldType?: FieldType;
  hint?: string;
  saveHintSpace?: boolean;
  focusInput: () => void;
  children?: ReactNode;
}

type ValidElement = HTMLInputElement | HTMLTextAreaElement;

export type BaseFieldProps<T extends ValidElement = HTMLInputElement> =
  TextInputProps<T> & Omit<BaseFieldContainerProps, 'focusInput'>;

export const getFieldPlaceholder = ({
  isSecondaryField,
  isTertiaryField,
  placeholder,
  focused,
  label,
}: FieldPlaceholderProps): string => {
  if (isTertiaryField) {
    return focused ? placeholder : label;
  }

  if (focused || isSecondaryField) {
    return placeholder ?? '';
  }

  return label;
};

export function InnerLabel({
  className,
  inputId,
  label,
  ...props
}: InnerLabelProps): ReactElement {
  return (
    <label
      className={classNames(
        'typo-caption1',
        getFieldLabelColor(props),
        className,
      )}
      htmlFor={inputId}
    >
      {label}
    </label>
  );
}

function BaseFieldContainer(
  {
    className = {},
    fieldType = 'primary',
    readOnly,
    isLocked,
    hasInput,
    disabled,
    focused,
    inputId,
    label,
    children,
    invalid,
    hint,
    saveHintSpace,
    focusInput,
  }: BaseFieldContainerProps,
  ref?: MutableRefObject<HTMLDivElement>,
): ReactElement {
  const isSecondaryField = fieldType === 'secondary';

  return (
    <div ref={ref} className={classNames('flex flex-col', className.container)}>
      {isSecondaryField && (
        <label
          className={classNames(
            'px-2 mb-1 font-bold typo-caption1',
            className.outerLabel,
            getFieldLabelColor({
              readOnly,
              isLocked,
              hasInput,
              disabled,
              focused,
            }),
          )}
          htmlFor={inputId}
        >
          {label}
        </label>
      )}
      <BaseField
        data-testid="field"
        onClick={focusInput}
        className={classNames(
          'flex relative',
          isSecondaryField ? 'rounded-10' : 'rounded-14',
          className.baseField,
          { readOnly, focused, invalid },
        )}
      >
        {children}
      </BaseField>
      {(hint?.length || saveHintSpace) && (
        <div
          role={invalid ? 'alert' : undefined}
          className={classNames(
            'px-2 mt-1 typo-caption1',
            saveHintSpace && 'h-4',
            invalid ? 'text-theme-status-error' : 'text-theme-label-quaternary',
            className.hint,
          )}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

export default forwardRef(BaseFieldContainer);
