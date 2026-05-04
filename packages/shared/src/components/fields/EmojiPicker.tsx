import type { ReactElement, ReactNode } from 'react';
import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { search as emojiSearch } from 'node-emoji';
import classNames from 'classnames';
import { Button, ButtonVariant } from '../buttons/Button';
import { Typography, TypographyType } from '../typography/Typography';

const COMMON_EMOJIS = [
  '⭐',
  '🚀',
  '💻',
  '🔥',
  '💡',
  '🎯',
  '✨',
  '🛠️',
  '📱',
  '🌐',
  '🔧',
  '⚡',
  '🎨',
  '📊',
  '🔒',
  '☁️',
  '🤖',
  '📦',
  '🧪',
  '🎮',
  '📝',
  '💾',
  '🔍',
  '📈',
  '🏗️',
  '⚙️',
  '🌟',
  '💪',
  '🎉',
  '❤️',
];

const DROPDOWN_GAP = 4;
const VIEWPORT_MARGIN = 12;
const MIN_DROPDOWN_WIDTH = 300;
const MIN_DROPDOWN_HEIGHT = 160;
const FALLBACK_DROPDOWN_HEIGHT = 320;

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
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: FALLBACK_DROPDOWN_HEIGHT,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      const top = shouldOpenAbove
        ? Math.max(
            VIEWPORT_MARGIN,
            rect.top - Math.min(dropdownHeight, maxHeight) - DROPDOWN_GAP,
          )
        : Math.min(
            rect.bottom + DROPDOWN_GAP,
            window.innerHeight -
              Math.min(dropdownHeight, maxHeight) -
              VIEWPORT_MARGIN,
          );

      setDropdownPosition({
        top,
        left,
        width,
        maxHeight,
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      inputRef.current?.focus();
    }
  }, [isOpen, updateDropdownPosition, searchQuery]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
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
    if (!searchQuery.trim()) {
      return [];
    }
    return emojiSearch(searchQuery.toLowerCase()).slice(0, 30);
  }, [searchQuery]);

  const emojisToShow = searchQuery.trim() ? searchResults : [];
  const showCommon = !searchQuery.trim();

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
        <div
          ref={dropdownRef}
          className="fixed z-[100] max-h-80 overflow-y-auto rounded-16 border border-border-subtlest-tertiary bg-background-default p-3 shadow-2"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            maxHeight: `${dropdownPosition.maxHeight}px`,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search emojis..."
            className="mb-3 w-full rounded-10 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 text-text-primary placeholder:text-text-quaternary focus:border-border-subtlest-secondary focus:outline-none"
          />

          {showCommon && (
            <div>
              <Typography
                type={TypographyType.Footnote}
                className="mb-2 text-text-tertiary"
              >
                Popular
              </Typography>
              <div className="flex flex-wrap gap-1">
                {COMMON_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleSelect(emoji)}
                    className={classNames(
                      'flex size-9 items-center justify-center rounded-8 text-xl transition-colors hover:bg-surface-hover',
                      value === emoji && 'bg-surface-active',
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!showCommon && emojisToShow.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {emojisToShow.map((result) => (
                <button
                  key={result.name}
                  type="button"
                  onClick={() => handleSelect(result.emoji)}
                  className={classNames(
                    'flex size-9 items-center justify-center rounded-8 text-xl transition-colors hover:bg-surface-hover',
                    value === result.emoji && 'bg-surface-active',
                  )}
                  title={result.name}
                >
                  {result.emoji}
                </button>
              ))}
            </div>
          )}

          {!showCommon && emojisToShow.length === 0 && (
            <Typography
              type={TypographyType.Callout}
              className="py-4 text-center text-text-tertiary"
            >
              No emojis found
            </Typography>
          )}
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;
