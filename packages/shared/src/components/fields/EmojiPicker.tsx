import type { ReactElement, ReactNode } from 'react';
import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import classNames from 'classnames';
import { Button, ButtonVariant } from '../buttons/Button';
import { RootPortal } from '../tooltips/Portal';
import { Typography, TypographyType } from '../typography/Typography';
import type {
  EmojiCategory,
  EmojiCategoryId,
  EmojiOption,
} from '../../lib/emojis';
import {
  emojiCategories,
  findEmojiOption,
  getRecentEmojis,
  saveRecentEmoji,
  searchEmojis,
} from '../../lib/emojis';

const DROPDOWN_GAP = 4;
const VIEWPORT_MARGIN = 12;
const MIN_DROPDOWN_WIDTH = 280;
const MIN_DROPDOWN_HEIGHT = 160;
const FALLBACK_DROPDOWN_HEIGHT = 360;

const recentEmojiCategoryMeta = {
  id: 'recent',
  label: 'Recently used',
  icon: '🕘',
} as const;

type EmojiPickerProps = {
  value: string;
  onChange: (emoji: string) => void;
  label?: string | null;
  className?: string;
  renderTrigger?: (props: {
    isOpen: boolean;
    value: string;
    toggleOpen: () => void;
    clearValue: () => void;
  }) => ReactNode;
};

export const EmojiPicker = ({
  value,
  onChange,
  label = 'Icon (optional)',
  className,
  renderTrigger,
}: EmojiPickerProps): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentEmojis, setRecentEmojis] = useState(getRecentEmojis);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: FALLBACK_DROPDOWN_HEIGHT,
  });
  const [isDropdownPositioned, setIsDropdownPositioned] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const categorySectionRefs = useRef<
    Partial<Record<EmojiCategoryId, HTMLDivElement>>
  >({});

  const updateDropdownPosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownHeight =
        dropdownRef.current?.offsetHeight ?? FALLBACK_DROPDOWN_HEIGHT;
      const width = Math.min(
        Math.max(rect.width, MIN_DROPDOWN_WIDTH),
        window.innerWidth - VIEWPORT_MARGIN * 2,
      );
      const left = Math.min(
        Math.max(rect.left, VIEWPORT_MARGIN),
        window.innerWidth - width - VIEWPORT_MARGIN,
      );
      const availableBelow =
        window.innerHeight - rect.bottom - VIEWPORT_MARGIN - DROPDOWN_GAP;
      const availableAbove = rect.top - VIEWPORT_MARGIN - DROPDOWN_GAP;
      const shouldOpenAbove =
        availableBelow < dropdownHeight && availableAbove > availableBelow;
      const maxHeight = Math.max(
        shouldOpenAbove ? availableAbove : availableBelow,
        MIN_DROPDOWN_HEIGHT,
      );
      const height = Math.min(maxHeight, FALLBACK_DROPDOWN_HEIGHT);
      const top = shouldOpenAbove
        ? Math.max(
            VIEWPORT_MARGIN,
            rect.top - Math.min(dropdownHeight, height) - DROPDOWN_GAP,
          )
        : Math.min(
            rect.bottom + DROPDOWN_GAP,
            window.innerHeight -
              Math.min(dropdownHeight, height) -
              VIEWPORT_MARGIN,
          );

      setDropdownPosition({
        top,
        left,
        width,
        height,
      });
      setIsDropdownPositioned(true);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setIsDropdownPositioned(false);
      return;
    }

    updateDropdownPosition();
    inputRef.current?.focus();
  }, [isOpen, updateDropdownPosition, searchQuery]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (containerRef.current?.contains(target)) {
        return;
      }

      if (dropdownRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
      setSearchQuery('');
    };

    const handleScroll = () => {
      updateDropdownPosition();
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen, updateDropdownPosition]);

  const handleSelect = useCallback(
    (emoji: string) => {
      onChange(emoji);
      setRecentEmojis(saveRecentEmoji(emoji));
      setIsOpen(false);
      setSearchQuery('');
    },
    [onChange],
  );

  const clearValue = useCallback(() => {
    onChange('');
    setIsOpen(false);
    setSearchQuery('');
  }, [onChange]);

  const toggleOpen = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  const searchResults = useMemo(() => {
    return searchEmojis(searchQuery);
  }, [searchQuery]);

  const emojisToShow = searchQuery.trim() ? searchResults : [];
  const recentEmojiOptions = useMemo(() => {
    return recentEmojis
      .map(findEmojiOption)
      .filter((item): item is EmojiOption => !!item);
  }, [recentEmojis]);
  const categoriesToShow = useMemo<EmojiCategory[]>(() => {
    if (recentEmojiOptions.length === 0) {
      return emojiCategories;
    }

    return [
      {
        ...recentEmojiCategoryMeta,
        emojis: recentEmojiOptions,
      },
      ...emojiCategories,
    ];
  }, [recentEmojiOptions]);
  const showCategories = !searchQuery.trim();

  const scrollToCategory = useCallback((categoryId: EmojiCategoryId) => {
    categorySectionRefs.current[categoryId]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  const setCategorySectionRef = useCallback(
    (categoryId: EmojiCategoryId) => (element: HTMLDivElement | null) => {
      if (!element) {
        delete categorySectionRefs.current[categoryId];
        return;
      }

      categorySectionRefs.current[categoryId] = element;
    },
    [],
  );

  const renderEmojiButton = useCallback(
    (emoji: EmojiOption): ReactElement => (
      <button
        key={emoji.emoji}
        type="button"
        onClick={() => handleSelect(emoji.emoji)}
        className={classNames(
          'flex size-8 items-center justify-center rounded-8 text-lg leading-none transition-colors hover:bg-surface-hover',
          'font-[Apple_Color_Emoji,Segoe_UI_Emoji,Noto_Color_Emoji,sans-serif]',
          value === emoji.emoji && 'bg-surface-active',
        )}
        title={emoji.label}
      >
        {emoji.emoji}
      </button>
    ),
    [handleSelect, value],
  );

  const renderCategorySection = useCallback(
    (category: EmojiCategory) => {
      return (
        <div key={category.id} ref={setCategorySectionRef(category.id)}>
          <Typography
            type={TypographyType.Footnote}
            className="mb-2 text-text-tertiary"
          >
            {category.label}
          </Typography>
          <div className="grid grid-cols-7 gap-1">
            {category.emojis.map(renderEmojiButton)}
          </div>
        </div>
      );
    },
    [renderEmojiButton, setCategorySectionRef],
  );

  return (
    <div
      ref={containerRef}
      className={classNames(
        'relative flex flex-col',
        label ? 'gap-2' : 'gap-0',
        className,
      )}
    >
      {label ? (
        <Typography bold type={TypographyType.Callout}>
          {label}
        </Typography>
      ) : null}

      <div ref={triggerRef}>
        {renderTrigger ? (
          renderTrigger({ isOpen, value, toggleOpen, clearValue })
        ) : (
          <div className="flex items-center gap-2">
            {value && (
              <Button
                type="button"
                variant={ButtonVariant.Float}
                onClick={clearValue}
                className="!size-10 shrink-0"
              >
                -
              </Button>
            )}

            {value && (
              <div className="flex size-10 items-center justify-center rounded-10 border border-border-subtlest-tertiary bg-surface-float text-xl">
                {value}
              </div>
            )}

            <Button
              type="button"
              variant={ButtonVariant.Float}
              onClick={toggleOpen}
              className="shrink-0"
            >
              {isOpen && 'Close'}
              {!isOpen && value && 'Change'}
              {!isOpen && !value && 'Pick emoji'}
            </Button>
          </div>
        )}
      </div>

      {isOpen && (
        <RootPortal>
          <div
            ref={dropdownRef}
            className="fixed z-[100] flex overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default shadow-2"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              height: `${dropdownPosition.height}px`,
              visibility: isDropdownPositioned ? 'visible' : 'hidden',
            }}
          >
            <div className="flex min-h-0 w-full flex-col">
              <div className="border-b border-border-subtlest-tertiary p-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search emojis..."
                  className="w-full rounded-10 border border-border-subtlest-tertiary bg-surface-float px-3 py-1.5 text-text-primary placeholder:text-text-quaternary focus:border-border-subtlest-secondary focus:outline-none"
                />

                {showCategories && (
                  <div
                    className="mt-2 flex items-center justify-between gap-0.5"
                    aria-label="Emoji categories"
                  >
                    {categoriesToShow.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => scrollToCategory(category.id)}
                        className={classNames(
                          'flex size-7 items-center justify-center rounded-8 text-base leading-none transition-colors hover:bg-surface-hover',
                          'font-[Apple_Color_Emoji,Segoe_UI_Emoji,Noto_Color_Emoji,sans-serif]',
                        )}
                        title={category.label}
                        aria-label={category.label}
                      >
                        {category.icon}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-2">
                {showCategories && (
                  <div className="flex flex-col gap-3">
                    {categoriesToShow.map(renderCategorySection)}
                  </div>
                )}

                {!showCategories && emojisToShow.length > 0 && (
                  <div className="grid grid-cols-7 gap-1">
                    {emojisToShow.map(renderEmojiButton)}
                  </div>
                )}

                {!showCategories && emojisToShow.length === 0 && (
                  <Typography
                    type={TypographyType.Callout}
                    className="py-4 text-center text-text-tertiary"
                  >
                    No emojis found
                  </Typography>
                )}
              </div>
            </div>
          </div>
        </RootPortal>
      )}
    </div>
  );
};

export default EmojiPicker;
