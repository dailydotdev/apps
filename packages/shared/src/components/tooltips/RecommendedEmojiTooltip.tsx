import type { MutableRefObject, ReactElement } from 'react';
import React from 'react';
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
  if (!search || !emojiData?.length) {
    return null;
  }

  const [offsetX, offsetY] = offset;

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root open={!!emojiData.length}>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            className="z-tooltip max-h-64 w-70 overflow-hidden rounded-16 bg-accent-pepper-subtlest p-0"
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
                onClick={() => onSelect(emoji.emoji)}
                type="button"
                className={classNames(
                  'flex w-full items-center gap-2 p-2 text-left typo-callout hover:bg-surface-hover',
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
