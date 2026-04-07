import type { ReactElement, Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import { ListCard } from '../common/list/ListCard';
import type { HighlightCardProps } from './common';
import {
  getHighlightCardContainerHandlers,
  HighlightCardContent,
} from './common';

export const HighlightList = forwardRef(function HighlightList(
  { highlights, onHighlightClick, onReadAllClick }: HighlightCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  return (
    <ListCard
      ref={ref}
      data-testid="highlightItem"
      role={onReadAllClick ? 'button' : undefined}
      tabIndex={onReadAllClick ? 0 : undefined}
      aria-label={onReadAllClick ? 'Open highlights card' : undefined}
      {...getHighlightCardContainerHandlers(onReadAllClick)}
      className={classNames(
        'group overflow-hidden !border-0 !border-t !border-border-subtlest-tertiary !bg-gradient-to-b !from-surface-float !to-background-default !px-4 !py-6',
        onReadAllClick && 'cursor-pointer',
      )}
    >
      <HighlightCardContent
        highlights={highlights}
        onHighlightClick={onHighlightClick}
        onReadAllClick={onReadAllClick}
        variant="list"
      />
    </ListCard>
  );
});
