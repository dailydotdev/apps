import type { ComponentProps, PropsWithChildren, ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonVariant,
  ButtonSize,
} from '../../../components/buttons/Button';
import type { ButtonProps } from '../../../components/buttons/Button';

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

const FormInputCheckbox = ({
  isSelected,
  isVertical,
  name,
  item,
  ...props
}: ButtonProps<'button'> & {
  isSelected: boolean;
  isVertical: boolean;
  name: string;
  item: CheckboxItem;
}) => {
  return (
    <Button
      aria-checked={isSelected}
      aria-label={item.label}
      className={classNames(isVertical ? 'typo-subhead' : 'typo-body')}
      pressed={isSelected}
      name={name}
      role="checkbox"
      type="button"
      value={item.value}
      {...props}
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
};

export const FormInputCheckboxGroup = ({
  defaultValue = [],
  name,
  onValueChange,
  options = [],
  cols = 1,
  value,
  variant = CheckboxGroupVariant.Horizontal,
}: FormInputCheckboxGroupProps): ReactElement => {
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
    <div className={`grid-cols-${cols} grid gap-2`} role="group">
      {options.map((item) => (
        <FormInputCheckbox
          isSelected={inputValue.includes(item.value)}
          isVertical={isVertical}
          item={item}
          key={item.value}
          name={name}
          onClick={() => onSelect(item.value)}
          size={ButtonSize.XLarge}
          variant={ButtonVariant.Quiz}
        />
      ))}
    </div>
  );
};
