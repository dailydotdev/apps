import React, { ReactElement } from 'react';
import RadioItem from './RadioItem';

export type RadioProps = {
  name: string;
  options: string[];
  value?: string;
  onChange: (value: string) => unknown;
};

export default function Radio({
  name,
  options,
  value,
  onChange,
}: RadioProps): ReactElement {
  return (
    <div className="flex flex-col -my-0.5 items-start">
      {options.map((option, key) => (
        <RadioItem
          key={key}
          name={name}
          value={option}
          checked={value === option}
          onChange={() => onChange(option)}
          className="my-0.5 capitalize"
        >
          {option}
        </RadioItem>
      ))}
    </div>
  );
}
