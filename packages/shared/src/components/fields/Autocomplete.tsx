import { Popover, PopoverAnchor } from '@radix-ui/react-popover';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import type { TextFieldProps } from './TextField';
import { TextField } from './TextField';
import { PopoverContent } from '../popover/Popover';
import { Typography, TypographyType } from '../typography/Typography';
import { GenericLoaderSpinner } from '../utilities/loaders';
import { IconSize } from '../Icon';
import { Image } from '../image/Image';

interface AutocompleteProps
  extends Omit<TextFieldProps, 'inputId' | 'onChange' | 'onSelect'> {
  name: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  selectedValue?: string;
  selectedImage?: string;
  options: Array<{ value: string; label: string; image?: string }>;
  isLoading: boolean;
  resetOnBlur?: boolean;
}

const Autocomplete = ({
  name,
  isLoading,
  options,
  label,
  onChange,
  onSelect,
  selectedValue,
  selectedImage,
  defaultValue,
  resetOnBlur = true,
  ...restProps
}: AutocompleteProps) => {
  const [input, setInput] = useState(defaultValue || '');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hasLoaded = useRef(false);

  // So that we don't show "no results" before the first request is made.
  useEffect(() => {
    if (!hasLoaded.current && isLoading) {
      hasLoaded.current = true;
    }
  }, [isLoading]);

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
    if (resetOnBlur) {
      setInput(options.find((opt) => opt.value === selectedValue)?.label || '');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Typography type={TypographyType.Callout} bold>
        {label}
      </Typography>
      <Popover open={isOpen && hasLoaded.current}>
        <PopoverAnchor asChild>
          <TextField
            leftIcon={
              selectedImage ? (
                <Image
                  className="size-6 rounded-full"
                  src={selectedImage}
                  alt={selectedValue}
                />
              ) : undefined
            }
            label={label}
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
          className="rounded-16 border border-border-subtlest-tertiary bg-background-popover data-[side=bottom]:mt-1 data-[side=top]:mb-1"
          side="bottom"
          align="start"
          avoidCollisions
          sameWidthAsAnchor
          onOpenAutoFocus={(e) => e.preventDefault()} // keep focus in input
          onCloseAutoFocus={(e) => e.preventDefault()} // avoid refocus jumps
        >
          {!isLoading ? (
            <div className="bg-red flex w-full flex-col">
              {options?.length > 0 ? (
                options.map((opt) => (
                  <button
                    type="button"
                    className={classNames(
                      'flex flex-row items-center gap-2 px-4 py-2 text-left hover:bg-surface-hover',
                      selectedValue === opt.value &&
                        'font-bold hover:bg-surface-hover',
                    )}
                    key={opt.value}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(opt);
                    }}
                  >
                    {opt?.image && (
                      <Image
                        className="size-6 rounded-full"
                        src={opt.image}
                        alt={opt.label}
                      />
                    )}
                    {opt.label}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2">
                  <Typography>No results</Typography>
                </div>
              )}
            </div>
          ) : (
            <GenericLoaderSpinner className="mx-auto" size={IconSize.Small} />
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Autocomplete;
