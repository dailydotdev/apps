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
  isPrimaryField?: boolean;
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
  isPrimaryField,
}: FieldStateProps): string => {
  if (
    readOnly ||
    isLocked ||
    (hasInput && !focused) ||
    (isPrimaryField && hasInput)
  ) {
    return 'text-text-tertiary';
  }

  return disabled ? 'text-text-disabled' : 'text-text-primary';
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
    return 'text-text-primary';
  }

  if (readOnly || isLocked) {
    return 'text-text-quaternary';
  }

  if (disabled) {
    return 'text-text-disabled';
  }

  if (focused) {
    return 'text-text-quaternary';
  }

  return 'text-text-tertiary hover:text-text-primary';
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
            'mb-1 px-2 font-bold typo-caption1',
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
          'relative flex',
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
            'mt-1 px-2 typo-caption1',
            saveHintSpace && 'h-4',
            invalid ? 'text-status-error' : 'text-text-quaternary',
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
