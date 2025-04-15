import type { ComponentProps, PropsWithChildren, ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonVariant,
  ButtonSize,
} from '../../../components/buttons/Button';
import type { ButtonProps } from '../../../components/buttons/Button';
import { FunnelTargetId } from '../../onboarding/types/funnelEvents';

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

const FormInputCheckbox = ({
  isSelected,
  isVertical,
  item,
  name,
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
      className={classNames(isVertical ? '!h-auto typo-subhead' : 'typo-body')}
      data-funnel-track={FunnelTargetId.QuizInput}
      name={name}
      pressed={isSelected}
      role="checkbox"
      type="button"
      value={item.value}
      {...props}
    >
      <div
        className={classNames(
          'flex min-h-12 flex-1 items-center gap-2',
          isVertical
            ? 'min-w-full flex-col justify-center py-2'
            : 'flex-row justify-start text-left',
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
        <span
          className={classNames('flex-1 whitespace-break-spaces', {
            'py-1': !isVertical,
          })}
        >
          {item.label}
        </span>
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
}: FormInputCheckboxGroupProps): ReactElement => {
  const [checkedValue, setCheckedValue] = useState<CheckboxValues | undefined>(
    defaultValue,
  );
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
