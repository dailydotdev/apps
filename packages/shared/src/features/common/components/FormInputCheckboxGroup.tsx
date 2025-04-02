import type { ComponentProps, PropsWithChildren } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonVariant,
  ButtonSize,
} from '../../../components/buttons/Button';

type CheckboxValue = string;
type CheckboxValues = string[];

export interface CheckboxItem {
  image?: ComponentProps<'img'>;
  label: string;
  value: CheckboxValue;
}

export enum CheckboxGroupVariant {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

export interface FormInputCheckboxGroupProps
  extends PropsWithChildren<ComponentProps<'div'>> {
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
}

const getChangedValue = (
  value: CheckboxValues,
  selectedValue: CheckboxValue,
): CheckboxValues => {
  const isSelected = value.includes(selectedValue);
  return isSelected
    ? value.filter((item) => item !== selectedValue)
    : [...value, selectedValue];
};

export const FormInputCheckboxGroup = ({
  defaultValue = [],
  name,
  onValueChange,
  options = [],
  cols = 1,
  value,
  variant = CheckboxGroupVariant.Horizontal,
}: FormInputCheckboxGroupProps) => {
  const [checkedValue, setCheckedValue] = useState<CheckboxValues | undefined>(
    defaultValue,
  );
  const isControlledInput = value !== undefined;
  const inputValue = isControlledInput ? value : checkedValue;
  const isVertical = variant === CheckboxGroupVariant.Vertical;

  const onSelect = (selectedValue: CheckboxValue) => {
    const newValue = getChangedValue(inputValue, selectedValue);
    onValueChange?.(newValue);
    setCheckedValue(newValue);
  };

  return (
    <div className={`grid-cols-${cols} grid gap-2`}>
      {options.map((item) => {
        const isSelected = inputValue?.includes(item.value);
        return (
          <Button
            key={item.value}
            aria-checked={isSelected}
            aria-describedby={item.label}
            aria-label={item.label}
            className={classNames(isVertical && 'typo-subhead')}
            pressed={isSelected}
            name={name}
            onClick={() => onSelect(item.value)}
            role="checkbox"
            size={ButtonSize.XLarge}
            type="button"
            value={item.value}
            variant={ButtonVariant.Checkbox}
          >
            <div
              className={classNames(
                'flex min-h-12 items-center gap-2',
                isVertical
                  ? 'min-w-full flex-col justify-center py-2'
                  : 'flex-row justify-start',
              )}
            >
              {(isVertical || item.image) && (
                <div
                  className={classNames(
                    'relative',
                    isVertical ? 'size-14' : 'size-6',
                  )}
                >
                  {!!item.image && (
                    <img
                      alt={item.label}
                      className="absolute left-0 top-0 h-full w-full object-contain object-center"
                      loading="lazy"
                      {...item.image}
                    />
                  )}
                </div>
              )}
              <span>{item.label}</span>
            </div>
          </Button>
        );
      })}
    </div>
  );
};
