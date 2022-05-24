import React, { MutableRefObject, ReactElement } from 'react';
import { BaseTooltip } from './BaseTooltip';
import { RecommendedMention } from '../RecommendedMention';
import { UserShortProfile } from '../../lib/user';
import { CaretOffset } from '../../lib/element';
import { isTesting } from '../../lib/constants';

interface RecommendedMentionTooltipProps {
  query?: string;
  selected?: number;
  mentions?: UserShortProfile[];
  offset?: CaretOffset;
  onMentionClick?: (username: string) => unknown;
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
}: RecommendedMentionTooltipProps): ReactElement {
  if (isTesting) {
    return null;
  }

  const [offsetX, offsetY] = offset;
  const lines = PER_ITEM_HEIGHT * mentions.length;

  return (
    <BaseTooltip
      appendTo={appendTo || document?.body || 'parent'}
      content={
        <RecommendedMention
          users={typeof query !== 'undefined' && mentions}
          selected={selected}
          onClick={onMentionClick}
        />
      }
      offset={[offsetX, (offsetY + lines + EXTRA_SPACES) * -1]}
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
      visible={typeof query !== 'undefined'}
    />
  );
}
