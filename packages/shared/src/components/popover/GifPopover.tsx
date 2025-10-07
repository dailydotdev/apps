import { Popover, PopoverTrigger } from '@radix-ui/react-popover';
import React, { useState } from 'react';
import type { ButtonProps } from '../buttons/Button';
import { Button } from '../buttons/Button';
import { PopoverContent } from './Popover';
import { Typography, TypographyType } from '../typography/Typography';
import { TextField } from '../fields/TextField';
import useDebounceFn from '../../hooks/useDebounceFn';
import useGifQuery from '../../hooks/useGifQuery';

type GifPopoverProps = {
  buttonProps: Pick<ButtonProps<'button'>, 'size' | 'variant' | 'icon'>;
};

const GifPopover = ({ buttonProps }: GifPopoverProps) => {
  const [query, setQuery] = useState('');
  const [debounceQuery] = useDebounceFn<string>(
    (value) => setQuery(value),
    300,
  );
  const { data, isLoading } = useGifQuery({ query, limit: '10' });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button {...buttonProps} />
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        avoidCollisions
        className="max-h-[25rem] w-76 overflow-y-scroll rounded-16 border border-border-subtlest-tertiary bg-background-popover p-4 data-[side=bottom]:mt-1 data-[side=top]:mb-1"
      >
        <div className="mb-2">
          <TextField
            value={query}
            onChange={(e) => debounceQuery(e.target.value)}
            placeholder="Search Tenor"
            inputId=""
            label=""
          />
        </div>
        {!query && (
          <Typography type={TypographyType.Callout}>Search Tenor</Typography>
        )}
        {data?.length > 0 && !isLoading && (
          <div className="flex flex-col gap-1">
            {data.map((gif) => (
              <img
                key={gif.id}
                src={gif.preview}
                alt={gif.title}
                className="h-auto w-full cursor-pointer rounded-8 object-cover"
              />
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default GifPopover;
