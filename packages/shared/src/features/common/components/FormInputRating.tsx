import type { ReactElement, PropsWithChildren, ComponentProps } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonVariant } from '../../../components/buttons/Button';

type RatingValue = string;
type OptionItem = {
  label: string;
  value: RatingValue;
};

export interface FormInputRatingProps
  extends PropsWithChildren<ComponentProps<'div'>> {
  defaultValue?: RatingValue;
  name: string;
  onValueChange?: (value: RatingValue) => void;
  options?: OptionItem[];
  value?: RatingValue;
}

const defaultOptions: OptionItem[] = Array.from({ length: 5 }, (_, i) => ({
  label: `${i + 1}`,
  value: `${i + 1}`,
}));

export const FormInputRating = ({
  children,
  className,
  defaultValue,
  name,
  onValueChange,
  options = defaultOptions,
  value,
  ...attrs
}: FormInputRatingProps): ReactElement => {
  const [checkedValue, setCheckedValue] = useState<RatingValue | undefined>(
    defaultValue,
  );
  const isControlledInput = value !== undefined;
  const inputValue = isControlledInput ? value : checkedValue;

  const onSelect = (selectedValue: RatingValue) => {
    setCheckedValue(selectedValue);
    onValueChange?.(selectedValue);
  };

  return (
    <div className="flex flex-col gap-3" {...attrs}>
      <div className="flex flex-row gap-2" role="radiogroup">
        {options.map((item, index) => {
          const isSelected = item.value === inputValue;
          return (
            <Button
              aria-checked={isSelected}
              aria-label={`${item.label} stars`}
              aria-posinset={index + 1}
              aria-setsize={options.length}
              className={classNames(
                'h-16 min-w-10 flex-1 border border-border-subtlest-tertiary',
                className,
              )}
              key={item.value}
              name={name}
              onClick={() => onSelect(item.value)}
              role="radio"
              type="button"
              variant={ButtonVariant.Quiz}
            >
              <span className="inline-block min-w-full">{item.label}</span>
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
