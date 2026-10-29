import type {
  ComponentProps,
  PropsWithChildren,
  ReactElement,
  ReactNode,
} from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonVariant,
  ButtonSize,
} from '../../../components/buttons/Button';
import type { ButtonProps } from '../../../components/buttons/Button';
import { VIcon } from '../../../components/icons/V';
import { IconSize } from '../../../components/Icon';
import { FunnelTargetId } from '../../onboarding/types/funnelEvents';

type CheckboxValue = string;
type CheckboxValues = string[];

export interface CheckboxItem {
  image?: ComponentProps<'img'>;
  icon?: ReactNode;
  label: string;
  /** Secondary detail, set apart at the end of the row. */
  hint?: string;
  /** A tab on the row's top edge, to recommend an answer. */
  badge?: string;
  value: CheckboxValue;
}

export enum CheckboxGroupVariant {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

export enum CheckboxGroupBehaviour {
  Radio = 'radio',
  Checkbox = 'checkbox',
}

export interface FormInputCheckboxGroupProps
  extends PropsWithChildren<ComponentProps<'div'>> {
  behaviour?: CheckboxGroupBehaviour;
  /**
   * @default []
   */
  defaultValue?: CheckboxValues;
  name: string;
  onValueChange?: (value: CheckboxValues) => void;
  /**
   * @default []
   */
  options?: CheckboxItem[];
  /**
   * @default 1
   */
  cols?: number;
  value?: CheckboxValues;
  /**
   * @default CheckboxGroupVariant.Horizontal
   */
  variant?: CheckboxGroupVariant;
  optionStyle?: 'default' | 'simplified';
  /** Ends each answer with a radio or checkbox mark that fills when picked. */
  hasSelectionMark?: boolean;
}

const getChangedValue = ({
  isSingleChoice,
  value,
  selectedValue,
}: {
  isSingleChoice: boolean;
  value: CheckboxValues;
  selectedValue: CheckboxValue;
}): CheckboxValues => {
  const isSelected = value.includes(selectedValue);

  if (isSelected) {
    return value.filter((item) => item !== selectedValue);
  }

  return isSingleChoice ? [selectedValue] : [...value, selectedValue];
};

const SelectionMark = ({
  isSelected,
  isSingleChoice,
  className,
}: {
  isSelected: boolean;
  isSingleChoice: boolean;
  className?: string;
}): ReactElement => (
  <span
    aria-hidden
    className={classNames(
      'flex size-6 shrink-0 items-center justify-center transition-colors duration-200',
      isSingleChoice ? 'rounded-full' : 'rounded-6',
      isSelected
        ? 'bg-brand-default text-white'
        : 'border-2 border-border-subtlest-primary',
      className,
    )}
  >
    {isSelected && <VIcon size={IconSize.XSmall} secondary />}
  </span>
);

const FormInputCheckbox = ({
  isSelected,
  isSingleChoice,
  hasSelectionMark,
  isVertical,
  item,
  name,
  optionStyle,
  ...props
}: ButtonProps<'button'> & {
  isSelected: boolean;
  isSingleChoice: boolean;
  hasSelectionMark: boolean;
  isVertical: boolean;
  name: string;
  item: CheckboxItem;
  optionStyle?: 'default' | 'simplified';
}) => {
  return (
    <Button
      aria-checked={isSelected}
      aria-label={[item.label, item.hint, item.badge]
        .filter(Boolean)
        .join(', ')}
      className={classNames(isVertical ? '!h-auto typo-subhead' : 'typo-body', {
        simplified: optionStyle === 'simplified',
        relative: !!item.badge || (hasSelectionMark && isVertical),
        'overflow-visible': !!item.badge,
      })}
      data-funnel-track={FunnelTargetId.QuizInput}
      name={name}
      pressed={isSelected}
      role="checkbox"
      type="button"
      value={item.value}
      {...props}
    >
      {!!item.badge && (
        <span className="absolute -top-2.5 right-4 whitespace-nowrap rounded-max bg-brand-default px-2 py-0.5 font-bold text-white typo-caption2">
          {item.badge}
        </span>
      )}
      {hasSelectionMark && isVertical && (
        <SelectionMark
          isSelected={isSelected}
          isSingleChoice={isSingleChoice}
          className="absolute right-2 top-2"
        />
      )}
      <div
        className={classNames(
          'flex min-h-12 flex-1 items-center',
          item.icon ? 'gap-3' : 'gap-2',
          isVertical
            ? 'min-w-full flex-col justify-center py-2'
            : 'flex-row justify-start text-left',
        )}
      >
        {(isVertical || item.image || item.icon) && (
          <div
            className={classNames(
              'relative',
              isVertical ? 'size-14' : 'size-6',
              !!item.icon && 'flex items-center justify-center',
            )}
          >
            {item.icon}
            {!item.icon && !!item.image && (
              <img
                alt={item.label}
                className="absolute left-0 top-0 h-full w-full object-contain object-center"
                loading="lazy"
                {...item.image}
              />
            )}
          </div>
        )}
        <span
          className={classNames('flex-1 whitespace-break-spaces', {
            'py-1': !isVertical,
          })}
        >
          {item.label}
        </span>
        {!!item.hint && (
          <span className="shrink-0 text-text-tertiary typo-callout">
            {item.hint}
          </span>
        )}
        {hasSelectionMark && !isVertical && (
          <SelectionMark
            isSelected={isSelected}
            isSingleChoice={isSingleChoice}
          />
        )}
      </div>
    </Button>
  );
};

export const FormInputCheckboxGroup = ({
  behaviour,
  defaultValue = [],
  name,
  onValueChange,
  options = [],
  cols = 1,
  value,
  variant = CheckboxGroupVariant.Horizontal,
  optionStyle,
  hasSelectionMark = false,
}: FormInputCheckboxGroupProps): ReactElement => {
  const [checkedValue, setCheckedValue] =
    useState<CheckboxValues>(defaultValue);
  const isControlledInput = value !== undefined;
  const inputValue = isControlledInput ? value : checkedValue;
  const isVertical = variant === CheckboxGroupVariant.Vertical;
  const isSingleChoice = behaviour === CheckboxGroupBehaviour.Radio;

  const onSelect = (selectedValue: CheckboxValue) => {
    const newValue = getChangedValue({
      isSingleChoice,
      value: inputValue,
      selectedValue,
    });
    onValueChange?.(newValue);
    setCheckedValue(newValue);
  };

  return (
    <div
      className={classNames(`grid-cols-${cols} grid gap-2`, {
        'pt-2': options.some((option) => option.badge),
      })}
      role="group"
    >
      {options.map((item) => (
        <FormInputCheckbox
          isSelected={inputValue.includes(item.value)}
          isSingleChoice={isSingleChoice}
          hasSelectionMark={hasSelectionMark}
          isVertical={isVertical}
          item={item}
          key={item.value}
          name={name}
          onClick={() => onSelect(item.value)}
          size={ButtonSize.XLarge}
          variant={ButtonVariant.Quiz}
          optionStyle={optionStyle}
        />
      ))}
    </div>
  );
};
