import type { MutableRefObject, ReactElement } from 'react';
import React, { useRef, useEffect } from 'react';
import classNames from 'classnames';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { Typography, TypographyTag } from '../typography/Typography';

const RecommendedEmojiTooltip = ({
  elementRef,
  search,
  emojiData = [],
  onSelect,
  selected = 0,
  offset = [0, 0],
  onClickOutside,
}: {
  elementRef: MutableRefObject<HTMLElement>;
  offset?: number[];
  search?: string;
  emojiData?: Array<{ name: string; emoji: string }>;
  selected?: number;
  onSelect: (emoji: string) => void;
  onClickOutside?: () => void;
}): ReactElement => {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selectedButton = buttonRefs.current[selected];
    const container = containerRef.current;

    if (selectedButton && container) {
      const buttonTop = selectedButton.offsetTop;
      const buttonHeight = selectedButton.offsetHeight;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;

      if (buttonTop < containerScrollTop) {
        container.scrollTop = buttonTop;
      } else if (
        buttonTop + buttonHeight >
        containerScrollTop + containerHeight
      ) {
        container.scrollTop = buttonTop + buttonHeight - containerHeight;
      }
    }
  }, [selected]);

  if (!search || !emojiData?.length) {
    return null;
  }

  const [offsetX, offsetY] = offset;

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root open={!!emojiData.length}>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            ref={containerRef}
            className="z-tooltip w-70 rounded-16 bg-accent-pepper-subtlest max-h-64 overflow-hidden overflow-y-scroll p-0"
            side="top"
            align="start"
            sideOffset={5}
            onPointerDownOutside={onClickOutside}
            onEscapeKeyDown={onClickOutside}
            style={{
              position: 'absolute',
              left:
                (elementRef.current?.getBoundingClientRect().left || 0) +
                offsetX,
              top:
                (elementRef.current?.getBoundingClientRect().top || 0) +
                offsetY +
                20,
            }}
          >
            {emojiData.map((emoji, index) => (
              <button
                key={emoji.name}
                ref={(el) => {
                  buttonRefs.current[index] = el;
                }}
                onClick={() => onSelect(emoji.emoji)}
                type="button"
                className={classNames(
                  'typo-callout hover:bg-surface-hover flex w-full items-center gap-2 p-2 text-left',
                  selected === index && 'bg-theme-active',
                )}
              >
                <Typography tag={TypographyTag.Span}>{emoji.emoji}</Typography>
                <Typography tag={TypographyTag.Span}>{emoji.name}</Typography>
              </button>
            ))}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

export default RecommendedEmojiTooltip;
