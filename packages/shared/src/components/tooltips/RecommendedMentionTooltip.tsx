import React, { MutableRefObject, ReactElement } from 'react';
import { BaseTooltip, getShouldLoadTooltip } from './BaseTooltip';
import { RecommendedMention } from '../RecommendedMention';
import { UserShortProfile } from '../../lib/user';

interface RecommendedMentionTooltipProps {
  query?: string;
  selected?: number;
  mentions?: UserShortProfile[];
  offset?: [number, number];
  onMentionClick?: (username: string) => unknown;
  elementRef: MutableRefObject<HTMLElement>;
}

const EXTRA_SPACES = 26;
const CHAR_WIDTH = 7;
const LINE_HEIGHT = 18;
const PER_ITEM_HEIGHT = 64;
const getOffsetPerLine = (row: number) => row * LINE_HEIGHT * -1;
const getOffsetPerChar = (col: number) => col * CHAR_WIDTH;

export function RecommendedMentionTooltip({
  query,
  mentions = [],
  selected = -1,
  offset = [0, 0],
  onMentionClick,
  elementRef,
}: RecommendedMentionTooltipProps): ReactElement {
  if (!getShouldLoadTooltip()) {
    return null;
  }

  const [offsetX, offsetY] = offset;
  const lines = PER_ITEM_HEIGHT * mentions.length * -1;

  return (
    <BaseTooltip
      appendTo={document?.body || 'parent'}
      content={
        <RecommendedMention
          users={typeof query !== 'undefined' && mentions}
          selected={selected}
          onClick={onMentionClick}
        />
      }
      offset={[
        getOffsetPerChar(offsetX),
        getOffsetPerLine(offsetY) + lines + -EXTRA_SPACES,
      ]}
      interactive
      container={{
        className: 'shadow',
        paddingClassName: 'p-0',
        roundedClassName: 'rounded-16',
        bgClassName: 'bg-theme-bg-tertiary',
      }}
      reference={elementRef}
      arrow={false}
      placement="top-start"
      visible={query !== undefined}
    />
  );
}
