import React, { useState } from 'react';
import { Dropdown } from '../../fields/Dropdown';
import { ButtonSize } from '../../buttons/common';
import { Typography, TypographyType } from '../../typography/Typography';
import { useWritePostContext } from '../../../contexts';

const options = [
  {
    label: '1 day',
    value: 1,
  },
  {
    label: '3 days',
    value: 3,
  },
  {
    label: '7 days',
    value: 7,
  },
  {
    label: '14 days',
    value: 14,
  },
  {
    label: '30 days',
    value: 30,
  },
  {
    label: 'No end date',
    value: undefined,
  },
];

const PollDurationDropdown = () => {
  const { draft, updateDraft } = useWritePostContext();
  const [selectedIndex, setSelectedIndex] = useState(
    draft?.duration
      ? options.indexOf(options.find(({ value }) => value === draft?.duration))
      : 2,
  );

  const handleChange = (_: string, index: number) => {
    updateDraft({ ...draft, duration: options[index].value });
    setSelectedIndex(index);
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="hidden"
        name="duration"
        value={options[selectedIndex].value}
      />
      <Typography type={TypographyType.Body} bold>
        Poll duration
      </Typography>
      <Dropdown
        className={{
          container: 'w-full tablet:w-52',
        }}
        options={options.map(({ label }) => label)}
        buttonSize={ButtonSize.Medium}
        selectedIndex={selectedIndex}
        onChange={handleChange}
      />
    </div>
  );
};

export default PollDurationDropdown;
