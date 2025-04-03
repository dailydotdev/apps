import type { ReactElement, PropsWithChildren, ComponentProps } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonVariant } from '../../../components/buttons/Button';

type RatingValue = number;

export interface FormInputRatingProps
  extends PropsWithChildren<ComponentProps<'div'>> {
  /**
   * @default 5
   */
  max: number;
  /**
   * @default 1
   */
  min: number;
  name: string;
  onValueChange?: (value: RatingValue) => void;
  value?: RatingValue;
  defaultValue?: RatingValue;
}

const validateRatingValue = (
  value: number,
  min?: number,
  max?: number,
): boolean => {
  return value >= min && value <= max;
};

export const FormInputRating = ({
  children,
  className,
  defaultValue,
  max = 5,
  min = 1,
  name,
  onValueChange,
  value,
  ...attrs
}: FormInputRatingProps): ReactElement => {
  const [checkedValue, setCheckedValue] = useState<RatingValue | undefined>(
    defaultValue,
  );
  const isControlledInput = value !== undefined;
  const inputValue = isControlledInput ? value : checkedValue;
  const maxValue = max > min ? max : min + 1;

  const items = Array.from(
    { length: maxValue - min + 1 },
    (_, index) => index + min,
  );

  const onSelect = (selectedValue: RatingValue) => {
    if (!validateRatingValue(selectedValue, min, maxValue)) {
      return;
    }
    setCheckedValue(selectedValue);
    onValueChange?.(selectedValue);
  };

  return (
    <div className="flex flex-col gap-3" {...attrs}>
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
              variant={ButtonVariant.Quiz}
            >
              <span className="inline-block min-w-full">{itemValue}</span>
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
