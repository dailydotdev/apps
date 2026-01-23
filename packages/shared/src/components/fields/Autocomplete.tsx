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

type AutocompleteOption = { value: string; label: string; image?: string };

interface AutocompleteProps
  extends Omit<TextFieldProps, 'inputId' | 'onChange' | 'onSelect' | 'onBlur'> {
  name: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  onBlur?: () => void;
  selectedValue?: string;
  options: Array<AutocompleteOption>;
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
  onBlur: onBlurProp,
  selectedValue,
  defaultValue,
  resetOnBlur = true,
  ...restProps
}: AutocompleteProps) => {
  const [input, setInput] = useState(defaultValue || '');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedOption, setSelectedOption] = useState(undefined);

  /* 
   To prevent flickering of the selected option image as the user types.
   We want to set the selected option only when the selected value changes or the user clears the selected value.
  */
  useEffect(() => {
    if (!selectedValue) {
      setSelectedOption(undefined);
      return;
    }
    if (selectedOption?.value !== selectedValue) {
      setSelectedOption(options.find((opt) => opt.value === selectedValue));
    }
  }, [selectedValue, options, selectedOption]);

  const handleChange = (val: string) => {
    setInput(val);
    onChange(val);
  };

  const handleSelect = (opt: AutocompleteOption) => {
    setInput(opt.label);
    onSelect(opt.value);
    setIsFocused(false);
    inputRef.current?.focus();
  };
  const handleBlur = () => {
    setIsFocused(false);
    if (resetOnBlur) {
      setInput(options.find((opt) => opt.value === selectedValue)?.label || '');
    }
    onBlurProp?.();
  };

  const isSecondaryField = restProps.fieldType === 'secondary';

  return (
    <div className="flex flex-col gap-2">
      {!isSecondaryField && (
        <Typography type={TypographyType.Callout} bold>
          {label}
        </Typography>
      )}
      <Popover open={isFocused && (isLoading || options.length > 0)}>
        <PopoverAnchor asChild>
          <TextField
            leftIcon={
              selectedOption?.image ? (
                <Image
                  className="size-6 rounded-full"
                  src={selectedOption.image}
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
              setIsFocused(true);
            }}
            onFocus={() => setIsFocused(true)}
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
            <div className="flex w-full flex-col">
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
