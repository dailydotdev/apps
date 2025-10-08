import { Popover, PopoverTrigger } from '@radix-ui/react-popover';
import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import type { ButtonProps } from '../buttons/Button';
import { Button } from '../buttons/Button';
import { PopoverContent } from './Popover';
import { Typography, TypographyType } from '../typography/Typography';
import { TextField } from '../fields/TextField';
import useDebounceFn from '../../hooks/useDebounceFn';
import useGif from '../../hooks/useGif';
import { StarIcon } from '../icons';

const searchSuggestions = [
  'Nodding zoom',
  'Hamster looking into camera',
  'Jennifer Lawrence okay',
  'Elmo burning',
  'Mr Bean waiting',
  'Dancing dog',
  'Eye roll',
  'Runescape gnome',
  'Tzuyu from TWICE',
  'Hackerman',
  'Steve Carel cheers',
];

type GifPopoverProps = {
  buttonProps: Pick<ButtonProps<'button'>, 'size' | 'variant' | 'icon'>;
  onGifCommand?: (gifUrl: string, altText: string) => Promise<void>;
  textareaRef?: React.MutableRefObject<HTMLTextAreaElement>;
};

const GifPopover = ({
  buttonProps,
  onGifCommand,
  textareaRef,
}: GifPopoverProps) => {
  const { ref: scrollRef, inView } = useInView({
    rootMargin: '20px',
    threshold: 1,
  });
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [savedSelection, setSavedSelection] = React.useState<[number, number]>([
    0, 0,
  ]);
  const [debounceQuery] = useDebounceFn<string>(
    (value) => setQuery(value),
    300,
  );
  const {
    data,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    favorite,
    favorites,
  } = useGif({
    query,
    limit: '20',
  });

  useEffect(() => {
    if (inView && data?.length > 0 && !isFetchingNextPage && query) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, isLoading, isFetchingNextPage, fetchNextPage]);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && textareaRef?.current) {
      setSavedSelection([
        textareaRef.current.selectionStart,
        textareaRef.current.selectionEnd,
      ]);
    }
    setOpen(isOpen);
  };

  const handleGifClick = async (gif: { url: string; title: string }) => {
    if (textareaRef?.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = savedSelection[0];
      textareaRef.current.selectionEnd = savedSelection[1];
    }

    await onGifCommand?.(gif.url, gif.title);
    setOpen(false);
    setQuery('');
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button {...buttonProps} />
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        avoidCollisions
        className="h-[25rem] w-[31.25rem] overflow-y-scroll rounded-16 border border-border-subtlest-tertiary bg-background-popover p-4 data-[side=bottom]:mt-1 data-[side=top]:mb-1"
      >
        <div className="mb-2">
          <TextField
            value={query}
            onChange={(e) => debounceQuery(e.target.value)}
            inputId="gifs"
            label="Search Tenor"
            placeholder={
              searchSuggestions[
                Math.floor(Math.random() * searchSuggestions.length)
              ]
            }
          />
        </div>
        {!query && (
          <Typography type={TypographyType.Callout}>Search Tenor</Typography>
        )}
        {data?.length > 0 && !isLoading && (
          <div className="grid grid-cols-2 gap-2">
            {data.map((gif) => (
              <div className="relative" key={gif.id}>
                <div className="z-10 absolute right-2 top-2 rounded-16 bg-background-popover">
                  <Button
                    icon={
                      <StarIcon
                        secondary={favorites?.some((f) => f.id === gif.id)}
                      />
                    }
                    onClick={() => favorite(gif)}
                  />
                </div>
                <button
                  className="mb-auto"
                  type="button"
                  onClick={() =>
                    handleGifClick({ url: gif.url, title: gif.title })
                  }
                >
                  <img
                    src={gif.preview}
                    alt={gif.title}
                    className="h-auto w-full cursor-pointer rounded-8 object-cover"
                  />
                </button>
              </div>
            ))}
          </div>
        )}
        <div ref={scrollRef} />
      </PopoverContent>
    </Popover>
  );
};

export default GifPopover;
