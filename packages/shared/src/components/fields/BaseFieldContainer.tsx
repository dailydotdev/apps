import classNames from 'classnames';
import type { ReactElement, ReactNode, ForwardedRef } from 'react';
import React, { forwardRef } from 'react';
import type { FieldType, TextInputProps } from './common';
import { BaseField } from './common';
import type { IconProps } from '../Icon';
import { FieldSize, fieldSizeToRadius } from './fieldSizes';

interface FieldStateProps {
  readOnly?: boolean;
  isLocked?: boolean;
  hasInput?: boolean;
  focused?: boolean;
  pressed?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  hasActionIcon?: boolean;
  isQuaternaryField?: boolean;
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

  // Resting (empty, editable) fields read as active — secondary content on the
  // floated surface, brightening to primary on hover. Tertiary here made an
  // empty field look indistinguishable from the dimmed disabled state.
  return 'text-text-secondary hover:text-text-primary';
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
  fieldSize?: FieldSize;
  hint?: string;
  hintIcon?: ReactElement<IconProps>;
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
  isQuaternaryField,
  placeholder,
  focused,
  label,
}: FieldPlaceholderProps): string => {
  if (isQuaternaryField) {
    return placeholder ?? '';
  }

  if (isTertiaryField) {
    return (focused ? placeholder : label) ?? '';
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
    fieldSize,
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
    hintIcon,
    saveHintSpace,
    focusInput,
  }: BaseFieldContainerProps,
  ref: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const isSecondaryField = fieldType === 'secondary';
  // Radius always comes from the shared button-aligned scale, so a field's
  // corner radius matches a button of the same size. The default (no explicit
  // `fieldSize`) maps the compact secondary field to Small and every other
  // field to Large — the same rung the default heights resolve to.
  const radiusClass =
    fieldSizeToRadius[
      fieldSize ?? (isSecondaryField ? FieldSize.Small : FieldSize.Large)
    ];

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
          radiusClass,
          className.baseField,
          disabled && 'pointer-events-none opacity-32',
          { readOnly, focused, invalid },
        )}
      >
        {children}
      </BaseField>
      {(hint?.length || saveHintSpace) && (
        <div
          role={invalid ? 'alert' : undefined}
          className={classNames(
            'mt-1 flex items-center gap-1 px-2 typo-caption1',
            saveHintSpace && 'h-4',
            invalid ? 'text-status-error' : 'text-text-quaternary',
            className.hint,
          )}
        >
          {hintIcon || undefined}
          {hint}
        </div>
      )}
    </div>
  );
}

export default forwardRef(BaseFieldContainer);
