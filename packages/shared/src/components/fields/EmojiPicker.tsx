import type { ReactElement } from 'react';
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

type EmojiPickerProps = {
  value: string;
  onChange: (emoji: string) => void;
  label?: string;
  className?: string;
};

export const EmojiPicker = ({
  value,
  onChange,
  label = 'Icon (optional)',
  className,
}: EmojiPickerProps): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const updateDropdownPosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      inputRef.current?.focus();
    }
  }, [isOpen, updateDropdownPosition]);

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
      className={classNames('relative flex flex-col gap-2', className)}
    >
      <Typography bold type={TypographyType.Callout}>
        {label}
      </Typography>

      <div ref={triggerRef} className="flex items-center gap-2">
        {value && (
          <Button
            type="button"
            variant={ButtonVariant.Float}
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
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
          onClick={() => setIsOpen(!isOpen)}
          className="shrink-0"
        >
          {isOpen && 'Close'}
          {!isOpen && value && 'Change'}
          {!isOpen && !value && 'Pick emoji'}
        </Button>
      </div>

      {isOpen && (
        <div
          className="fixed z-[100] max-h-80 overflow-y-auto rounded-16 border border-border-subtlest-tertiary bg-background-default p-3 shadow-2"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            minWidth: '300px',
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
