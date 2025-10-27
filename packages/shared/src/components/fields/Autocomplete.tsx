import { Popover, PopoverAnchor } from '@radix-ui/react-popover';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import type { TextFieldProps } from './TextField';
import { TextField } from './TextField';
import { PopoverContent } from '../popover/Popover';
import { Typography } from '../typography/Typography';
import { GenericLoaderSpinner } from '../utilities/loaders';
import { IconSize } from '../Icon';

interface AutocompleteProps
  extends Omit<TextFieldProps, 'inputId' | 'onChange' | 'onSelect'> {
  name: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  selectedValue?: string;
  options: Array<{ value: string; label: string }>;
  isLoading?: boolean;
}

const Autocomplete = ({
  name,
  isLoading,
  options,
  onChange,
  onSelect,
  selectedValue,
  defaultValue,
  ...restProps
}: AutocompleteProps) => {
  const [input, setInput] = useState(defaultValue || '');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const handleChange = (val: string) => {
    setInput(val);
    onChange(val);
  };
  const handleSelect = (opt: { value: string; label: string }) => {
    setInput(opt.label);
    onSelect(opt.value);
    setIsOpen(false);
    inputRef.current?.focus();
  };
  const handleBlur = () => {
    setIsOpen(false);
    setInput(options.find((opt) => opt.value === selectedValue)?.label || '');
  };

  return (
    <Popover open={isOpen}>
      <PopoverAnchor asChild>
        <TextField
          inputRef={(ref) => {
            inputRef.current = ref;
          }}
          inputId={name}
          {...restProps}
          onChange={(e) => {
            handleChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          value={input}
          autoComplete="off"
        />
      </PopoverAnchor>
      <PopoverContent
        className="rounded-16 border border-border-subtlest-tertiary bg-background-popover p-4 data-[side=bottom]:mt-1 data-[side=top]:mb-1"
        side="bottom"
        align="start"
        avoidCollisions
        sameWidthAsAnchor
        onOpenAutoFocus={(e) => e.preventDefault()} // keep focus in input
        onCloseAutoFocus={(e) => e.preventDefault()} // avoid refocus jumps
      >
        {!isLoading ? (
          <div className="flex w-full flex-col">
            {options?.length > 0 ? (
              options.map((opt) => (
                <button
                  type="button"
                  className={classNames(
                    'text-left',
                    selectedValue === opt.value && 'font-bold',
                  )}
                  key={opt.value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(opt);
                  }}
                >
                  {opt.label}
                </button>
              ))
            ) : (
              <Typography>No results</Typography>
            )}
          </div>
        ) : (
          <GenericLoaderSpinner className="mx-auto" size={IconSize.Small} />
        )}
      </PopoverContent>
    </Popover>
  );
};

export default Autocomplete;
