import { Popover, PopoverTrigger } from '@radix-ui/react-popover';
import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import type { ButtonProps } from '../buttons/Button';
import { Button } from '../buttons/Button';
import { PopoverContent } from './Popover';
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
    500,
  );
  const {
    data,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    favorite,
    favorites,
    isFetchingFavorites,
  } = useGif({
    query,
    limit: '20',
  });

  useEffect(() => {
    if (inView && data?.length > 0 && !isFetchingNextPage && query) {
      fetchNextPage();
    }
    // No need to update on query change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, isLoading, isFetchingNextPage, fetchNextPage]);

  const showingFavorites = !query;
  const gifsToDisplay = showingFavorites ? favorites : data;
  const isLoadingGifs = showingFavorites ? isFetchingFavorites : isLoading;

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
      const [selectionStart, selectionEnd] = savedSelection;
      const currentTextarea = textareaRef.current;

      currentTextarea.focus();
      currentTextarea.selectionStart = selectionStart;
      currentTextarea.selectionEnd = selectionEnd;
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
        {gifsToDisplay?.length > 0 && !isLoadingGifs && (
          <div className="grid grid-cols-2 gap-2">
            {gifsToDisplay.map((gif) => (
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
                    className="h-auto min-h-32 w-full cursor-pointer rounded-8 object-cover"
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
