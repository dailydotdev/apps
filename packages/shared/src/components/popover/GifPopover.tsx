import { Popover, PopoverTrigger } from '@radix-ui/react-popover';
import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import type { ButtonProps } from '../buttons/Button';
import { Button } from '../buttons/Button';
import { PopoverContent } from './Popover';
import { TextField } from '../fields/TextField';
import useDebounceFn from '../../hooks/useDebounceFn';
import useGif from '../../hooks/useGif';
import { MiniCloseIcon, StarIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { GenericLoaderSpinner } from '../utilities/loaders';
import { IconSize } from '../Icon';
import { useViewSize, ViewSize } from '../../hooks';
import { Drawer } from '../drawers';

const searchSuggestions = [
  'Nodding zoom',
  'Hamster looking into camera',
  'Jennifer Lawrence okay',
  'Elmo burning',
  'Mr Bean waiting',
  'Dancing dog',
  'Eye roll',
  'TWICE',
  'Hackerman',
  'Steve Carell cheers',
];

type GifPopoverProps = {
  buttonProps: Pick<ButtonProps<'button'>, 'size' | 'variant' | 'icon'>;
  onGifCommand?: (gifUrl: string, altText: string) => Promise<void>;
  textareaRef?: React.MutableRefObject<HTMLTextAreaElement>;
};

type GifPickerContentProps = {
  query: string;
  debounceQuery: (value: string) => void;
  debounceNextPage: () => void;
  isLoadingGifs: boolean;
  gifsToDisplay: ReturnType<typeof useGif>['data'];
  favorites: ReturnType<typeof useGif>['favorites'];
  favorite: ReturnType<typeof useGif>['favorite'];
  scrollRef: (node?: Element | null) => void;
  handleGifClick: (gif: { url: string; title: string }) => void;
  showLoadingSpinner: boolean;
};

const GifPickerContent = ({
  query,
  debounceQuery,
  debounceNextPage,
  isLoadingGifs,
  gifsToDisplay,
  favorites,
  favorite,
  scrollRef,
  handleGifClick,
  showLoadingSpinner,
}: GifPickerContentProps) => (
  <>
    <div className="mb-2 shrink-0">
      <TextField
        value={query}
        onChange={(e) => debounceQuery(e.target.value)}
        onKeyDown={(e) => {
          // Prevent Enter key from submitting the parent form
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
        inputId="gifs"
        label="Search Tenor"
        placeholder={
          searchSuggestions[
            Math.floor(Math.random() * searchSuggestions.length)
          ]
        }
      />
    </div>
    <div
      className="min-h-0 min-w-0 max-w-full flex-1 overflow-x-hidden overflow-y-scroll"
      onScroll={() => debounceNextPage()}
    >
      {!isLoadingGifs && gifsToDisplay?.length > 0 && (
        <>
          <div className="grid min-w-0 max-w-full grid-cols-2 gap-2">
            {gifsToDisplay.map((gif, idx) => (
              <div
                className="relative"
                key={gif.id}
                ref={idx === gifsToDisplay.length - 1 ? scrollRef : null}
              >
                <div className="z-10 absolute right-2 top-2 rounded-16 bg-overlay-primary-pepper">
                  <Button
                    icon={
                      <StarIcon
                        secondary={favorites?.some((f) => f.id === gif.id)}
                        className="text-accent-cheese-bolder"
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
          {showLoadingSpinner && (
            <div className="flex items-center justify-center py-4">
              <GenericLoaderSpinner size={IconSize.XLarge} />
            </div>
          )}
        </>
      )}
      {!isLoadingGifs && (!gifsToDisplay || gifsToDisplay.length === 0) && (
        <div className="flex h-full w-full min-w-0 items-center justify-center px-4">
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
            className="w-full min-w-0 whitespace-normal break-words text-center"
          >
            {!query
              ? 'You have no favorites yet. Add some, and they will appear here!'
              : 'no results matching your search 😞'}
          </Typography>
        </div>
      )}
    </div>
  </>
);

const GifPopover = ({
  buttonProps,
  onGifCommand,
  textareaRef,
}: GifPopoverProps) => {
  const isTablet = useViewSize(ViewSize.Tablet);
  const { ref: scrollRef, inView } = useInView({
    threshold: 0.5,
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
    favoritesEnabled: open,
  });
  const [debounceNextPage] = useDebounceFn<void>(() => {
    if (inView && data?.length > 0 && !isFetchingNextPage && query) {
      fetchNextPage();
    }
  }, 500);

  const gifsToDisplay = !query ? favorites : data;
  const isLoadingGifs = !query ? isFetchingFavorites : isLoading;

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

    await onGifCommand?.(gif.url, 'GIF');
    setOpen(false);
    setQuery('');
  };

  const handleClose = () => {
    setOpen(false);
    setQuery('');
  };

  const contentProps: GifPickerContentProps = {
    query,
    debounceQuery,
    debounceNextPage,
    isLoadingGifs,
    gifsToDisplay,
    favorites,
    favorite,
    scrollRef,
    handleGifClick,
    showLoadingSpinner: !!query,
  };

  if (!isTablet) {
    return (
      <>
        <Button
          {...buttonProps}
          type="button"
          onClick={() => handleOpenChange(true)}
        />
        <Drawer
          isOpen={open}
          onClose={handleClose}
          isFullScreen
          className={{ wrapper: 'flex flex-col p-4' }}
        >
          <div className="mb-2 flex shrink-0 items-center justify-between">
            <Typography type={TypographyType.Title3} bold>
              GIFs
            </Typography>
            <Button
              icon={<MiniCloseIcon />}
              onClick={handleClose}
              aria-label="Close"
            />
          </div>
          <GifPickerContent {...contentProps} />
        </Drawer>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button {...buttonProps} />
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        avoidCollisions
        className="flex h-[25rem] w-screen flex-col rounded-16 border border-border-subtlest-tertiary bg-background-popover p-4 data-[side=bottom]:mt-1 data-[side=top]:mb-1 tablet:w-[31.25rem]"
      >
        <GifPickerContent {...contentProps} />
      </PopoverContent>
    </Popover>
  );
};

export default GifPopover;
