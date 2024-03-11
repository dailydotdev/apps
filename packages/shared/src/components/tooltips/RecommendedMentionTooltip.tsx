import React, { MutableRefObject, ReactElement } from 'react';
import { BaseTooltip } from './BaseTooltip';
import { RecommendedMention } from '../RecommendedMention';
import { UserShortProfile } from '../../lib/user';
import { isTesting } from '../../lib/constants';

interface RecommendedMentionTooltipProps {
  query?: string;
  selected?: number;
  mentions?: UserShortProfile[];
  offset?: number[];
  onMentionClick?: (username: string) => unknown;
  onClickOutside?: () => void;
  appendTo?: () => HTMLElement;
  elementRef: MutableRefObject<HTMLElement>;
}

const EXTRA_SPACES = 26;
const PER_ITEM_HEIGHT = 64;

export function RecommendedMentionTooltip({
  query,
  mentions = [],
  selected = -1,
  offset = [0, 0],
  onMentionClick,
  appendTo,
  elementRef,
  onClickOutside,
}: RecommendedMentionTooltipProps): ReactElement {
  if (isTesting) {
    return null;
  }

  const [offsetX, offsetY] = offset;
  const lines = PER_ITEM_HEIGHT * mentions.length;

  return (
    <BaseTooltip
      appendTo={appendTo || globalThis?.document?.body || 'parent'}
      content={
        <RecommendedMention
          users={typeof query !== 'undefined' && mentions}
          selected={selected}
          onClick={onMentionClick}
        />
      }
      offset={[offsetX, (offsetY + lines + EXTRA_SPACES) * -1]}
      onClickOutside={onClickOutside}
      interactive
      container={{
        className: 'shadow',
        paddingClassName: 'p-0',
        roundedClassName: 'rounded-16',
        bgClassName: 'bg-accent-pepper-subtlest',
      }}
      reference={elementRef}
      showArrow={false}
      placement="top-start"
      visible={typeof query !== 'undefined'}
    />
  );
}
