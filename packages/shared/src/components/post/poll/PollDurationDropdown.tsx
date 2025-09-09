import React, { useState } from 'react';
import { Typography, TypographyType } from '../../typography/Typography';
import { useWritePostContext } from '../../../contexts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../dropdown/DropdownMenu';
import { ButtonVariant } from '../../buttons/common';
import { Button } from '../../buttons/Button';
import { ArrowIcon } from '../../icons';

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
      <DropdownMenu>
        <DropdownMenuTrigger className="w-full tablet:w-52" asChild>
          <Button
            variant={ButtonVariant.Float}
            className="!justify-between !px-3 !font-normal !typo-callout"
          >
            {options[selectedIndex].label}
            <ArrowIcon
              className="ml-auto rotate-90 laptop:rotate-180"
              secondary
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={10}
          className="flex w-[var(--radix-popper-anchor-width)] flex-col gap-1 overflow-y-auto overflow-x-hidden !p-0"
        >
          {options.map(({ label }, index) => (
            <DropdownMenuItem
              key={label}
              className="hover:bg-surface-float"
              onClick={() => handleChange(label, index)}
            >
              <Typography
                type={TypographyType.Body}
                bold={selectedIndex === index}
              >
                {label}
              </Typography>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default PollDurationDropdown;
