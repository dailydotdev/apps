import type { ReactElement, PropsWithChildren, ComponentProps } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonVariant } from '../../../components/buttons/Button';

type RatingValue = number;

export interface FormInputRatingProps
  extends PropsWithChildren<ComponentProps<'div'>> {
  max: number;
  min: number;
  name: string;
  onValueChange: (value: RatingValue) => void;
  value?: RatingValue;
  defaultValue?: RatingValue;
}

const validateRatingValue = (
  value: number,
  min: number,
  max: number,
): boolean => {
  return value >= min && value <= max;
};

export const FormInputRating = ({
  children,
  className,
  defaultValue,
  max,
  min,
  name,
  onValueChange,
  value,
}: FormInputRatingProps): ReactElement => {
  const [checkedValue, setCheckedValue] = useState<RatingValue | undefined>(
    defaultValue,
  );
  const isControlledInput = value !== undefined;
  const inputValue = isControlledInput ? value : checkedValue;

  if (max < min) {
    throw new Error('max must be greater than or equal to min');
  }

  if (inputValue && !validateRatingValue(inputValue, min, max)) {
    throw new Error(`defaultValue must be between ${min} and ${max}`);
  }

  const items = useMemo(
    () => Array.from({ length: max - min + 1 }, (_, index) => index + min),
    [min, max],
  );

  const onSelect = (selectedValue: RatingValue) => {
    if (!validateRatingValue(selectedValue, min, max)) {
      return;
    }
    setCheckedValue(selectedValue);
    onValueChange(selectedValue);
  };

  return (
    <div className="flex flex-col gap-3">
      Active: {inputValue}
      <div className="flex flex-row gap-2" role="radiogroup">
        {items.map((itemValue) => {
          const isSelected = itemValue === inputValue;
          return (
            <Button
              aria-checked={isSelected}
              aria-label={`${itemValue} stars`}
              aria-posinset={itemValue}
              aria-setsize={items.length}
              className={classNames(
                'h-16 min-w-10 flex-1 border border-border-subtlest-tertiary',
                className,
              )}
              key={itemValue}
              name={name}
              onClick={() => onSelect(itemValue)}
              role="radio"
              type="button"
              variant={
                isSelected ? ButtonVariant.Tertiary : ButtonVariant.Float
              }
            >
              {itemValue}
            </Button>
          );
        })}
      </div>
      {!!children && (
        <div className="flex flex-row justify-between gap-2">{children}</div>
      )}
    </div>
  );
};
